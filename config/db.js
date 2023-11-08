const mongoose = require("mongoose");

const DbConnection = async () => {
  try {
    const DB_URI = process.env.MONGO_URI.replace(
      "<password>",
      process.env.DB_PASSWORD
    );
    const conn = await mongoose.connect(DB_URI);
    console.log(`DB connected to ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = DbConnection;
