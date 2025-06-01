import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Ticket from '../models/ticket.js';
import express from 'express';
import cloudinary from '../config/cloudinary.js';
import upload from '../config/multer.js';
import { sendEmail } from '../utils/sendemail.js';

const router = express.Router();

// check password and confirmPassword
function isMatch(password, confirm_password) {
    if (password === confirm_password) return true
    return false
}

// validate email
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// validate password
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    return re.test(password)
}

// create refresh token
function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

// user sign-up
export const signUp = async (req, res) => {
    try {
        let { name, email, password, confirmPassword, phoneNumber, role } = req.body;
        email = email.toLowerCase();

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        if (name.length < 3) return res.status(400).json({ message: "Your name must be at least 3 letters long" });

        if (!isMatch(password, confirmPassword)) return res.status(400).json({ message: "Password did not match" });

        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid emails" });

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'USER'
        });

        await newUser.save();

        res.status(200).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// user sign-in
export const signIn = async (req, res) => {
    try {
        console.log('Sign-in attempt for email:', req.body.email);
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        email = email.toLowerCase();
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Check if user registered with Google
        if (user.loginWithGoogle) {
            return res.status(400).json({ 
                message: "This email is registered with Google. Please use Google Sign-In instead.",
                isGoogleAccount: true 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const refresh_token = createRefreshToken({ 
            id: user._id,
            email: user.email,
            role: user.role 
        });
        console.log('Generated refresh token for user:', user.email);

        const expiry = 7 * 24 * 60 * 60 * 1000; // 7 days

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/',
            maxAge: expiry,
            expires: new Date(Date.now() + expiry)
        });
        console.log('Cookie set with refresh token');

        res.json({
            message: "Sign in successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log('Sign-in error:', error.message);
        return res.status(500).json({ message: error.message });
    }
};

// update user information
export const updateUser = async (req, res) => {
    try {
        console.log('Update request received:');
        console.log('Files:', req.files);
        console.log('File:', req.file);
        console.log('Body:', req.body);
        
        const { id } = req.params; // user ID to update
        const updates = req.body;
        const requestingUser = req.user; // user making the request

        // Find the user to be updated
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check permissions
        // Users can only update their own info, ADMIN can update anyone
        if (requestingUser.role !== 'ADMIN' && requestingUser.id !== id) {
            return res.status(403).json({ message: "You can only update your own information" });
        }

        // Handle profile image upload
        let profileImgUrl = userToUpdate.profileImg; // Keep existing image URL by default
        if (req.file) {
            try {
              const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  {
                    folder: 'profile_images',
                    width: 300,
                    crop: "scale",
                  },
                  (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                  }
                );
                stream.end(req.file.buffer);
              });
          
              console.log('Cloudinary upload result:', uploadResult);
              
              // Update profile image URL
              profileImgUrl = uploadResult.secure_url;
              console.log('Profile image URL:', profileImgUrl);
          
              // Delete old image from Cloudinary if it exists
              if (userToUpdate.profileImg) {
                const publicId = userToUpdate.profileImg
                  .split('/')
                  .pop()
                  .split('.')[0];
          
                await cloudinary.uploader.destroy(`profile_images/${publicId}`);
              }
          
            } catch (error) {
              console.error('Error uploading to cloudinary:', error);
              return res.status(400).json({ message: "Error uploading profile image" });
            }
        }

        // Handle password change separately
        if (updates.newPassword) {
            console.log('Password update detected');
            // Require current password for verification (except for ADMIN)
            if (requestingUser.role !== 'ADMIN') {
                if (!updates.currentPassword) {
                    return res.status(400).json({ message: "Current password is required to change password" });
                }

                // Verify current password
                const isPasswordValid = await bcrypt.compare(updates.currentPassword, userToUpdate.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: "Current password is incorrect" });
                }
                console.log('Current password verified successfully');
            }

            // Validate new password format
            if (!validatePassword(updates.newPassword)) {
                return res.status(400).json({
                    message: "New password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.newPassword, salt);
            console.log('New password hashed successfully');
        }

        // Fields that can be updated
        const allowedUpdates = {
            name: updates.name,
            email: updates.email,
            phoneNumber: updates.phoneNumber,
            department: updates.department,
            password: updates.password, // Directly include password if it exists
            ...(profileImgUrl && { profileImg: profileImgUrl }),
            ...(requestingUser.role === 'ADMIN' && { role: updates.role })
        };

        console.log('Password in allowedUpdates:', !!allowedUpdates.password);
        console.log('Updates to be applied:', {
            ...allowedUpdates,
            password: allowedUpdates.password ? '[HASHED_PASSWORD]' : undefined
        });

        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(key => 
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        // Validate email if it's being updated
        if (allowedUpdates.email && !validateEmail(allowedUpdates.email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if email is already taken by another user
        if (allowedUpdates.email && allowedUpdates.email !== userToUpdate.email) {
            const existingUser = await User.findOne({ email: allowedUpdates.email });
            if (existingUser) {
                return res.status(400).json({ message: "Email is already in use" });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from response

        console.log('Updated user:', updatedUser);

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get profile information for both users and admins
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the same response structure regardless of role
        res.status(200).json({
            success: true,
            profile: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                department: user.department,
                profileImg: user.profileImg,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching profile information" 
        });
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Please provide an email address" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is Google auth user
        if (user.loginWithGoogle) {
            return res.status(400).json({ 
                message: "This account uses Google Sign-In. Please reset your password through Google.",
                isGoogleAccount: true 
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.RESET_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        // Save reset token and expiry to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Send email
        await sendEmail(
            user.email,
            'Password Reset Request',
            `Hello ${user.name},\n\n` +
            `You are receiving this email because you (or someone else) has requested to reset your password.\n\n` +
            `Please click on the following link to reset your password:\n\n` +
            `${resetUrl}\n\n` +
            `This link will expire in 1 hour.\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        );

        res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Error sending password reset email" });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
        const user = await User.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired" });
        }

        // Validate new password
        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send confirmation email
        await sendEmail(
            user.email,
            'Password Changed Successfully',
            `Hello ${user.name},\n\n` +
            `This is a confirmation that the password for your account ${user.email} has just been changed.\n`
        );

        res.json({ message: "Password has been reset" });
    } catch (error) {
        console.error('Reset password error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: "Invalid reset token" });
        }
        res.status(500).json({ message: "Error resetting password" });
    }
};

export async function getUserTickets(req, res) {
    try {
        // const userId = await User.findOne({_id: "6837e04f9275f96ff3a3c9c1"}); // Get user ID from authenticated request
        const userId = await User.findById(req.user.id) 
        const { page, limit, sort, status, priority } = req.query;
        
        // Convert page and limit to numbers
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 5;
        const skip = (pageNum - 1) * limitNum;
        
        // Sort order
        const sortOrder = sort === 'asc' ? 1 : -1;

        // Build filter object
        const filter = { userId };
        
        // Add status filter if provided
        if (status && status !== 'ALL') {
            filter.status = status.toUpperCase();
        }
        
        // Add priority filter if provided
        if (priority && priority !== 'ALL') {
            filter.priority = priority.toUpperCase();
        }

        // Find tickets for the user with pagination, sorting and filters
        const tickets = await Ticket.find(filter)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'name email');

        // Get total count of tickets for pagination
        const totalTickets = await Ticket.countDocuments(filter);

        // Get counts for different statuses
        const [totalAwaitingApproval, totalProcessing, totalResolved] = await Promise.all([
            Ticket.countDocuments({ userId, status: 'AWAITING_APPROVAL' }),
            Ticket.countDocuments({ userId, status: 'PROCESSING' }),
            Ticket.countDocuments({ userId, status: 'RESOLVED' })
        ]);

        return res.status(200).json({
            success: true,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalTickets / limitNum),
            totalTickets,
            totalAwaitingApproval,
            totalProcessing,
            totalResolved,
            tickets,
            statusOptions: Ticket.schema.path('status').enumValues,
            priorityOptions: Ticket.schema.path('priority').enumValues
        });

    } catch (error) {
        console.error('Error fetching user tickets:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message
        });
    }
}

// Logout user
export const logout = async (req, res) => {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refreshtoken', {
            path: '/',
            httpOnly: true
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: "Error logging out"
        });
    }
};

export default router;
