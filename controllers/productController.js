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

// Filter products by category, color, size, brand, and price range
const getFilterProducts = async (req, res) => {
    try {
        const { categoryId, color, size, brand, minPrice, maxPrice } = req.query;
        const where = {};

        if (categoryId) where.categoryId = Number(categoryId);
        if (color) where.color = color;
        if (brand) where.brand = brand;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // For size filter products that have at least one ProductSize with the given size
        let products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                productSizes: true,
                reviews: {
                    include: { user: true }
                }
            }
        });

        if (size) {
            products = products.filter(product =>
                product.productSizes.some(ps => ps.size === size)
            );
        }

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to filter products",
            error: error.message,
        });
    }
};

// Get available brands for a category
const getBrandsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: 'categoryId is required' });
        }
        const brands = await prisma.product.findMany({
            where: { categoryId: Number(categoryId), brand: { not: null } },
            select: { brand: true },
            distinct: ['brand']
        });
        res.status(200).json({
            success: true,
            data: brands.map(b => b.brand)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch brands', error: error.message });
    }
};

// Get available colours for a category
const getColoursByCategory = async (req, res) => {
    try {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: 'categoryId is required' });
        }
        const colours = await prisma.product.findMany({
            where: { categoryId: Number(categoryId), color: { not: null } },
            select: { color: true },
            distinct: ['color']
        });
        res.status(200).json({
            success: true,
            data: colours.map(c => c.color)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch colours', error: error.message });
    }
};

// Get available sizes for a category
const getSizesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: 'categoryId is required' });
        }
        // Get all product IDs in the category
        const products = await prisma.product.findMany({
            where: { categoryId: Number(categoryId) },
            select: { id: true }
        });
        const productIds = products.map(p => p.id);
        if (productIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }
        // Get unique sizes from ProductSize
        const sizes = await prisma.productSize.findMany({
            where: { productId: { in: productIds } },
            select: { size: true },
            distinct: ['size']
        });
        res.status(200).json({
            success: true,
            data: sizes.map(s => s.size)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch sizes', error: error.message });
    }
};

// Search products by keyword
const getSearchProducts = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === "") {
            return res.status(400).json({ success: false, message: 'Query parameter is required' });
        }
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                category: true,
                productSizes: true,
                reviews: { include: { user: true } }
            }
        });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to search products', error: error.message });
    }
};


module.exports = { 
    getAllProducts,
    getProductById,
    getProductsByCategoryId,
    getRandomProducts,
    getFilterProducts,
    getBrandsByCategory,
    getColoursByCategory,
    getSizesByCategory,
    getSearchProducts
};