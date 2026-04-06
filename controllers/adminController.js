const prisma = require('../lib/prisma');

// Get all products for React Admin
const getAllProductsForAdmin = async (req, res) => {
    try {
        const { page = 1, perPage = 10, sortField, sortOrder = 'ASC' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(perPage);
        
        const orderBy = sortField ? { [sortField]: sortOrder.toLowerCase() } : { id: 'asc' };
        
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                skip,
                take: parseInt(perPage),
                orderBy,
                include: {
                    category: true,
                    productSizes: true,
                    _count: {
                        select: {
                            reviews: true,
                            cartItems: true
                        }
                    }
                }
            }),
            prisma.product.count()
        ]);
        
        res.status(200).json({
            data: products,
            total,
            page: parseInt(page),
            perPage: parseInt(perPage)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
            error: error.message,
        });
    }
};

// Get single product for React Admin
const getProductForAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                category: true,
                productSizes: {
                    orderBy: {
                        sortOrder: 'asc'
                    }
                },
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
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve product",
            error: error.message,
        });
    }
};

// Create new product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            image_uri,
            price,
            ar_uri,
            description,
            categoryId,
            sizeType = 'NONE',
            color,
            brand
        } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                image_uri,
                price: parseFloat(price),
                ar_uri,
                description,
                categoryId: parseInt(categoryId),
                sizeType,
                color,
                brand
            },
            include: {
                category: true,
                productSizes: true
            }
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message,
        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const {
            name,
            image_uri,
            price,
            ar_uri,
            description,
            categoryId,
            sizeType,
            color,
            brand
        } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (image_uri !== undefined) updateData.image_uri = image_uri;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (ar_uri !== undefined) updateData.ar_uri = ar_uri;
        if (description !== undefined) updateData.description = description;
        if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
        if (sizeType !== undefined) updateData.sizeType = sizeType;
        if (color !== undefined) updateData.color = color;
        if (brand !== undefined) updateData.brand = brand;

        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: updateData,
            include: {
                category: true,
                productSizes: true
            }
        });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message,
        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        // First delete related records
        await prisma.cartItem.deleteMany({
            where: { productId: Number(id) }
        });

        await prisma.wishlistItem.deleteMany({
            where: { productId: Number(id) }
        });

        await prisma.review.deleteMany({
            where: { productId: Number(id) }
        });

        await prisma.productSize.deleteMany({
            where: { productId: Number(id) }
        });

        await prisma.item.deleteMany({
            where: { productId: Number(id) }
        });

        // Then delete the product
        await prisma.product.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message,
        });
    }
};

// Update product stock/quantity
const updateProductStock = async (req, res) => {
    const { id } = req.params;
    const { productSizes } = req.body;
    
    try {
        // Update product sizes and their stock
        for (const sizeData of productSizes) {
            if (sizeData.id) {
                // Update existing size
                await prisma.productSize.update({
                    where: { id: sizeData.id },
                    data: {
                        size: sizeData.size,
                        stock: parseInt(sizeData.stock),
                        sortOrder: parseInt(sizeData.sortOrder) || 0
                    }
                });
            } else {
                // Create new size
                await prisma.productSize.create({
                    data: {
                        productId: Number(id),
                        size: sizeData.size,
                        stock: parseInt(sizeData.stock),
                        sortOrder: parseInt(sizeData.sortOrder) || 0
                    }
                });
            }
        }

        const updatedProduct = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                category: true,
                productSizes: {
                    orderBy: {
                        sortOrder: 'asc'
                    }
                }
            }
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update product stock",
            error: error.message,
        });
    }
};

// Get all categories for React Admin
const getAllCategoriesForAdmin = async (req, res) => {
    try {
        const { page = 1, perPage = 10, sortField, sortOrder = 'ASC' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(perPage);
        
        const orderBy = sortField ? { [sortField]: sortOrder.toLowerCase() } : { id: 'asc' };
        
        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                skip,
                take: parseInt(perPage),
                orderBy,
                include: {
                    _count: {
                        select: {
                            products: true
                        }
                    }
                }
            }),
            prisma.category.count()
        ]);
        
        res.status(200).json({
            data: categories,
            total,
            page: parseInt(page),
            perPage: parseInt(perPage)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories",
            error: error.message,
        });
    }
};

// Get single category for React Admin
const getCategoryForAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await prisma.category.findUnique({
            where: { id: Number(id) },
            include: {
                products: {
                    include: {
                        productSizes: true
                    }
                }
            }
        });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve category",
            error: error.message,
        });
    }
};

// Create new category
const createCategory = async (req, res) => {
    try {
        const { name, image_uri } = req.body;

        const category = await prisma.category.create({
            data: {
                name,
                image_uri
            }
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create category",
            error: error.message,
        });
    }
};

// Update category
const updateCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const { name, image_uri } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (image_uri !== undefined) updateData.image_uri = image_uri;

        const category = await prisma.category.update({
            where: { id: Number(id) },
            data: updateData
        });

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update category",
            error: error.message,
        });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if category has products
        const productsCount = await prisma.product.count({
            where: { categoryId: Number(id) }
        });

        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with existing products"
            });
        }

        await prisma.category.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete category",
            error: error.message,
        });
    }
};

module.exports = {
    getAllProductsForAdmin,
    getProductForAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getAllCategoriesForAdmin,
    getCategoryForAdmin,
    createCategory,
    updateCategory,
    deleteCategory
}; 