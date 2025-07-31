const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add item to cart
const addToCart = async (req, res) => {
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

      // Check stock availability
      if (productSize.stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: 'Insufficient stock for this size' 
        });
      }
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: userId,
        productId: productId,
        productSizeId: productSizeId || null
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Update existing cart item
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product: true,
          productSize: true
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
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

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem
    });

  }}catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include : {
        product: {
          include: {
            productSizes: {
              orderBy: {
                sortOrder: 'asc',
            }
          }
        },
      },
      productSize: true
  }});

    // Calculate total
    let total = 0;
    cartItems.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.status(200).json({
      success: true,
      data: {
        items: cartItems,
        total: total,
        itemCount: cartItems.length
      }
    });

  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id; // Get from authenticated user

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Check if cart item exists and belongs to user
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        userId: userId
      },
      include: {
        productSize: true
      }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check stock if product size is specified
    if (existingItem.productSize && existingItem.productSize.stock < quantity) {
      return res.status(200).json({
        success: true,
        message: 'Insufficient stock for this size'
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(cartItemId) },
      data: { quantity },
      include: {
        product: true,
        productSize: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id; // Get from authenticated user

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        userId: userId
      }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(cartItemId) }
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Clear user's cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user

    await prisma.cartItem.deleteMany({
      where: { userId: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 