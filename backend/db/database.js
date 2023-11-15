const mongoose = require('mongoose');

const connectToDB = () => {
  mongoose.connect('mongodb+srv://admin:admin1@atlascluster.wocwklk.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));
};

module.exports = connectToDB;
