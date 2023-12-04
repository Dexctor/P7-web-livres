const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs'); 

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = Date.now(); 
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + '.' + extension);
    }
});

const upload = multer({storage: storage}).single('image');

const resizeImage = (req, res, next) => {
  if (!req.file) {
      return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const outputFilePath = path.join(__dirname, '../images', `resized_${fileName.split('.')[0]}.webp`); // Changement de l'extension en .webp

  sharp(filePath)
      .resize({ width: 206, height: 260 })
      .toFormat('webp') // Conversion en WebP
      .toFile(outputFilePath)
      .then(() => {
          fs.unlink(filePath, () => {
              req.file.path = outputFilePath;
              req.file.filename = `resized_${fileName.split('.')[0]}.webp`; // Mise à jour du nom de fichier
              console.log('Image convertie en webp');
              next();
          });
      })
      .catch(err => {
          console.error('Sharp error:', err);
          return next();
      });
};

module.exports = { upload, resizeImage };
