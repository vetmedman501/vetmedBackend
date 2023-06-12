/**
 * Wraps an asynchronous function with error handling middleware.
 * @name catchAsyncErrors
 * @function
 * @param {Function} theFunc - The asynchronous function to be wrapped.
 * @returns {Function} - The wrapped function.
 */

module.exports = (theFunc) =>(req,res,next)=>{
    Promise.resolve(theFunc(req,res,next)).catch(next)
}