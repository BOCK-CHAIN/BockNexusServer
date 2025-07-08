const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllCategories = async (req, res) => {
    try {
        // Add cache headers for better performance
        res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                image_uri: true,
                _count: {
                    select: {
                        products: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories",
            error: error.message,
        });
    }
};

module.exports = { getAllCategories };
