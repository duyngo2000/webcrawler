const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const crawler = require("./crawler");
const connectDb = require("./database");
const cors = require("cors");
const indexRouter = require("./routes/index");
const apiCompanyRouter = require("./routes/apiCompany.route");
const information = require("./models/information.model");

const app = express();
const corsOptions = {
  origin: "*",

}
connectDb().then(async (response) => {
  console.log("Connect database success!");
  const lastInfor = await information.find().sort({ _id: -1 }).limit(1);
  const index = lastInfor[0] ? lastInfor[0]._id || 0 : 0;
  crawler(index)
    .then((response) => {
      setInterval(() => {
        (async () => {
          const lastInfor = await information.find({}).sort({ _id: -1 }).limit(1);
          const index = lastInfor[0]._id
          crawler(index);
        })()
      }, 1800000)
    })
    .catch((error) => {
      console.log(error);
    });
});
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors(corsOptions))
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", indexRouter);
app.use("/api/company", apiCompanyRouter)
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
