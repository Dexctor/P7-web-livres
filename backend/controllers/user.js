const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Fonction d'inscription
exports.signup = (req, res) => {
  const password = req.body.password;
  bcrypt.hash(password, 10)
      .then(hash => {
          const user = new User({
              email: req.body.email,
              password: hash
          });
          user.save()
              .then(() => res.status(201).json({ message: 'Utilisateur crée !' }))
              .catch(error => res.status(400).json({ error }))
      })
      .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res) => {
    localStorage.clear(); // Cela va supprimer les données stockées
  const { email, password } = req.body;
  User.findOne({ email })
      .then(user => {
          if (!user) {
              return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect' });
          }
          bcrypt.compare(password, user.password)
              .then(valid => {
                  if (!valid) {
                      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' })
                  } else {
                      return res.status(200).json({
                          userId: user._id,
                          token: jwt.sign(
                              { userId: user._id },
                              'RANDOM_TOKEN_SECRET',
                              { expiresIn: '24h' }
                          )
                      });
                  }
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => {
          res.status(500).json({ error });
      });
};