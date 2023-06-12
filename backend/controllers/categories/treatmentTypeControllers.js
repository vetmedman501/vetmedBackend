const Treatment =  require('../../models/categories/treatmentModle');
const catchAsyncErrors = require('../../middleware/catchAsyncError');

/**
 * Create a Treatment category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the data for the Treatment category.
 * @param {string} req.body.TreatmentTypeName - The name of the Treatment category.
 * @param {string} req.body.imageUrl - The image URL for the Treatment category.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the created Treatment category.
 * @throws {Error} - If an error occurs while creating the Treatment category.
 */
//Create treatment category
exports.createTreatmentType = catchAsyncErrors(async (req, res, next) => {
    try {
      const TreatmentTypeName = req.body.TreatmentTypeName;
      const imageUrl = req.body.imageUrl;
      
      // Check if the TreatmentTypeName already exists in the database (case-insensitive)
      const existingTreatment = await Treatment.findOne({ TreatmentTypeName: { $regex: new RegExp(`^${TreatmentTypeName}$`, "i") } });
  
      if (existingTreatment) {
        return res.status(400).json({
          success: false,
          message: "This type already exists"
        });
      }
  
      // Create a new treatment type
      const treatmentT = await Treatment.create({
        TreatmentTypeName,
        imageUrl,
        user: req.user.id
      });
      
      res.status(201).json({
        success: true,
        treatmentT
      });
    } catch (error) {
      next(error);
    }
  });
  
  
  /**
 * Retrieve all Treatment categories.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response containing the retrieved Treatment categories.
 * @throws {Error} - If an error occurs while retrieving the Treatment categories.
 */

//get all treatment category
exports.allTreatmentType = catchAsyncErrors(async (req, res, next) => {
    try {
        const treatmentT = await Treatment.find();
        res.status(200).json({
            success: true,
            treatmentT
        })
    } catch (error) {
        next(error);
    }
})


/**
 * Update a Treatment category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the Treatment category to update.
 * @param {Object} req.body - The request body containing the updated data for the Treatment category.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the updated Treatment category.
 * @throws {Error} - If an error occurs while updating the Treatment category.
 */
//update treatment type
exports.updatetreatmentType = async (req, res, next) => {
    try {
      const treatmentT = await Treatment.findByIdAndUpdate(req.params.type_id, req.body, { new: true });
      
      if (!treatmentT) {
        return res.status(404).json({
          success: false,
          message: "Treatment type not found"
        });
      }
      
      res.status(200).json({
        success: true,
        treatmentT
      });
    } catch (error) {
      next(error);
    }
  };
  
/**
 * Delete a Treatment category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the Treatment category to delete.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the deleted Treatment category.
 * @throws {Error} - If an error occurs while deleting the Treatment category.
 */

//delete treatment type
exports.deleteTreatmentType = async (req, res, next) => {
    try {
      const treatmentT = await Treatment.findOneAndDelete({ _id: req.params.type_id });
      
      if (!treatmentT) {
        return res.status(404).json({
          success: false,
          message: "Treatment type not found"
        });
      }
      
      res.status(200).json({
        success: true,
        treatmentT
      });
    } catch (error) {
      next(error);
    }
  };
  
