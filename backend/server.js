const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require("./database-Connection/database");
const logger = require('./utils/logger');

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  /**
   * Event handler for uncaught exceptions.
   *
   * @param {Error} err - The uncaught exception object.
   */
  logger.error(`Error: ${err.message}`);
  logger.info("Shutting down the server due to uncaught Exception");
  process.exit(1);
});

// Config
dotenv.config({ path: "backend/config/config.env" });

// Connecting to the database
connectDatabase();

const port = process.env.PORT;

const server = app.listen(port, () => {
  /**
   * Event handler for successful server startup.
   *
   * @event server.listen
   * @param {string} url - The URL on which the server is running.
   */
  logger.info(`Server is running on http://localhost:${port}`);
});

// Unhandled promise rejection (e.g., if the MongoDB URL is incorrect)
// We want the server to crash in this case
process.on("unhandledRejection", (err) => {
  /**
   * Event handler for unhandled promise rejections.
   *
   * @param {Error} err - The unhandled promise rejection object.
   */
  logger.error(`Error: ${err.message}`);
  logger.error(`Shutting down the server due to unhandled Promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
