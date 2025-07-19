const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                productSizes: true,
                reviews: {
                    include: {
                        user: true
                    }
                }
            }
        });
        
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
            error: error.message,
        });
    }
};

// Get single product by ID
const getProductById = async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(productId) },
            include: {
                category: true,
                productSizes: true,
                reviews: {
                    include: {
                        user: true
                    }
                }
            }
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve product",
            error: error.message,
        });
    }
};

// Get products by category ID
const getProductsByCategoryId = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    try {
        const products = await prisma.product.findMany({
            where: { categoryId },
            select: {
                id: true,
                name: true,
                image_uri: true,
                price: true,
                description: true,
                categoryId: true,
                sizeType: true,
                reviews: {
                    include: {
                        user: true
                    }
                },
                productSizes: {
                    select : {  
                        id: true,
                        productId: true,
                        size: true,
                        stock: true,
                    },
                    orderBy: {
                        sortOrder: 'asc'
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found for this category"
            });
        }
        res.status(200).json({
            success: true,
            data: products,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
            error: error.message,
        });
    }
};

// Get random products
const getRandomProducts = async (req, res) => {
    try{
        const products = await prisma.$queryRaw`
            SELECT * FROM "Product"
            ORDER BY RANDOM()
            LIMIT 10;
        `;

        res.status(200).json({
        success: true,
        data: products,
        });

    }catch (err) {
        console.error('Error fetching random products:', err);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve random products",
            error: err.message,
        });
    }
};


module.exports = { 
    getAllProducts,
    getProductById,
    getProductsByCategoryId,
    getRandomProducts
};