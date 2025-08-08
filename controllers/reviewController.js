const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add a review for a product
const addProductReview = async(req, res) => {
    try{
        const { productId, userId, rating, comment } = req.body

        
        if (!productId || !userId || !rating){
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating value' });
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId
            }
        })

        if(existingReview){
            const updatedReview = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    rating,
                    comment
                }
            })
            return res.status(200).json({message: 'Review updated', review: updatedReview})
        }else{
            const newReview = await prisma.review.create({
                data: {
                    productId,
                    userId,
                    rating,
                    comment
                }
            })
            return res.status(201).json({message: 'Review added', review: newReview})
        }
    }catch(error){
        console.error(error)
        res.status(500).json({ message: 'Internal server error.' })
    }
}

module.exports = {
    addProductReview
}