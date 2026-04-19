"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createOrder(tableId: string | number, items: any[]) {
  try {
    const tableIdNum = typeof tableId === 'string' ? parseInt(tableId) : tableId;
    
    // Ensure active session
    const sessionResult = await ensureActiveSession(tableIdNum);
    if (!sessionResult.success || !sessionResult.session) {
        return { success: false, error: sessionResult.error || "فشل في بدء جلسة الطلب" };
    }

    const session = sessionResult.session;

    // Create the order with fall-back for un-generated prisma client
    let order;
    try {
        order = await (prisma as any).order.create({
            data: {
                session_id: session.id,
                status: "Pending",
                items: {
                    create: await Promise.all(items.map(async (item) => {
                        const menuItem = await (prisma as any).menuItem.findUnique({
                            where: { id: item.id },
                            select: { cost_price: true, name: true }
                        })
                        return {
                            menu_item_id: item.id,
                            quantity: item.quantity,
                            price_at_time: item.price,
                            cost_at_time: menuItem?.cost_price || 0,
                            item_name: menuItem?.name || "صنف غير معروف",
                            notes: item.notes || ""
                        }
                    }))
                }
            }
        })
    } catch (prismaError: any) {
        console.error("Primary order creation failed, trying fallback...", prismaError.message);
        // Fallback for old prisma client that doesn't have 'item_name'
        order = await (prisma as any).order.create({
            data: {
                session_id: session.id,
                status: "Pending",
                items: {
                    create: items.map((item) => ({
                        menu_item_id: item.id,
                        quantity: item.quantity,
                        price_at_time: item.price,
                        notes: item.notes || ""
                    }))
                }
            }
        })
    }

    revalidatePath(`/menu/${tableId}`)
    revalidatePath("/admin/kitchen")
    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error("Final Order creation error:", error)
    return { success: false, error: "فشل في إنشاء الطلب: " + (error.message || "") }
  }
}

export async function createDeliveryOrder(items: any[], customerDetails: { name: string, phone: string, address: string, locationUrl?: string }) {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: "السلة فارغة" };
    }

    // Prepare order items with proper types
    const orderItemsData = await Promise.all(items.map(async (item) => {
        const menuItem = await (prisma as any).menuItem.findUnique({
            where: { id: Number(item.id) },
            select: { cost_price: true, name: true }
        });
        
        return {
            menu_item_id: Number(item.id),
            quantity: Number(item.quantity),
            price_at_time: Number(item.price),
            cost_at_time: Number(menuItem?.cost_price || 0),
            item_name: menuItem?.name || item.name || "صنف غير معروف",
            notes: item.notes || ""
        };
    }));

    let order;
    try {
        // Primary Attempt with all new fields
        order = await (prisma as any).order.create({
            data: {
                type: "Delivery",
                status: "Pending",
                customer_name: customerDetails.name,
                customer_phone: customerDetails.phone,
                customer_address: customerDetails.address,
                customer_location_url: customerDetails.locationUrl || null,
                items: {
                    create: orderItemsData
                }
            }
        });
    } catch (prismaError: any) {
        console.error("Primary creation failed, trying extreme fallback with notes append...", prismaError.message);
        
        // Final fallback: also append location URL to address as a safety measure
        const safeAddress = customerDetails.locationUrl 
            ? `${customerDetails.address} \n(الموقع: ${customerDetails.locationUrl})`
            : customerDetails.address;

        order = await (prisma as any).order.create({
            data: {
                type: "Delivery",
                status: "Pending",
                customer_name: customerDetails.name,
                customer_phone: customerDetails.phone,
                customer_address: safeAddress,
                items: {
                    create: items.map(item => ({
                        menu_item_id: Number(item.id),
                        quantity: Number(item.quantity),
                        price_at_time: Number(item.price),
                        item_name: item.name || "صنف غير معروف",
                        notes: item.notes || ""
                    }))
                }
            }
        });
    }

    revalidatePath("/admin/kitchen");
    revalidatePath("/admin/delivery");
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Final Order Error:", error);
    return { success: false, error: "فشل في إنشاء الطلب: " + (error.message || "خطأ غير معروف") };
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  try {
    await (prisma as any).order.update({
      where: { id: orderId },
      data: { status }
    })
    revalidatePath("/admin/kitchen")
    revalidatePath("/admin/waiter")
    return { success: true }
  } catch (error) {
    return { success: false, error: "فشل في تحديث حالة الطلب" }
  }
}

export async function closeSession(sessionId: number) {
  try {
    await (prisma as any).customerSession.update({
      where: { id: sessionId },
      data: { 
        status: "Closed",
        closed_at: new Date()
      }
    })
    revalidatePath("/admin/waiter")
    return { success: true }
  } catch (error) {
    return { success: false, error: "فشل في إنهاء الجلسة" }
  }
}

export async function requestBill(tableId: string) {
  try {
    const tableIdNum = parseInt(tableId)
    const session = await (prisma as any).customerSession.findFirst({
      where: { 
        table: { table_number: tableIdNum },
        status: "Active"
      },
      include: {
        orders: {
          include: { items: true }
        }
      }
    })

    if (!session) return { success: false, error: "لم يتم العثور على جلسة نشطة" }

    // Check if all orders are served
    const allServed = session.orders.every((order: any) => order.status === "Served")
    if (!allServed) {
      return { success: false, error: "لا يمكنك طلب الحساب حتى يتم تقديم جميع الطلبات" }
    }

    await (prisma as any).customerSession.update({
      where: { id: session.id },
      data: { status: "BillRequested" }
    })

    revalidatePath("/admin/waiter")
    return { success: true }
  } catch (error) {
    return { success: false, error: "فشل في طلب الحساب" }
  }
}

export async function claimTask(type: 'Serve' | 'Bill' | 'Clean', id: number, waiterId: string) {
    try {
        if (type === 'Serve') {
            await (prisma as any).order.update({
                where: { id },
                data: { waiter_id: waiterId }
            });
        } else if (type === 'Bill') {
            await (prisma as any).customerSession.update({
                where: { id },
                data: { bill_waiter_id: waiterId }
            });
        } else if (type === 'Clean') {
            await (prisma as any).customerSession.update({
                where: { id },
                data: { cleaning_waiter_id: waiterId }
            });
        }
        revalidatePath("/admin/waiter");
        return { success: true };
    } catch (error) {
        return { success: false, error: "فشل في استلام المهمة" };
    }
}

export async function ensureActiveSession(tableNumber: number) {
    try {
        const table = await prisma.table.findUnique({
            where: { table_number: tableNumber }
        });

        if (!table) return { success: false, error: "الطاولة غير موجودة" };

        // Search for an existing active session
        let session = await (prisma as any).customerSession.findFirst({
            where: {
                table: { table_number: tableNumber },
                status: { in: ["Active", "BillRequested", "ReceiptReady"] }
            }
        });

        // If no active/pending session, and table is not explicitly blocked, create one
        if (!session) {
            session = await (prisma as any).customerSession.create({
                data: {
                    table_id: table.id,
                    status: "Active"
                }
            });
            
            // Also update table status
            await prisma.table.update({
                where: { id: table.id },
                data: { status: "Occupied" }
            });
        }

        return { success: true, session };
    } catch (error) {
        console.error("ensureActiveSession error:", error);
        return { success: false, error: "فشل في التحقق من الجلسة" };
    }
}

export async function serveOrder(orderId: number) {
    try {
        await (prisma as any).order.update({
            where: { id: orderId },
            data: { status: "Served" }
        });
        revalidatePath("/admin/waiter");
        return { success: true };
    } catch (error) {
        return { success: false, error: "فشل في تحديث حالة الطلب" };
    }
}

export async function printReceipt(sessionId: number) {
    try {
        await (prisma as any).customerSession.update({
            where: { id: sessionId },
            data: { status: "ReceiptReady" }
        });
        revalidatePath("/admin/cashier");
        revalidatePath("/admin/waiter");
        return { success: true };
    } catch (error) {
        console.error("Print receipt error:", error);
        return { success: false, error: "فشل في طباعة الوصل" };
    }
}

export async function markPaid(sessionId: number) {
    try {
        await (prisma as any).customerSession.update({
            where: { id: Number(sessionId) },
            data: { status: "CleaningRequired" }
        });
        revalidatePath("/admin/cashier");
        revalidatePath("/admin/waiter");
        return { success: true };
    } catch (error) {
        console.error("Mark paid error:", error);
        return { success: false, error: "فشل في تأكيد الدفع" };
    }
}

export async function markCleaned(sessionId: number) {
    try {
        const session = await (prisma as any).customerSession.findUnique({
            where: { id: sessionId },
            select: { table_id: true }
        });

        await (prisma as any).customerSession.update({
            where: { id: sessionId },
            data: { 
                status: "Closed",
                closed_at: new Date()
            }
        });

        if (session?.table_id) {
            await prisma.table.update({
                where: { id: session.table_id },
                data: { status: "Available" }
            });
        }

        revalidatePath("/admin/waiter");
        revalidatePath("/admin/tables");
        return { success: true };
    } catch (error) {
        return { success: false, error: "فشل في إنهاء المهمة" };
    }
}

export async function getCustomerOrders(tableId: string | number) {
  try {
    const tableIdNum = typeof tableId === 'string' ? parseInt(tableId) : tableId;
    
    // For DineIn orders, we check session
    const session = await (prisma as any).customerSession.findFirst({
      where: { 
        table: { table_number: tableIdNum },
        status: { in: ["Active", "BillRequested", "ReceiptReady"] }
      },
      include: {
        orders: {
          where: { type: "DineIn" }, // Only show dine-in orders here
          include: {
            items: {
              include: { menuItem: true }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!session) return { success: true, orders: [] };

    return { 
        success: true, 
        orders: session.orders.map((o: any) => ({
            ...o,
            items: o.items.map((i: any) => ({
                ...i,
                price_at_time: Number(i.price_at_time),
                cost_at_time: Number(i.cost_at_time),
                menuItem: i.menuItem ? {
                    ...i.menuItem,
                    price: Number(i.menuItem.price),
                    cost_price: Number(i.menuItem.cost_price)
                } : null
            }))
        }))
    };
  } catch (error) {
    return { success: false, error: "فشل في جلب الطلبات" };
  }
}

export async function getDeliveryOrders(phone: string) {
  try {
    let ordersRaw;
    try {
        // Primary Attempt: Include driver info
        ordersRaw = await (prisma as any).order.findMany({
            where: { 
                customer_phone: phone,
                type: "Delivery"
            },
            include: {
                items: {
                    include: { menuItem: true }
                },
                driver: {
                    select: {
                        name: true,
                        phone: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    } catch (e) {
        console.warn("getDeliveryOrders primary fetch failed (likely schema sync delay), using fallback...");
        // Fallback: Fetch without driver info
        ordersRaw = await (prisma as any).order.findMany({
            where: { 
                customer_phone: phone,
                type: "Delivery"
            },
            include: {
                items: {
                    include: { menuItem: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Manually fetch driver info for each order if driver_id exists
        for (let order of ordersRaw) {
            if (order.driver_id) {
                try {
                    const driverData: any[] = await prisma.$queryRaw`SELECT name, phone FROM "User" WHERE id = ${order.driver_id} LIMIT 1`;
                    if (driverData.length > 0) {
                        order.driver = driverData[0];
                    }
                } catch (err) {
                    console.error("Manual driver fetch failed:", err);
                }
            }
        }
    }

    return { 
        success: true, 
        orders: (ordersRaw || []).map((o: any) => ({
            ...o,
            items: (o.items || []).map((i: any) => ({
                ...i,
                price_at_time: Number(i.price_at_time),
                cost_at_time: Number(i.cost_at_time),
                menuItem: i.menuItem ? {
                    ...i.menuItem,
                    price: Number(i.menuItem.price),
                    cost_price: Number(i.menuItem.cost_price)
                } : null
            }))
        }))
    };
  } catch (error: any) {
    console.error("Critical fetch error in getDeliveryOrders:", error.message);
    return { success: false, error: "فشل في جلب طلبات التوصيل" };
  }
}

export async function getActiveOrders() {
  try {
    const ordersRaw = await (prisma as any).order.findMany({
      where: {
        status: { in: ["Pending", "Preparing", "Ready"] }
      },
      include: {
        session: { include: { table: true } },
        items: { include: { menuItem: true } }
      },
      orderBy: { created_at: "asc" }
    });

    return { 
        success: true, 
        orders: ordersRaw.map((o: any) => ({
            ...o,
            items: o.items.map((i: any) => ({
                ...i,
                price_at_time: Number(i.price_at_time),
                cost_at_time: Number(i.cost_at_time),
                menuItem: i.menuItem ? {
                    ...i.menuItem,
                    price: Number(i.menuItem.price),
                    cost_price: Number(i.menuItem.cost_price)
                } : null
            }))
        }))
    };
  } catch (error) {
    return { success: false, error: "فشل في جلب الطلبات" };
  }
}

export async function getCashierSessions() {
  try {
    const sessionsRaw = await (prisma as any).customerSession.findMany({
      where: {
        status: {
          in: ["BillRequested", "ReceiptReady", "Active"]
        }
      },
      include: {
        table: true,
        orders: {
          include: {
            items: {
              include: { menuItem: true }
            }
          }
        }
      },
      orderBy: { created_at: "asc" }
    });

    return sessionsRaw.map((session: any) => ({
      ...session,
      orders: session.orders.map((order: any) => ({
        ...order,
        items: order.items.map((item: any) => ({
          ...item,
          price_at_time: Number(item.price_at_time),
          cost_at_time: Number(item.cost_at_time),
          menuItem: item.menuItem ? {
            ...item.menuItem,
            price: Number(item.menuItem.price),
            cost_price: Number(item.menuItem.cost_price)
          } : null
        }))
      }))
    }));
  } catch (error) {
    console.error("Fetch cashier sessions error:", error);
    return [];
  }
}

export async function getWaiterUpdates() {
    try {
        const [tablesRaw, readyOrdersRaw, billTasksRaw, cleanTasksRaw] = await Promise.all([
            prisma.table.findMany({
                include: {
                    sessions: {
                        where: { 
                            status: { in: ["Active", "BillRequested", "ReceiptReady", "CleaningRequired"] as any } 
                        },
                        include: {
                            orders: {
                                include: {
                                    items: { include: { menuItem: true } }
                                }
                            }
                        }
                    }
                },
                orderBy: { table_number: "asc" }
            }),
            (prisma as any).order.findMany({
                where: { 
                    status: "Ready",
                    type: "DineIn" 
                },
                include: {
                    session: { include: { table: true } },
                    items: { include: { menuItem: true } }
                }
            }),
            (prisma as any).customerSession.findMany({
                where: { status: "ReceiptReady" as any },
                include: { table: true }
            }),
            (prisma as any).customerSession.findMany({
                where: { status: "CleaningRequired" as any },
                include: { table: true }
            })
        ]);

        const tables = tablesRaw.map(table => ({
            ...table,
            sessions: table.sessions.map(s => ({
                ...s,
                orders: s.orders.map(o => ({
                    ...o,
                    items: o.items.map((i: any) => ({
                        ...i,
                        price_at_time: Number(i.price_at_time),
                        cost_at_time: Number(i.cost_at_time),
                        menuItem: i.menuItem ? {
                            ...i.menuItem,
                            price: Number(i.menuItem.price),
                            cost_price: Number(i.menuItem.cost_price)
                        } : null
                    }))
                }))
            }))
        }));

        const readyOrders = readyOrdersRaw.map((o: any) => ({
            ...o,
            items: o.items.map((i: any) => ({
                ...i,
                price_at_time: Number(i.price_at_time),
                cost_at_time: Number(i.cost_at_time),
                menuItem: i.menuItem ? {
                    ...i.menuItem,
                    price: Number(i.menuItem.price),
                    cost_price: Number(i.menuItem.cost_price)
                } : null
            }))
        }));

        const formatSession = (s: any) => ({
            id: s.id,
            table_id: s.table_id,
            status: s.status,
            created_at: s.created_at.toISOString(),
            closed_at: s.closed_at?.toISOString() || null,
            bill_waiter_id: s.bill_waiter_id,
            cleaning_waiter_id: s.cleaning_waiter_id,
            table: s.table
        });

        return { 
            success: true, 
            tables, 
            readyOrders, 
            billTasks: billTasksRaw.map(formatSession), 
            cleanTasks: cleanTasksRaw.map(formatSession) 
        };
    } catch (error) {
        console.error("Waiter updates fetch error:", error);
        return { success: false, error: "فشل في جلب التحديثات" };
    }
}

export async function getClosedSessions() {
    try {
        const sessionsRaw = await (prisma as any).customerSession.findMany({
            where: { status: "Closed" },
            include: {
                table: true,
                orders: {
                    include: {
                        items: { include: { menuItem: true } },
                        driver: { select: { name: true } }
                    }
                }
            },
            orderBy: { closed_at: "desc" }
        });

        return sessionsRaw.map((session: any) => ({
            ...session,
            orders: session.orders.map((order: any) => ({
                ...order,
                items: order.items.map((item: any) => ({
                    ...item,
                    price_at_time: Number(item.price_at_time),
                    cost_at_time: Number(item.cost_at_time),
                    menuItem: item.menuItem ? {
                        ...item.menuItem,
                        price: Number(item.menuItem.price),
                        cost_price: Number(item.menuItem.cost_price)
                    } : null
                }))
            }))
        }));
    } catch (error) {
        console.error("Fetch closed sessions error:", error);
        return [];
    }
}

export async function deleteSession(sessionId: number) {
    try {
        await (prisma as any).customerSession.delete({
            where: { id: sessionId }
        });
        revalidatePath("/admin/archive");
        return { success: true };
    } catch (error) {
        return { success: false, error: "فشل في حذف السجل" };
    }
}

export async function claimDeliveryOrder(orderId: number, driverId: string) {
    try {
        await (prisma as any).order.update({
            where: { id: orderId },
            data: { 
                driver_id: driverId,
                status: "Shipped"
            }
        });
        revalidatePath("/admin/delivery");
        revalidatePath("/admin/kitchen");
        return { success: true };
    } catch (error) {
        return { success: false, error: "فشل في استلام طلب التوصيل" };
    }
}

export async function markOrderDelivered(orderId: number) {
    try {
        await (prisma as any).order.update({
            where: { id: orderId },
            data: { status: "Delivered" }
        });
        revalidatePath("/admin/delivery");
        revalidatePath("/admin/archive");
        return { success: true };
    } catch (error) {
        return { success: false, error: "فشل في تحديث حالة التوصيل" };
    }
}

export async function getDriverUpdates(driverId: string) {
    try {
        const [availableOrdersRaw, myActiveOrdersRaw] = await Promise.all([
            (prisma as any).order.findMany({
                where: { 
                    type: "Delivery",
                    status: "Ready",
                    driver_id: null
                },
                include: { items: { include: { menuItem: true } } },
                orderBy: { created_at: "asc" }
            }),
            (prisma as any).order.findMany({
                where: { 
                    driver_id: driverId,
                    status: "Shipped"
                },
                include: { items: { include: { menuItem: true } } },
                orderBy: { created_at: "asc" }
            })
        ]);

        const formatOrders = (orders: any[]) => orders.map(o => ({
            ...o,
            items: o.items.map((i: any) => ({
                ...i,
                price_at_time: Number(i.price_at_time),
                cost_at_time: Number(i.cost_at_time),
                menuItem: i.menuItem ? {
                    ...i.menuItem,
                    price: Number(i.menuItem.price),
                    cost_price: Number(i.menuItem.cost_price)
                } : null
            }))
        }));

        return { 
            success: true, 
            availableOrders: formatOrders(availableOrdersRaw), 
            myOrders: formatOrders(myActiveOrdersRaw) 
        };
    } catch (error) {
        return { success: false, error: "فشل في جلب تحديثات الديليفري" };
    }
}
