const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
    );
    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
};

const loginOrSignup = async (req, res) => {
    const { phone, address } = req.body;
    try {
        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
            user = await prisma.user.create({
                data: { address, phone },
            });
        } else {
            user = await prisma.user.update({
                where: { phone },
                data: { address },
            });
        }
        const { accessToken, refreshToken } = generateTokens(user);
        res.status(200).json({ user, accessToken, refreshToken });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { loginOrSignup };
