const Medical =  require('../../models/categories/medicalCareModel');
const catchAsyncErrors = require('../../middleware/catchAsyncError');


/**
 * Create a Medical category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the data for the Medical category.
 * @param {string} req.body.medicalCareName - The name of the Medical category.
 * @param {string} req.body.imageUrl - The image URL for the Medical category.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the created Medical category.
 * @throws {Error} - If an error occurs while creating the Medical category.
 */

//Create Medical category
exports.createMedicalType = catchAsyncErrors(async (req, res, next) => {
    try {
      const medicalCareName = req.body.medicalCareName;
      const imageUrl = req.body.imageUrl;

      // Check if the medicalCareName already exists in the database (case-insensitive)
      const existingMedical = await Medical.findOne({ medicalCareName: { $regex: new RegExp(`^${medicalCareName}$`, "i") } });
  
      if (existingMedical) {
        return res.status(400).json({
          success: false,
          message: "this type already exists"
        });
      }
  
      // Create a new medicalCare type
      const MedicalT = await Medical.create({
        medicalCareName,
        imageUrl,
        user: req.user.id
      });
      
      res.status(201).json({
        success: true,
        MedicalT
      });
    } catch (error) {
      next(error);
    }
  });

  /**
 * Retrieve all Medical care categories.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response containing the retrieved Medical care categories.
 * @throws {Error} - If an error occurs while retrieving the Medical care categories.
 */

  //all medicalcare category
exports.allmedicalCareType = async (req, res, next) => {
    try {
        const medicalT = await Medical.find();
        res.status(200).json({
            success: true,
            medicalT
        })
    } catch (error) {
        next(error);
    }
}

/**
 * Update a Medical care category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the Medical care category to update.
 * @param {Object} req.body - The request body containing the updated data for the Medical care category.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the updated Medical care category.
 * @throws {Error} - If an error occurs while updating the Medical care category.
 */

  //update medicalcare category
exports.updatemedicalCareType = async (req, res, next) => {
    try {
        const medicalT = await Medical.findByIdAndUpdate(req.params.type_id, req.body, { new: true });
        res.status(200).json({
            success: true,
            medicalT
        })
    } catch (error) {
        next(error);
    }
}
/**
 * Delete a Medical care category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the Medical care category to delete.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the deleted Medical care category.
 * @throws {Error} - If an error occurs while deleting the Medical care category.
 */
  //delete medicalcare category
exports.deleteMedicalCareType = async (req, res, next) => {
    try {
        const medicalT = await Medical.findByIdAndRemove(req.params.type_id);
        res.status(200).json({
            success: true,
            medicalT
        })
    } catch (error) {
        next(error);
    }
}