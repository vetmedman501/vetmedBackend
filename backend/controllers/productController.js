const catchAsyncError = require('../middleware/catchAsyncError');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const logger =  require('../utils/logger');

/**
 * Create a new product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves when the product is created.
 * @throws {Error} - If an error occurs while creating the product.
 */

//create product
exports.createProduct = catchAsyncError(async (req, res, next) => {
    try {

        req.body.user = req.user.id;
        const product = await Product.create(req.body);


        res.status(201).json({
            success: true,
            product,
        });
        logger.info("product created")
    } catch (error) {
        next(error);
        logger.error("product not created !")
    }
    
});

/**
 * Get details of a single product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves with the product details.
 * @throws {Error} - If the product is not found.
 */

//single product detail
exports.getProductDetails =  catchAsyncError(async(req,res,next)=>{
  const product = await Product.findById(req.params.id);

  if(!product){
      return next(new ErrorHandler("product Not found",404))
  }

  

  res.status(200).json({
      success:true,
      product
  })

  logger.info("single product detail")
})


/**
 * Update a product by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves with the updated product.
 * @throws {Error} - If the product is not found.
 */

//Update Product -- Admin
exports.updateProduct =catchAsyncError( async (req,res)=>{
  let product = Product.findById(req.params.id);

  if(!product){
      return next(new ErrorHandler("product Not found",404))
  }


  product =  await Product.findByIdAndUpdate(req.params.id,req.body,{
      new:true,
      runValidators:true,
      useFindAndModify:false
  });

  res.status(200).json({
      success:true,
      product
  })

  logger.info("product Updated !")
})

/**
 * Delete a product by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A Promise that resolves when the product is deleted.
 * @throws {Error} - If the product is not found.
 */

//delete product --admin
exports.deleteProduct = catchAsyncError(async (req,res,next)=>{

  const product = await Product.findById(req.params.id);

  if(!product){
      return next(new ErrorHandler("product Not found",404))
  }
  else{
    await Product.findByIdAndRemove(req.params.id)
  }


 res.status(200).json({
  sucess:true,
  message:"Product deleted succesfully"
 })

 logger.info("product deleted sucessfully !")
})


/**
 * This function retrieves all products with optional filters and pagination. It allows filtering by keyword, animal, treatment, dailyEssential, and medicalCare. The filters are applied to the Product.find query to retrieve the matching products. The results are paginated using the page and pageSize parameters. The function returns a JSON response with the count of total products, the current page, the number of pages, and the retrieved products. If an error occurs, it calls the next function with the error.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves with the products data.
 * @throws {Error} - If there is an error retrieving the products.
 */

//show All Products
exports.showAllProducts = catchAsyncError(async (req, res, next) => {
    try {
      // enable search
      const keyword = req.query.keyword
        ? {
            name: {
              $regex: req.query.keyword,
              $options: 'i',
            },
          }
        : {};
  
      // enable filter by animal
      const animalId = req.query.animal;
      const animalFilter = animalId ? { animal: animalId } : {};
  
      // enable filter by treatment
      const treatmentId = req.query.treatment;
      const treatmentFilter = treatmentId ? { treatment: treatmentId } : {};
  
      //enable filter by essentials
      const essentialId = req.query.dailyEssential;
      const essentialFilter = essentialId ? {dailyEssential: essentialId}: {};

      //enable filter by medical care
      const medicalCareId = req.query.medicalCare;
      const medicalCareFilter =  medicalCareId ? {medicalCare: medicalCareId}:{};

      // enable pagination
      const pageSize = 4;
      const page = Number(req.query.pageNumber) || 1;
  
   // construct the filter based on the keyword and any additional filters
   const filter = {
    ...keyword,
    ...animalFilter,
    ...treatmentFilter,
    ...essentialFilter,
    ...medicalCareFilter,
  };
      const count = await Product.find(filter).countDocuments();
      const products = await Product.find(filter)
        .skip(pageSize * (page - 1))
        .limit(pageSize);
  
      res.status(200).json({
        success: true,
        count,
        products,
        page,
        pages: Math.ceil(count / pageSize),
      });
    } catch (error) {
      next(error);
      logger.error("show all products error")
    }
  });
  


/**
 * Create a new review or update an existing review for a product.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves with the updated product review.
 * @throws {Error} - If there is an error creating or updating the review.
 */


//Create New review or Update the review
exports.createProductReview = catchAsyncError(async(req,res,next)=>{

  const {rating,comment,productId} = req.body;

  const review ={
      user:req.user._id,
      name:req.user.name,
      rating:Number(rating),
      comment,
  }

  const product =  await Product.findById(productId);

  const isReviewed = product.reviews.find(rev =>rev.user.toString() === req.user._id.toString());

  if(isReviewed){
      product.reviews.forEach(rev =>{
          if( rev.user.toString() === req.user._id.toString())
          rev.rating = rating;
          rev.comment = comment;
      })
  }
  else{
      product.reviews.push(review)
      product.numOfReviews = product.reviews.length
  }
 
  let avg = 0;
  product.ratings = product.reviews.forEach(rev=>{
      avg+=rev.rating;
  })
  
  product.ratings = avg/product.reviews.length;

  await product.save({validateBeforeSave:false})

  res.status(200).json({
      success:true,
      review
  })
  logger.info("review added or updated!")
})


/**
 * Get all reviews of a product. This function retrieves all reviews for a product. It takes the product ID from the request query parameters, finds the product using the Product model, and returns the reviews as a JSON response. If the product is not found, it calls the next function with an error.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves with the reviews of the product.
 * @throws {Error} - If there is an error retrieving the reviews.
 */

//Get All Reviews of a Product

exports.getProductReviews = catchAsyncError(async(req,res,next)=>{
  const product = await Product.findById(req.query.id);

  if(!product){
      return next(new ErrorHandler("product not found",404));
  }

  res.status(200).json({
      success:true,
      reviews:product.reviews,
  })
  logger.info("get reviews of a single product !")
})

/**
 * This function allows users to delete their review for a product. It takes the product ID and review ID from the request query parameters. It finds the product using the product ID, filters out the specified review from the product's reviews array, recalculates the average rating and number of reviews, and updates the product using Product.findByIdAndUpdate. It returns a JSON response indicating the success of the deletion.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves with the success status.
 * @throws {Error} - If there is an error deleting the review.
 */

//Delete Review
exports.deleteReview = catchAsyncError(async (req,res,next)=>{
  const product = await Product.findById(req.query.productId);

  if(!product){
      return next(new ErrorHandler("Product not found",404));
  }

  const reviews = product.reviews.filter(
      rev => rev._id.toString() != req.query.id.toString())
   //          reviewID             userID
  let avg =0;

  reviews.forEach((rev)=>{
      avg += rev.rating;
  })

  const ratings = avg/ reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(req.query.productId,{
      reviews,
      ratings,
      numOfReviews,
  },{
      new:true,
      runValidators:true,
      useFindAndModify:false
  })

  res.status(200).json({
      success:true,
  })

  logger.info("Review deleted !")
})


//-----------------ADMIN---------------------

/**
 * Get all products (admin).This function is specifically for administrators. It retrieves all products using the Product.find method and returns them as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A Promise that resolves with the list of products.
 * @throws {Error} - If there is an error retrieving the products.
 */

//get all products
exports.getAdminProducts = catchAsyncError(async (req,res,next) =>{

  const products = await Product.find()

  res.status(200).json({
      success:true,
      products,
  })

  logger.info("get all products admin !")
} )













