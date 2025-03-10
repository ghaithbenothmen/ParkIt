var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file
var authRoutes = require('./routes/auth.route');
var userRoutes = require('./routes/user.route');

const cors = require('cors');




var app = express();




app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const dbUri = 'mongodb://parkit:parkit@mongo:27017/parkit';

mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: 'admin'   // important because the user is created in `admin`
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));
app.use(cors({
  origin: 'http://localhost:3000', // Autoriser les requêtes depuis ce domaine
  credentials: true,
}));


app.listen(4000, () => {
  console.log('Serveur backend en écoute sur le port 4000');
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


// Configurer CORS pour autoriser les requêtes depuis http://localhost:3000


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});







module.exports = app;
