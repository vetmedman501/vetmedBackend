const catchAsyncErrors = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/errorhandler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware to check if the user is authenticated.
 * @name isAuthenticatedUser
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} - If the user is not authenticated.
 */

exports.isAuthenticatedUser =  catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.cookies;

   //const token = req.headers.authorization;

    if(!token) {
        return next(new ErrorHandler("please Login to access this resource",401));
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

   req.user = await User.findById(decodedData.id);

   next();

})


exports.authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(
            new ErrorHandler(`Roles: ${req.user.role} is not allowed to access this resource`,403)
        )}

        next();
    }
}

