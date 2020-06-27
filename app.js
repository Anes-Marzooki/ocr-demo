const express = require('express')
const app = express();
const fs = require('fs')
const multer = require('multer')
const { createWorker } = require('tesseract.js')
const worker = createWorker()

// Creates a storage
const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
  }
);

const upload = multer({ storage: storage })
  .single('avatar');

// view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index')
});

app.post('/uploads', (req, res) => {
  upload(req, res, err => {
    // console.log(req.file)
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      // console.log(req.file.originalname)
      if (err) {
        return console.log('Error', err)
      }
      (async () => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(data, { tessjs_create_pdf: '1' });
        // console.log('Converted Text =====> ', text);
        res.send(text)
        await worker.terminate();
      })()
    });
  });
});

// Server start
const PORT = 5000 || process.env.PORT
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})