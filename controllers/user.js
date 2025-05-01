// import jwt from "jsonwebtoken";
// import User from "../models/user.js";

// const generateTokens = (user) => {
//     const accessToken = jwt.sign(
//         { userId: user?._id },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: "2d" }
//     );
//     const refreshToken = jwt.sign(
//         { userId: user?._id },
//         process.env.REFRESH_TOKEN_SECRET,
//         { expiresIn: "7d" }
//     );
//     return accessToken, refreshToken
// };

// const login0rSignUp = async (req, res) => {
//     const { phone, address } = req.body;
//     try {
//         let user = await User.findOne({ phone });
//         if (!user) {
//             user = new User({ address: address, phone });
//         } else {
//             user.address = address;
//             await user.save();
//         }

//         const { accessToken, refreshToken } = generateTokens(user.toObject());
//         res.status(200).json({ accessToken, refreshToken });
//     } catch (error) {
//         console.log(err);
//         res.status(500).json({ error: err.message });
//     }
// };

// export { login0rSignUp };

import jwt from "jsonwebtoken";
import User from "../models/user.js";

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user?._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
    );
    const refreshToken = jwt.sign(
        { userId: user?._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken }; // Return an object
};

const loginOrSignup = async (req, res) => {
    const { phone, address } = req.body;
    try {
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ address: address, phone });
        } else {
            user.address = address;
            await user.save();
        }

        const { accessToken, refreshToken } = generateTokens(user.toObject());
        res.status(200).json({ user, accessToken, refreshToken });
    } catch (error) {
        console.log(error); // Fix the variable name
        res.status(500).json({ error: error.message });
    }
};

export { loginOrSignup }; // Fix the function name
