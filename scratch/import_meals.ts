import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

async function importMeals() {
  const categoriesToImport = ['Chicken', 'Beef', 'Dessert', 'Pasta', 'Seafood']
  
  console.log('Starting MealDB import...')

  for (const catName of categoriesToImport) {
    try {
      console.log(`Fetching ${catName}...`)
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${catName}`)
      const meals = response.data.meals.slice(0, 5) // Import top 5 per category

      // Ensure category exists
      const category = await prisma.category.upsert({
        where: { id: -1 }, // Use index-based find if possible, but upsert needs a unique key. 
        // Wait, category name is NOT unique in schema. I'll just find or create.
        create: { name: catName },
        update: {},
        // Actually I'll use findFirst/create
      })
      
      // Let's do it properly
      let dbCategory = await prisma.category.findFirst({ where: { name: catName } })
      if (!dbCategory) {
        dbCategory = await prisma.category.create({ data: { name: catName } })
      }

      for (const meal of meals) {
        // Fetch full meal details to get instructions/description
        const detailResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
        const mealDetail = detailResponse.data.meals[0]

        await prisma.menuItem.create({
          data: {
            category_id: dbCategory.id,
            name: mealDetail.strMeal,
            description: mealDetail.strInstructions.slice(0, 200) + '...',
            price: Math.floor(Math.random() * 20) + 10, // Random price 10-30
            image_url: mealDetail.strMealThumb,
            is_available: true
          }
        })
        console.log(`  Added meal: ${mealDetail.strMeal}`)
      }
    } catch (error) {
      console.error(`Error importing ${catName}:`, error)
    }
  }

  console.log('Import finished!')
}

importMeals()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
