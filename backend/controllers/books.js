const Book = require('../models/Book');
const fs = require('fs');

//CREATE
exports.createBook = async (req, res, next) => {
  try {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book ({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  
  await book.save()

  res.status(201).json({ message: 'book saved!'});

  } catch(error) {
      res.status(400).json({ error });
  }
};

exports.ratingBook = async (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then( book => {    
            const isAlreadyRated = book.ratings.find((book) => book.userId === req.auth.userId);
              if ( !isAlreadyRated) {
                book.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating
                })
                let newAverageRating = book.ratings.reduce((accumulator, currentValue) => accumulator + currentValue.grade, 0)/book.ratings.length;
                book.averageRating = newAverageRating;
    
                return book.save()
                } else {
                    res.status(401).json({message: 'Book already rated'});
                }
            })
        .then(book => res.status(201).json(book))
        .catch(error => res.status(500).json({ error }));
      };

//READ
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
Book.find()
    .then(books => {
        books.sort((a, b) => b.averageRating - a.averageRating);
        const bestRatedBooks = books.slice(0, 3);
        res.status(201).json(bestRatedBooks)})
    .catch(error => res.status(404).json({ error }));
};

//UPDATE
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
      .then((book) => {
          if (book.userId != req.auth.userId) {
              return res.status(401).json({ message: 'Not authorized' });
          }

          if (bookObject.imageUrl && book.imageUrl) {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, (err) => {
                  if (err) console.log(err);
              });
          }

          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Book modified!' }))
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

//DELETE
exports.deleteBook = (req, res, next) => {
Book.findOne({ _id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message: 'Not authorized'});
        } else {
            const filenameThumb = book.imageUrl.split('/images/')[1];
            const filenameLarge = filenameThumb.split('_thumbnail')[0];
            fs.unlink(`images/${filenameLarge}.jpg`, () => { });
            fs.unlink(`images/${filenameLarge}.png`, () => { });
            fs.unlink(`images/${filenameThumb}`, () => {
                book.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({message: 'book deleted'})})
                    .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch( error => {
        res.status(500).json({ error });
    })
};


