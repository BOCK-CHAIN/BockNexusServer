const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId, productSizeId, quantity, size } = req.body;
    const userId = req.user.id; // Get from authenticated user

    // Validate required fields
    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and quantity are required' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    let productSize;
    
    // Check if product size exists (if provided)
    if (productSizeId) {
        productSize = await prisma.productSize.findUnique({
        where: { id: productSizeId }
      });

      if (!productSize) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product size not found' 
        });
      }
    }

    // Check if item already exists in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: userId,
        productId: productId,
        productSizeId: productSizeId || null
      }
    });

    let wishlistItem;
    if (existingWishlistItem) {
      // Update existing wishlist item
      wishlistItem = await prisma.wishlistItem.update({
        where: { id: existingWishlistItem.id },
        data: { quantity: existingWishlistItem.quantity + quantity },
        include: {
          product: true,
          productSize: true
        }
      });
    } else {
      // Create new wishlist item
      wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: userId,
          productId: productId,
          productSizeId: productSizeId || null,
          quantity: quantity,
          size: size || null,
        },
        include: {
          product: true,
          productSize: true
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: wishlistItem
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: userId },
      include: {
        product: {
          include: {
            category: true,
            productSizes: true,
            reviews: {
              include: {
                user: true
              }
            }
          }
        },
        productSize: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: wishlistItems
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update wishlist item quantity
const updateWishlistItem = async (req, res) => {
  try {
    const { wishlistItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Check if wishlist item exists and belongs to user
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        id: parseInt(wishlistItemId),
        userId: userId
      }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    const updatedItem = await prisma.wishlistItem.update({
      where: { id: parseInt(wishlistItemId) },
      data: { quantity: quantity },
      include: {
        product: true,
        productSize: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Wishlist item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Error updating wishlist item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { wishlistItemId } = req.params;
    const userId = req.user.id;

    // Check if wishlist item exists and belongs to user
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        id: parseInt(wishlistItemId),
        userId: userId
      }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await prisma.wishlistItem.delete({
      where: { id: parseInt(wishlistItemId) }
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Clear user's wishlist
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.wishlistItem.deleteMany({
      where: { userId: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  updateWishlistItem,
  removeFromWishlist,
  clearWishlist
}; 