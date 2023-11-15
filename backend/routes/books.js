// routes/books.js
const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');
const booksController = require('../controllers/books');


// ajout d'un livre et d'une note (Create)
router.post('/', auth,multer, booksController.addBook);
router.post('/:id/rating', auth, booksController.rateBook);

//récupération d'un livre et de tout les livre + la meilleur note (Read)
router.get('/bestrating', booksController.getBooksWithBestRating);
router.get('/', booksController.getAllBooks);
router.get('/:id', booksController.getBookById);



// mise à jour d'un livre (update)
router.put('/:id', auth, multer, booksController.modifyBook);

// supprimer un livre
router.delete('/:id', auth, booksController.deleteBook);

module.exports = router;
