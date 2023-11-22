const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');


const multer = require('../middleware/multer-config')

const bookCtrl = require('../controllers/books');

router.post('/', auth, multer, bookCtrl.createBook);
router.put('/:id', auth, multer,  bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.ratingBook);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBook);

module.exports = router;