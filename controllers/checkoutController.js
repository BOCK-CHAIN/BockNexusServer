const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const placeOrder = async (req, res) => {
    const { userId, addressId, paymentMode = "COD" } = req.body;

    try{
        const result = await prisma.$transaction(async (tx) => {
            
            const cartItems = await tx.cartItem.findMany({
                where: { userId },
                include: { product: true, productSize: true }
            })

            if (cartItems.length === 0 ) throw new Error("Cart is empty!");

            const order = await tx.order.create({
                data: {
                    userId,
                    addressId,
                    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), //5 Days Later
                    items: {
                        create: cartItems.map((item) => ({
                            productId: item.productId,
                            productSizeId: item.productSizeId,
                            quantity: item.quantity
                        }))
                    }
                }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    orderId: order.id,
                    paymentId: 'COD_' + Date.now(),
                    orderRefId: 'COD_' + Date.now(),
                    status: 'Success',
                    amount: cartItems.reduce((total, item) => total + item.quantity * item.product.price, 0)+4
                }
            })

            await Promise.all(
                cartItems.map((item) => {
                    return tx.productSize.update({
                        where: { id: item.productSizeId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    })
                })
            );

            await tx.cartItem.deleteMany({
                where: { userId: userId }
            })

            return order;
        }, {
            maxWait: 10000,
            timeout: 30000
        });

        res.status(200).json({ success: true, message: "Order placed", order: result });
    } catch (err) {
        console.error("Checkout error:", err);
        res.status(500).json({ success: false, message: "Checkout failed", error: err.message });
    }
}

module.exports = { placeOrder };