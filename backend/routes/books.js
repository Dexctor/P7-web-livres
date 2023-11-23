const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, resizeImage } = require('../middleware/multer-config');
const bookCtrl = require('../controllers/books');


//CREATE
router.post('/', auth, upload, resizeImage, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.ratingBook);
//READ
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBook);
//UPDATE
router.put('/:id', auth, upload, resizeImage, bookCtrl.modifyBook);
//DELETE
router.delete('/:id', auth, bookCtrl.deleteBook);


module.exports = router;