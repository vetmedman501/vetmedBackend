const catchAsyncError = require('../middleware/catchAsyncError');
const Variety = require('../models/varietyModel');
const ErrorHandler = require('../utils/errorhandler');

/**
 * Adds varieties.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if there is an issue adding the varieties.
 */
//add varities 
exports.addVarieties = catchAsyncError(async (req, res, next) => {
    try {
      const varieties = await Variety.create(req.body);

      res.status(201).json({
          success: true,
          varieties,
      });
      logger.info('Varieties added successfully');
      } catch (error) {
        logger.error(`Error adding varieties: ${error.message}`);
        next(error);
      }
    });
  
/**
 * Retrieves details of a single variety.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if the variety with the specified ID does not exist.
 */
//single varities  detail
exports.getVaritiesDetails =  catchAsyncError(async(req,res,next)=>{
  try {
    const variety = await Variety.findById(req.params.id);

  if(!variety){
      return next(new ErrorHandler("variety Not found",404))
  }

  res.status(200).json({
      success:true,
      variety
  })
  } catch (error) {
    logger.error(`Error retrieving variety details: ${error.message}`);
    next(error);
  }
})

/**
 * Updates a variety (admin only).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if there is an issue updating the variety.
 */
//Update Varieties -- Admin
exports.updateVarieties =catchAsyncError( async (req,res)=>{
  try{
    let variety = Variety.findById(req.params.id);

  if(!variety){
      return next(new ErrorHandler("product Not found",404))
  }


  variety =  await Variety.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true,
      useFindAndModify:false
  });

  res.status(200).json({
      success:true,
      variety
  })
  }catch (error) {
    logger.error(`Error updating variety: ${error.message}`);
    next(error);
  }
})

/**
 * Deletes a variety (admin only).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 * @throws {ErrorHandler} Will throw an error if there is an issue deleting the variety.
 */
//delete varieties --admin
exports.deleteVarieties = catchAsyncError(async (req,res,next)=>{

 try {
  const variety = await Variety.findById(req.params.id);

  if(!variety){
      return next(new ErrorHandler("variety Not found",404))
  }
  else{
    await Variety.findByIdAndRemove(req.params.id)
  }


 res.status(200).json({
  sucess:true,
  message:"variety deleted succesfully"
 })
 } catch (error) {
  logger.error(`Error deleting variety: ${error.message}`);
    return next(new ErrorHandler("Error deleting variety", 500));
 }
})

