import AsyncHandler from 'express-async-handler'
import Admin from '../modals/adminSchema.js'
import jwt from 'jsonwebtoken'

const protectAdmin = AsyncHandler(async (req, res, next) => {
    try {
        let token = req.headers.token
        if (!token) {
            return res.status(401).json({ msg: 'Not authorized, no token' })
        }

        if (!process.env.JWT_SECRET_KEY) {
            throw new Error('JWT_SECRET_KEY is missing from environment variables');
        }

        console.log("Admin Middleware: Verifying token...");
        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        console.log("Admin Middleware: Token decoded, ID:", decoded.id);

        let isAdmin = await Admin.findOne({ _id: decoded.id })

        if (!isAdmin) {
            console.log("Admin Middleware: Admin not found for ID:", decoded.id);
            res.status(401).json({ msg: 'Not authorized as admin' })
        } else {
            console.log("Admin Middleware: Admin authorized:", isAdmin.userName);
            req.admin = isAdmin
            next();
        }

    } catch (error) {
        res.status(401).json({ msg: 'Not authorized, token failed' })
    }
});

export default protectAdmin
