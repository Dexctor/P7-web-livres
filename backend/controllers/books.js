//controller books
const Book = require('../models/Book');
const path = require('path');
const fs = require('fs');
const mongoSanitize = require('express-mongo-sanitize');


// Récupérer tous les livres
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};


// ajouter un livre
exports.addBook = async (req, res, next) => {
  console.log('book ajouter');

  //déclaration variables
  const bookData = JSON.parse(req.body.book);
  const relativeImageUrl = 'http://localhost:4000/images/' + req.file.filename;
  const title = bookData.title;
  const author = bookData.author;
  const year = bookData.year;
  const genre = bookData.genre;
  const userId = bookData.userId;
  const ratings = bookData.ratings;

  const book = new Book({
    title,
    author,
    year,
    genre,
    imageUrl: relativeImageUrl,
    userId,
    ratings,
  });
  console.log(relativeImageUrl);
  try {
    const savedBook = await book.save();
    res.status(200).json(savedBook);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// afficher un livre
exports.getBookById = (req, res, next) => {
  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(200).json(book);
    })
    .catch(error => res.status(400).json({ error }));
};


// modifier un livre 
exports.modifyBook = (req, res) => {
  let bookObject = req.file ? {
    ...JSON.parse(mongoSanitize(req.body.book)),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...mongoSanitize(req.body) };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => {
            if (req.file) {
              const imagePath = `./images/${book.imageUrl.split('/').pop()}`;
              fs.unlink(imagePath, (err) => {
                if (err) {
                  console.error(err);
                }
              });
            }
            res.status(200).json({ message: "Livre modifié avec succès !" })
          })
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Met à jour le rating d'un livre
exports.updateBookRating = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { userId, grade } = req.body; // Utilisation de 'grade' comme attendu par le front-end

    // Vérifier si le grade est dans une plage valide
    if (grade < 0 || grade > 5) {
      return res.status(400).json({ message: 'Invalid grade' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Vérifier si l'utilisateur a déjà noté le livre
    const existingRatingIndex = book.ratings.findIndex(r => r.userId === userId);
    if (existingRatingIndex !== -1) {
      // Mise à jour de la note existante
      book.ratings[existingRatingIndex].grade = grade;
    } else {
      // Ajout d'une nouvelle note
      book.ratings.push({ userId, grade });
    }

    // Recalcul de la note moyenne
    book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;

    await book.save(); // Sauvegarder les modifications dans la base de données

    res.status(200).json(book); // Renvoyer le livre mis à jour
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Notation des livres
exports.rateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user._id; // Assumant que l'ID de l'utilisateur est stocké dans req.user
    const { grade } = req.body; // Utilisation de 'grade'

    // Validation de la note
    if (grade < 0 || grade > 5) {
      return res.status(400).json({ message: 'Invalid grade' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Trouver si l'utilisateur a déjà noté le livre
    const existingRatingIndex = book.ratings.findIndex(r => r.userId.equals(userId));
    if (existingRatingIndex > -1) {
      book.ratings[existingRatingIndex].grade = grade;
    } else {
      book.ratings.push({ userId, grade });
    }

    // Calculer la note moyenne
    book.averageRating = book.ratings.reduce((acc, curr) => acc + curr.grade, 0) / book.ratings.length;

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// supprimer un livre 
exports.deleteBook = (req, res) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getBooksWithBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(bestRating => {
      res.status(200).json(bestRating);
    })
    .catch(error => {
      res.status(500).json({ error: 'Erreur lors de la récupération des livres les mieux notés' });
    });
};