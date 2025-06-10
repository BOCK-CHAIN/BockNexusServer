const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { products: true }
        });
        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories",
            error: error.message,
        });
    }
};

module.exports = { getAllCategories };
