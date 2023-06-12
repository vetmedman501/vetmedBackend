const Essential =  require('../../models/categories/dailyEssentials');
const catchAsyncErrors = require('../../middleware/catchAsyncError');


/**
 * This function creates a new essential category. It checks if the essentialName already exists in the database (case-insensitive). If it exists, it returns an error message. Otherwise, it creates a new essential category using the Essential model with the provided essentialName, imageUrl, and user (from req.user.id). It responds with a success message and the created essential category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the essentialName and imageUrl.
 * @param {string} req.body.essentialName - The name of the essential.
 * @param {string} req.body.imageUrl - The URL of the image for the essential.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the created essential category.
 * @throws {Error} - If an error occurs while creating the essential category.
 */

//Create essential category
exports.createEssentialsType = catchAsyncErrors(async (req, res, next) => {
    try {
      const essentialName = req.body.essentialName;
      const imageUrl = req.body.imageUrl;

      // Check if the essentialName already exists in the database (case-insensitive)
      const existingEssential = await Essential.findOne({ essentialName: { $regex: new RegExp(`^${essentialName}$`, "i") } });
  
      if (existingEssential) {
        return res.status(400).json({
          success: false,
          message: "this type already exists"
        });
      }
  
      // Create a new essentialName type
      const essentialT = await Essential.create({
        essentialName,
        imageUrl,
        user: req.user.id
      });
      
      res.status(201).json({
        success: true,
        essentialT
      });
    } catch (error) {
      next(error);
    }
  });

  /**
 * This function retrieves all essential categories from the database using the Essential model. It responds with a success message and an array of essential categories.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response containing the retrieved essential categories.
 * @throws {Error} - If an error occurs while retrieving the essential categories.
 */

  //get all essential category
exports.allEssentialsType = catchAsyncErrors(async (req, res, next) => {
    try {
        const essentialT = await Essential.find();
        res.status(200).json({
            success: true,
            essentialT
        })
    } catch (error) {
        next(error);
    }
})


/**
 * Update an essential category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the essential category to update.
 * @param {Object} req.body - The request body containing the updated data for the essential category.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the updated essential category.
 * @throws {Error} - If an error occurs while updating the essential category.
 */

  //Update  essential category
exports.updateEssentialType = catchAsyncErrors(async (req, res, next) => {
    try {
        const essentialT = await Essential.findByIdAndUpdate(req.params.type_id, req.body, { new: true });
        res.status(200).json({
            success: true,
            essentialT
        })
    } catch (error) {
        next(error);
    }
})

/**
 * Delete an essential category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the essential category to delete.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the deleted essential category.
 * @throws {Error} - If an error occurs while deleting the essential category.
 */

  //delete  essential category
exports.deleteEssentialType = catchAsyncErrors(async (req, res, next) => {
    try {
        const essentialT = await Essential.findByIdAndRemove(req.params.type_id);
        res.status(200).json({
            success: true,
            essentialT
        })
    } catch (error) {
        next(error);
    }
})
