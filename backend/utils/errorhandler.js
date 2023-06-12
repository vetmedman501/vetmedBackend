/**
 * Custom error handler class.
 * @class
 * @extends Error
 */

class ErrorHandler extends Error{
    /**
   * Create an instance of ErrorHandler.
   * @constructor
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code associated with the error.
   */
    constructor(message,statusCode){
        super(message);
        this.statusCode  = statusCode;


         /**
     * Captures the stack trace.
     * @method
     * @name captureStackTrace
     * @memberof ErrorHandler
     * @instance
     * @param {Object} targetObject - The target object to attach the stack trace to.
     * @param {Object} constructorOpt - The constructor function to reference on the stack trace.
     */

        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = ErrorHandler;