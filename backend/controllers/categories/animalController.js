const Animal =  require('../../models/categories/animal');
const catchAsyncErrors = require('../../middleware/catchAsyncError');

/**
 * This function creates a new animal category. It checks if the animalName already exists in the database (case-insensitive). If it exists, it returns an error message. Otherwise, it creates a new animal category using the Animal model with the provided animalName, imageUrl, and user (from req.user.id). It responds with a success message and the created animal category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the animalName and imageUrl.
 * @param {string} req.body.animalName - The name of the animal.
 * @param {string} req.body.imageUrl - The URL of the image for the animal.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the created animal category.
 * @throws {Error} - If an error occurs while creating the animal category.
 */

//Create animal category
exports.createAnimalType = catchAsyncErrors(async (req, res, next) => {
    try {
      const animalName = req.body.animalName;
      const imageUrl = req.body.imageUrl;

      // Check if the animalName already exists in the database (case-insensitive)
      const existingAnimal = await Animal.findOne({ animalName: { $regex: new RegExp(`^${animalName}$`, "i") } });
  
      if (existingAnimal) {
        return res.status(400).json({
          success: false,
          message: "Animal type already exists"
        });
      }
  
      // Create a new animal type
      const animalT = await Animal.create({
        animalName,
        imageUrl,
        user: req.user.id
      });
      
      res.status(201).json({
        success: true,
        animalT
      });
    } catch (error) {
      next(error);
    }
  });
  
  
/**
 * This function retrieves all animal categories from the database using the Animal model. It responds with a success message and an array of animal categories.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response containing the retrieved animal categories.
 * @throws {Error} - If an error occurs while retrieving the animal categories.
 */

//get all animals category
exports.allAnimalType = catchAsyncErrors(async (req, res, next) => {
    try {
        const animalT = await Animal.find();
        res.status(200).json({
            success: true,
            animalT
        })
    } catch (error) {
        next(error);
    }
})


/**
 * This function updates an existing animal category. It finds the animal category by its ID (type_id parameter) and updates it with the data from req.body. The { new: true } option ensures that the updated animal category is returned as the response. It responds with a success message and the updated animal category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the animal category to update.
 * @param {Object} req.body - The request body containing the updated data for the animal category.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the updated animal category.
 * @throws {Error} - If an error occurs while updating the animal category.
 */

//update animal type
exports.updateAnimalType = async (req, res, next) => {
    try {
        const animalT = await Animal.findByIdAndUpdate(req.params.type_id, req.body, { new: true });
        res.status(200).json({
            success: true,
            animalT
        })
    } catch (error) {
        next(error);
    }
}


/**
 * This function deletes an animal category. It finds the animal category by its ID (type_id parameter) and removes it from the database. It responds with a success message and the deleted animal category.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters extracted from the URL.
 * @param {string} req.params.type_id - The ID of the animal category to delete.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The JSON response indicating the success status and the deleted animal category.
 * @throws {Error} - If an error occurs while deleting the animal category.
 */

//delete animal type
exports.deleteAnimalType = async (req, res, next) => {
    try {
        const animalT = await Animal.findByIdAndRemove(req.params.type_id);
        res.status(200).json({
            success: true,
            animalT
        })
    } catch (error) {
        next(error);
    }
}
