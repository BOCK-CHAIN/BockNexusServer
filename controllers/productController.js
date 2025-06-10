const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const getProductsByCategoryId = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const products = await prisma.product.findMany({
            where: { categoryId: Number(categoryId) }
        });
        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found for this category"
            });
        }
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
            error: error.message,
        });
    }
};

module.exports = { getProductsByCategoryId };
