const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const vehiculeRoutes = require('./routes/vehicule.routes');
const parkingRoutes = require('./routes/parking.routes');
const parkingSpotRoutes = require('./routes/parkingSpot.route');
const reservationRoutes = require('./routes/reservation.route');



const cors = require('cors');




const app = express();



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
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
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/parking-spots', parkingSpotRoutes); 
app.use('/api/reservations', reservationRoutes);


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

  // Renvoyer une réponse JSON au lieu de rendre une vue
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});







module.exports = app;
