const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require('../middleware/catchAsyncError');
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail =  require('../utils/sendEmail')
const crypto = require('crypto')
const logger =  require('../utils/logger');

/**
 * Register a new user.
 *
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves when the user is successfully registered.
 * @throws {Error} - If there is an error registering the user.
 */

//Register a User
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password} = req.body;

    const user = await User.create({
        name,
        email,
        password
    })

    //send user token 
    sendToken(user,200,res)
    logger.info("user registered !")
})

/**
 * Logs in a user.
 * @param {Object} req - The request object -> email and password.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if email or password is missing or invalid.
 */

//login user
exports.loginUser = catchAsyncErrors (async(req,res,next)=>{
    const {email,password} = req.body;

    //checking if user has given password and email both

    if(!email || !password){
        logger.error('Please enter email and password');
        return next(new ErrorHandler("please Enter Email && password",400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        logger.error('Invalid email or password');
        return next(new ErrorHandler('Invalid email or Password',401))
    }

    const isPasswordMatched  = await user.comparePassword(password);

    if(!isPasswordMatched){
        logger.error('Invalid email or password');
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res)

    logger.info("user login sucess!")
  
})

/**
 * Logs out a user by clearing the authentication token cookie.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */

// LogOut User
exports.logout = catchAsyncErrors(async(req,res,nex)=>{

    res.cookie("token",null,{
        expires: new Date(Date.now()), //it will expire the cookie to current date and time 

        //for development httponly true
        //httpOnly:true

        secure: true,
        sameSite: 'none'
    })
    logger.info('User logged out');

    res.status(200).json({
        success:true,
        message:" Logged Out",
    })

})


/**
 * Sends a password reset email to the user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if user is not found or if there is an issue sending the email.
 */

// Forgot password
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    //Get ResetPassword Token
    const restToken = user.getResetPasswordToken();
    user.resetPasswordExpire = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    await user.save({validateBeforeSave:false})

   const restPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${restToken}`
   //const restPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${restToken}`

    const message = `Click on the Link to change your Password :- \n\n ${restPasswordUrl} \n\n If you have not requested this email then please ignore it.`

    try {
        await sendEmail({
            email:user.email,
            subject: `Password Recovery`,
            message
        });

        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email} successfully`
        })

        logger.info("email sent sucessfully to change password !")
        
    } catch (error) {
        logger.error('Email not sent!');
        user.resetPasswordToken= undefined;
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(error.message,500))
    }
})

/**
 * Resets the user's password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if the reset password token is invalid or expired, or if there is an issue resetting the password.
 */

//reset password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    
    //creating token hash

    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired",404));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not matched"),400)
    }

    user.password = req.body.password;
    user.resetPasswordToken= undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res)
    logger.info('Password reset successfully!');

})

/**
 * Retrieves the details of the authenticated user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if there is an issue retrieving the user details.
 */
//Get User Details
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    })
    logger.info('User details retrieved successfully!');
})

/**
 * Updates the user's password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if the old password is incorrect, the new password and confirm password do not match, or if there is an issue updating the password.
 */
//update User  password
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{

  try{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        logger.error('Old password is incorrect');
        return next(new ErrorHandler("OldPassword is incorrect",400));
    }

    if(req.body.newPassword != req.body.confirmPassword){
        logger.error('New password and confirm password do not match');
        return next(new ErrorHandler("OldPassword is incorrect",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res)
    logger.info('Password updated successfully!');

  }catch (error) {
    logger.error('Error updating password:', error);
    next(error);
  }
})

/**
 * Updates the user's profile.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if there is an issue updating the user profile.
 */
//update User Profile
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{

    const newUserData ={
        name:req.body.name,
        email:req.body.email,  
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

        const message = `User profile updated succesfully`
        res.status(200).json({
        success:true,
        message,
        user
    })
})

/**
 * Retrieves all users (admin only).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if there is an issue fetching all users.
 */
//Get all Users (admin)
exports.getAllUser = catchAsyncErrors(async (req,res,next)=>{
    try {
        const users = await User.find();
    
        res.status(200).json({
          success: true,
          users
        });
    
        logger.info('All users fetched successfully!');
      } catch (error) {
        logger.error('Error fetching all users:', error);
        next(error);
      }
})

/**
 * Retrieves a single user by ID (admin only).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if the user with the specified ID does not exist.
 */
//Get Single User (admin)
exports.getSingleUser = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not exist with Id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user
    })
    logger.info(`User with ID ${req.params.id} fetched successfully!`);

})

/**
 * Updates the role of a user (admin only).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if there is an issue updating the user's role.
 */
//update User Role --Admin
exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{

    /**
   * The updated user data.
   * @typedef {Object} NewUserData
   * @property {string} name - The user's name.
   * @property {string} email - The user's email.
   * @property {string} role - The user's role.
   */

  /**
   * The new user data.
   * @type {NewUserData}
   */
    const newUserData ={
        name:req.body.name,
        email:req.body.email, 
        role:req.body.role,
    }


    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

        const message = `User profile updated succesfully`
        res.status(200).json({
        success:true,
        message,
        
    })
      logger.info(`User role updated for user with ID: ${req.user.id}`);

})


//Delete User --- Admin
exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{


    const user = await User.findById(req.params.id);


    if(!user){
        return next(new ErrorHandler(`user does not exist with Id: ${req.params.id}`))
    }

  
    await User.findByIdAndRemove(req.params.id);

        res.status(200).json({
        success:true,
        message:"User deleted successfully"
    })
})


