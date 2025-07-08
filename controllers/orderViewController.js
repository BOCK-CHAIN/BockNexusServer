const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user orders
const getUserOrders = async (req, res) => {
    try{
        const userId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { deliveryDate: 'asc' },
            include: {
                user: {
                    select: {
                        phone: true,
                    }
                },
                Address: true,
                items: {
                    include: {
                        product: true
                    }
                },
                transactions: true
            }
        });

        res.status(200).json({
            success: true,
            orders
        });
    }
    catch(error){
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders'});
    }
};

module.exports = {
    getUserOrders
};  