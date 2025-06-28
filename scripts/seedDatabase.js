const { PrismaClient } = require('@prisma/client');
const { categoriesPageData, sampleProducts, sampleUser, sampleReviews } = require('./categoriesSeedData');
const prisma = new PrismaClient();

async function seedCategoriesDatabase() {
  try {
    console.log('Starting categories page database seeding...');

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

    console.log('Categories page database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding categories database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategoriesDatabase();
