const mongoose = require('mongoose')
mongoose.set("strictQuery", false);
const logger =  require('../utils/logger')

/**
 * The connectDatabase function establishes a connection to the MongoDB database using the mongoose.connect method.
It uses the process.env.MONGO_URL environment variable to specify the URL of the MongoDB database.
The useNewUrlParser and useUnifiedTopology options are passed to the mongoose.connect method for proper configuration.
 * @returns {void}
 */

const connectDatabase = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }).then(()=>{
        logger.info("connected...");
    })
    //.catch(err=>console.log(err))
    
}

module.exports = connectDatabase;