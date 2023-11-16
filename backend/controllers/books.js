//controller books
const Book = require('../models/Book');
const path = require('path');
const fs = require('fs');
const mongoSanitize = require('express-mongo-sanitize');

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
  
  try {
    const savedBook = await book.save();
    res.status(200).json(savedBook);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

// modifier un livre 
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${res.locals.newName}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié' }))
          .catch(error => res.status(401).json({ error }));
      }
    }))
    .catch((error) => res.status(400).json({ error }));
};

// supprimer un livre 
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' })
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Livre supprimé' }) })
            .catch(error => res.status(401).json({ error }));
        })
      };
    })
    .catch(error => {
      res.status(500).json({ error })
    });
};

// Récupérer tous les livres
exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
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

// Notation des livres
exports.rateBook = (req, res, next) => {
  const ratingObject = req.body;
  ratingObject.grade = ratingObject.rating;
  delete ratingObject.rating;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      const userHaveNotRated = book.ratings.every(rating => rating.userId !== req.auth.userId)
      if (userHaveNotRated === false) {
        res.status(401).json({ message: "Livre déjà évalué par l'utilisateur" });
        return
      } else {
        Book.findOneAndUpdate({ _id: req.params.id }, { $push: { ratings: ratingObject } })
          .then((book) => {
            let averageRates = 0;
            for (i = 0; i < book.ratings.length; i++) {
              averageRates += book.ratings[i].grade;
            };

            averageRates /= book.ratings.length;
            averageRates = parseFloat(averageRates.toFixed(1));

            Book.findOneAndUpdate({ _id: req.params.id }, { $set: { averageRating: averageRates }, _id: req.params.id }, { new: true })
              .then((book) => res.status(201).json(book))
              .catch(error => res.status(401).json({ error }));
          })
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));

};

exports.getBooksWithBestRating = (req, res, next) => {
  Book.find().sort({ averageRating: -1 })
    .then(books => res.status(200).json([books[0], books[1], books[2]]))
    .catch(error => res.status(400).json({ error }));
};