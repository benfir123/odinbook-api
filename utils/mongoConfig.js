const mongoose = require("mongoose");
// Set up mongoose connection
const dev_db_url = `mongodb+srv://m001-student:m001-mongodb-basics
@sandbox.xxvtpwk.mongodb.net/odinbook_development?retryWrites=true&w=majority`;
const mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
