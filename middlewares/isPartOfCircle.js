const Circle = require('../models/circle-model'); 

const isPartOfCircle = async (req, res, next) => {
    try {
        const { circleId } = req.params; 
        const parentId = req.user._id; 

        const circle = await Circle.findById(circleId);
        if (!circle) {
            return res.status(404).json({ message: "Circle not found" });
        }

        const isMember = circle.parentIds.includes(parentId);
        if (!isMember) {
            return res.status(403).json({ message: "Access denied: You are not a part of this circle" });
        }

        next(); 
    } catch (error) {
        console.error("Error in isPartOfCircle middleware:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = isPartOfCircle;
