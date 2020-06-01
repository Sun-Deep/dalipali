const jwt = require('jsonwebtoken');
const jwtKey = require('../../config/keys').secretOrKey;
module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, jwtKey);
        req.userData = decoded;
        next();
    }catch(error){
        return res.status(401).json({
            error:error
        })
    }
}
