const { PrismaClient } = require('@prisma/client');
const e = require('express');
const prisma = new PrismaClient();

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
    try{
        const userId = req.user.id;

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


// Edit an address
const editAddress = async (req, res) => {
    try{
        const userId = req.user.id;
        const { id, nickname, line1, line2, city, state, zip, country, isDefault, receiverName, type } = req.body;

        if(!userId || !id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Unauthorized access. User ID and Address ID are required.' 
            });
        }

        if(isDefault === true){
            await prisma.address.updateMany({
                where: {
                    userId,
                    isDefault: true,
                    NOT: {id} 
                },
                data: {
                    isDefault: false
                }
            });
        }

        const address = await prisma.address.update({
            where: {id},
            data: {
                nickname,
                line1,
                line2,
                city,
                state,
                zip,
                country,
                type,
                receiverName,
                isDefault,
                updatedAt: new Date()
            }
        })

        res.status(200).json({
            success: true,
            message: 'Address updated successfully'
        });
    }catch(error){
        console.error('Error updating address:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update address', 
            error: error.message 
        });
    }
}

//Add new address
const addAddress = async (req, res) => {
    try{
        const userId = req.user.id;
        const { nickname, line1, line2, city, state, zip, country, isDefault, receiverName, type } = req.body;

        if(!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Unauthorized access. User ID is required.' 
            });
        }

                const existing = await prisma.address.findFirst({
            where: {
                userId,
                nickname
            }
        });

        if(existing){
            return res.status(409).json({ 
                success: false, 
                message: 'Address with this nickname already exists.' 
            });
        }

        if(isDefault === true){
            await prisma.address.updateMany({
                where: {
                    userId,
                    isDefault: true
                },
                data: {
                    isDefault: false
                }
            });
        }

        const address = await prisma.address.create({
            data: {
                userId,
                nickname,
                line1,
                line2,
                city,
                state,
                zip,
                country,
                type,
                receiverName,
                isDefault: isDefault,
                updatedAt: new Date()
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address
        });

    }catch(error){
        console.error('Error adding address:', error);
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to add address', 
            error: error.message 
        });
    }
}

module.exports = {
    getUserAddresses,
    editAddress,
    addAddress
}