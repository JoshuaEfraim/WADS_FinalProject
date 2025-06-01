import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    try {
        const token = req.cookies.refreshtoken;
        
        if (!token) return res.status(401).json({ message: "No token provided" });

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log('Token verification failed:', err.message);
                return res.status(403).json({ message: "Token is invalid or expired" });
            }
            req.user = user; // Contains id, email, role from token payload
            next();
        });
    } catch (error) {
        console.log('Auth middleware error:', error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Middleware to restrict to only admins
export const isAdmin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
};