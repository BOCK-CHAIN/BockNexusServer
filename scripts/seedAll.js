const { PrismaClient } = require('@prisma/client');
const { categoriesData, productData } = require('../seedData');
const { categoriesPageData, sampleProducts, sampleUser, sampleReviews } = require('./categoriesSeedData');
const prisma = new PrismaClient();

async function seedHomePageData() {
  try {
    console.log('🌐 Starting home page data seeding...');

    // Insert categories for home page
    const categories = await prisma.category.createMany({
      data: categoriesData.map(({ name, image_uri, address, createdAt, updatedAt }) => ({
        name,
        image_uri,
        address,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        updatedAt: updatedAt ? new Date(updatedAt) : undefined,
      })),
      skipDuplicates: true
    });

    // Fetch categories to map names to IDs
    const allCategories = await prisma.category.findMany();
    const categoryMap = allCategories.reduce((map, category) => {
      map[category.name] = category.id;
      return map;
    }, {});

    // Insert products for home page
    await prisma.product.createMany({
      data: productData.map(product => {
        const { category, ...rest } = product;
        return {
          ...rest,
          categoryId: categoryMap[product.category],
          createdAt: product.createdAt ? new Date(product.createdAt) : undefined,
          updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
        };
      }),
      skipDuplicates: true
    });

    console.log('✅ Home page data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding home page data:', error);
  }
}

async function seedCategoriesPageData() {
  try {
    console.log('📂 Starting categories page data seeding...');

    // Create categories for categories page
    const createdCategories = [];
    for (const categoryData of categoriesPageData) {
      // Check if category already exists
      let category = await prisma.category.findUnique({
        where: { name: categoryData.name }
      });

      if (!category) {
        // Create new category
        category = await prisma.category.create({
          data: categoryData
        });
        console.log(`Category created: ${category.name}`);
      } else {
        // Update existing category
        category = await prisma.category.update({
          where: { id: category.id },
          data: {
            image_uri: categoryData.image_uri,
            address: categoryData.address
          }
        });
        console.log(`Category updated: ${category.name}`);
      }
      createdCategories.push(category);
    }

    // Create sample products for categories page
    for (const productData of sampleProducts) {
      const category = createdCategories.find(c => c.name === productData.category);
      if (category) {
        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            name: productData.name,
            categoryId: category.id
          }
        });

        let product;
        if (existingProduct) {
          // Update existing product
          product = await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              image_uri: productData.image_uri,
              price: productData.price,
              ar_uri: productData.ar_uri,
              description: productData.description,
            }
          });
        } else {
          // Create new product
          product = await prisma.product.create({
            data: {
              name: productData.name,
              image_uri: productData.image_uri,
              price: productData.price,
              ar_uri: productData.ar_uri,
              description: productData.description,
              categoryId: category.id,
            }
          });
        }

        console.log(`Product created/updated: ${product.name}`);

        // Create product sizes
        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const stocks = [5, 10, 15, 8, 3, 2];

        for (let i = 0; i < sizes.length; i++) {
          await prisma.productSize.upsert({
            where: {
              productId_size: {
                productId: product.id,
                size: sizes[i]
              }
            },
            update: {
              stock: stocks[i]
            },
            create: {
              productId: product.id,
              size: sizes[i],
              stock: stocks[i],
            },
          });
        }
        console.log('Product sizes created/updated');
      }
    }

    // Create sample user
    const user = await prisma.user.upsert({
      where: { phone: sampleUser.phone },
      update: {},
      create: sampleUser,
    });

    console.log('Sample user created/updated');

    // Create sample reviews
    const fashionProduct = await prisma.product.findFirst({
      where: { name: 'Premium Cotton T-Shirt' }
    });

    if (fashionProduct) {
      for (const reviewData of sampleReviews) {
        // Check if review already exists
        const existingReview = await prisma.review.findFirst({
          where: {
            userId: user.id,
            productId: fashionProduct.id,
            comment: reviewData.comment
          }
        });

        if (!existingReview) {
          await prisma.review.create({
            data: {
              rating: reviewData.rating,
              comment: reviewData.comment,
              userId: user.id,
              productId: fashionProduct.id,
            }
          });
        }
      }
      console.log('Sample reviews created/updated');
    }

    console.log('✅ Categories page data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories page data:', error);
  }
}

async function seedAllData() {
  try {
    console.log('🚀 Starting complete database seeding...');
    
    await seedHomePageData();
    await seedCategoriesPageData();
    
    console.log('🎉 Complete database seeding finished successfully!');
  } catch (error) {
    console.error('❌ Error in complete seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'home':
    seedHomePageData().finally(() => prisma.$disconnect());
    break;
  case 'categories':
    seedCategoriesPageData().finally(() => prisma.$disconnect());
    break;
  case 'all':
  default:
    seedAllData();
    break;
}

// Usage instructions
if (!command || args.includes('--help')) {
  console.log(`
📚 Database Seeding Scripts

Usage:
  node scripts/seedAll.js [command]

Commands:
  home       - Seed only home page data (from seedData.js)
  categories - Seed only categories page data (from categoriesSeedData.js)
  all        - Seed both home page and categories page data (default)

Examples:
  node scripts/seedAll.js home
  node scripts/seedAll.js categories
  node scripts/seedAll.js all
  node scripts/seedAll.js --help

Note: Each script uses upsert operations, so running multiple times is safe.
  `);
} 