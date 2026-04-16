const { getAdminStats } = require('../src/app/actions/financials');

async function testStats() {
    try {
        const result = await getAdminStats();
        console.log("Stats Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testStats();
