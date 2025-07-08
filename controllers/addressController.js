const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
    try{

        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Unauthorized access. User ID is required.' 
            });
        }

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }
        });

        res.status(200).json({
            success: true,
            addresses
        });
    }catch(error){
        console.error('Error fetching user addresses:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch addresses', 
            error: error.message 
        });
    }
}

module.exports = {
    getUserAddresses
}