// Importation des modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const connectToDB = require('./db/database');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/books');
const path = require('path');
const cors = require('cors');

// Création d'une nouvelle application Express
const app = express();

// Connexion à la base de données MongoDB
connectToDB();

// Configuration du Middleware pour parser le JSON / parse les corps des requêtes entrantes en JSON
app.use(express.json());

// Utilisation du Middleware cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// route pour les Users et les livres
app.use('/api/auth', userRoutes)
app.use('/api/books', bookRoutes);

// Middleware pour les routes statiques
app.use('/images', express.static(path.join(__dirname, 'images')));


// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Une erreur interne du serveur s\'est produite.');
});


// Exportation de l'application pour utilisation dans d'autres modules
module.exports = app;
