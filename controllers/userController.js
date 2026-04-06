const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { generateUniqueUserId } = require('../lib/userIdGenerator');

const isStrongAdminPassword = (password) => {
    if (typeof password !== 'string') return false;
    if (password.length < 12) return false;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

const generateToken = (user) => {
    const role = user.role || 'USER';
    return jwt.sign(
        {
            userId: user.id,
            visibleUserId: user.userId,
            username: user.username,
            role,
            isAdmin: role === 'ADMIN'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// User Registration — only requires password, generates userId automatically
const register = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Generate unique userId (bock1, bock2, bock3, ...)
        const userId = await generateUniqueUserId();

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: {
                userId,
                password: hashedPassword,
                role: 'USER',
            },
            select: {
                id: true,
                userId: true,
                role: true,
                createdAt: true
            }
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                userId: user.userId,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// User Login — accepts { userId, password }
const login = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // Validate required fields
        if (!userId || !password) {
            return res.status(400).json({
                success: false,
                message: 'User ID and password are required'
            });
        }

        const user = await prisma.user.findFirst({
            where: { userId: userId.toLowerCase().trim() },
            select: {
                id: true,
                userId: true,
                hexId: true,
                username: true,
                email: true,
                password: true,
                phone: true,
                firstName: true,
                lastName: true,
                dob: true,
                gender: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid User ID or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid User ID or password'
            });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        // Generate token
        const token = generateToken(userWithoutPassword);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get User Profile
const getProfile = async (req, res) => {
    try {
        const id = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                userId: true,
                hexId: true,
                username: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                dob: true,
                gender: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update User Profile
const updateProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const { username, email, phone } = req.body;

        // Check if email is being updated and if it already exists
        if (email) {
            const existingEmail = await prisma.user.findFirst({
                where: {
                    email,
                    id: { not: id }
                }
            });

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Check if phone is being updated and if it already exists
        if (phone) {
            const existingPhone = await prisma.user.findFirst({
                where: {
                    phone,
                    id: { not: id }
                }
            });

            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                username: username || undefined,
                email: email || undefined,
                phone: phone || undefined,
            },
            select: {
                id: true,
                userId: true,
                hexId: true,
                username: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                dob: true,
                gender: true,
                role: true,
                createdAt: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const id = req.user.id;
        const { currentPassword, oldPassword, newPassword } = req.body;
        const existingPassword = currentPassword || oldPassword;

        if (!existingPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id },
            select: { password: true, role: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(existingPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        if (user.role === 'ADMIN' && !isStrongAdminPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Admin passwords must be at least 12 characters and include upper, lower, number, and special characters'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await prisma.user.update({
            where: { id },
            data: { password: hashedNewPassword }
        });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

//Delete a user
const deleteUser = async (req, res) => {
    try{

        const id = req.user.id;
        const { password } = req.body;

        const user = await prisma.user.findUnique({
            where: { id }, 
        })

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        await prisma.$transaction([
            prisma.address.deleteMany({ where: { userId: id } }),
            prisma.cartItem.deleteMany({ where: { userId: id } }),
            prisma.order.deleteMany({ where: { userId: id } }),
            prisma.review.deleteMany({ where: { userId: id } }),
            prisma.transaction.deleteMany({ where: { userId: id } }),
            prisma.user.delete({ where: { id } })
        ]);

        res.status(200).json(
            {
                success: true,
                message: 'User deleted successfully'
            }
        )
    }catch(error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    deleteUser
};
