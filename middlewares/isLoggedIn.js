const jwt = require("jsonwebtoken");
const parentModel= require('../models/parent-model')
const isLoggedIn = async (req, res, next) => {
    const token = req.cookies.authToken; 

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await parentModel.findOne({email:decoded.email});
        if (!user) {
            return res.status(401).json({ message: 'Access denied. Invalid token.' });
        }

        req.user = user;
        next(); 
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = isLoggedIn;