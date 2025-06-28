const { PrismaClient } = require('@prisma/client');
const { categoriesData, productData } = require('./seedData');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedDatabase() {
    try {
        // Delete existing data
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();

        // Insert categories
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

        // Insert products with category IDs
        await prisma.product.createMany({
            data: productData.map(product => {
                // Remove the 'category' field, only use categoryId and other fields
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

        console.log('DATABASE SEEDED SUCCESSFULLY');
    } catch (error) {
        console.log('Error in seeding database ->', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedDatabase();
// This script seeds the database with initial data for categories and products.
//node seedScript.js is used to run this script.
