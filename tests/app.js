require("dotenv").config();

const initializeMongoServer = require("../utils/mongoConfigTesting");

const express = require("express");

const app = express();

require("../utils/passportConfig");

initializeMongoServer();

const indexRouter = require("../routes/index");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", indexRouter);

module.exports = app;
