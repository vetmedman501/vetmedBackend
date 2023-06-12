/**
 * Send authentication token in a cookie.
 * @param {Object} user - The user object.
 * @param {number} statusCode - The HTTP status code.
 * @param {Object} res - The response object.
 */

//creating token and saving in cookie
const sendToken = (user,statusCode, res) =>{
    /**
   * Generate JWT token for the user.
   * @method
   * @name getJWTToken
   * @memberof User
   * @instance
   * @returns {string} The generated JWT token.
   */

    const token = user.getJWTToken();

/**
   * Options for the cookie.
   * @type {Object}
   * @property {Date} expires - The expiration date for the cookie.
   * @property {boolean} secure - Specifies if the cookie should only be sent over HTTPS.
   * @property {string} sameSite - Specifies the same-site policy for the cookie.
   */
 
    //options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 *1000
        ),
        //for dev hhtpOnly:true
       // httpOnly: true,
       secure: true,
       sameSite: 'none'
    };

    res.status(statusCode).cookie("token", token,options).json({
        success:true,
        user,
        token,
    })
 }

module.exports = sendToken;