/** BizTime express application. */
const express = require("express");
const app = express();
const ExpressError = require("./expressError")

app.use(express.json());

const cRoutes = require('./routes/companies');
const iRoutes = require('./routes/invoices');
app.use('/companies', cRoutes);
app.use('/invoices', iRoutes);


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

// general error handler */

// app.use((err, req, res, next) => {
//   res.status(err.status || 500);

//   return res.json({
//     error: err,
//     message: err.message
//   })
// });

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status || 500
    }
  });
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
})

module.exports = app;

