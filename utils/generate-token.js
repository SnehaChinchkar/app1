const jwt = require('jsonwebtoken');

const generateToken = (name, email) => {
   
    return jwt.sign({ name, email }, process.env.JWT_KEY, { expiresIn: '1h' });
};

module.exports = { generateToken };
