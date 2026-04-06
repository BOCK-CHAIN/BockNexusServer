const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../lib/prisma');

// POST /orders/place  — direct order creation (no Razorpay verification required)
const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, totalAmount, addressId, paymentMethod } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order items are required' });
        }
        if (!addressId) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }

        // Validate address belongs to user
        const address = await prisma.address.findFirst({
            where: { id: Number(addressId), userId }
        });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);

        const order = await prisma.order.create({
            data: {
                user: { connect: { id: userId } },
                Address: { connect: { id: Number(addressId) } },
                deliveryDate,
                status: 'ORDER_PLACED',
                items: {
                    create: items.map(item => ({
                        product: { connect: { id: Number(item.productId) } },
                        quantity: Number(item.quantity),
                        ...(item.productSizeId ? { productSize: { connect: { id: Number(item.productSizeId) } } } : {})
                    }))
                }
            },
            include: {
                items: {
                    include: { product: true }
                },
                Address: true
            }
        });

        // Record transaction
        if (totalAmount && Number(totalAmount) > 0) {
            await prisma.transaction.create({
                data: {
                    userId,
                    orderId: order.id,
                    paymentId: `PAY-${Date.now()}`,
                    orderRefId: `REF-${order.id}`,
                    status: 'Pending',
                    amount: Number(totalAmount)
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to place order',
            error: error.message
        });
    }
};

const createTransaction = async (req, res) => {
    const { amount, userId } = req.body;
    const razorpay = new Razorpay({
        key_id: process.env.RAZOR_PAY_KEY_ID,
        key_secret: process.env.RAZOR_PAY_SECRET,
    });
    const options = {
        amount: amount,
        currency: "INR",
        receipt: `receipt#${Date.now()}`
    }
    try {
        if (!amount || !userId) {
            return res.status(400).json({
                success: false,
                message: "Amount and user id required"
            });
        }
        const razorpayOrder = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            message: "Razorpay order created successfully",
            key: process.env.RAZOR_PAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            order_id: razorpayOrder.id,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message,
        });
    }
};

const createOrder = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
        cartItems,
        deliveryDate,
    } = req.body;
    const key_secret = process.env.RAZOR_PAY_SECRET;
    const generated_signature = crypto.createHmac('sha256', key_secret)
        .update(razorpay_order_id + " " + razorpay_payment_id)
        .digest('hex');
    if (generated_signature !== razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment signature"
        });
    }
    try {
        // Create order and items
        const order = await prisma.order.create({
            data: {
                user: { connect: { id: Number(userId) } },
                deliveryDate: new Date(deliveryDate),
                items: {
                    create: cartItems.map(item => ({
                        product: { connect: { id: Number(item._id) } },
                        quantity: item.quantity
                    }))
                },
                status: 'ORDER_PLACED',
            },
            include: { items: true }
        });
        // Create transaction
        await prisma.transaction.create({
            data: {
                userId: Number(userId),
                orderId: order.id,
                paymentId: razorpay_payment_id,
                status: "Success",
                amount: cartItems.reduce((total, item) => total + item.quantity * item.price, 0),
            }
        });
        res.status(200).json({
            success: true,
            message: "Payment Verified and order created",
            order,
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: "Failed to create transaction or order",
            error: error.message,
        });
    }
};

const getOrdersByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await prisma.order.findMany({
            where: { userId: Number(userId) },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for this user",
            });
        }
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
            error: error.message,
        });
    }
};

module.exports = { createTransaction, createOrder, getOrdersByUserId, placeOrder };
