const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET; 


// * research code
function removeCircularReferences(obj) {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    }));
}

// JWT Verification Endpoint
router.post('/', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ isValid: false, message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ isValid: false, message: 'Token is missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ isValid: false, message: 'Failed to authenticate token' });
        }
        // Add your logic here for successful verification
        const safeDecoded = removeCircularReferences(decoded);
        res.status(200).json({ isValid: true, decoded });
    });
});

module.exports = router;