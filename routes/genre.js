let express = require('express');
let router = express.Router();
let db = require("../database")

router.get('/genres', function (req, res, next) {

  let sql = "select * from Genre"
  let params = []
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }

    res.render('genre/genres', {
      rows: rows,
      error_message: req.session.error_message,
      message: req.session.message
    })

    delete req.session.error_message
    delete req.session.message

    //next()
  });
});

router.get('/genre/add', function (req, res, next) {
  res.render('genre/add-genre', {})
});

router.get('/genre/:GenreId', function (req, res, next) {
  let sql = "select * from Genre where GenreId = $GenreId"
  let params = { $GenreId: req.params.GenreId }

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.render('genre/edit-genre', { ...row, error_message: req.session.error_message })
    delete req.session.error_message
  })
})

router.post('/genre/edit/:GenreId', function (req, res, next) {
  let sql = "Update genre set Name = $Name where GenreId = $GenreId"
  let params = req.body
  db.run(sql, params, function (err) {
    if (err) {
      req.session.error_message = err.toString()
      res.redirect('/genres')
      return
    }

    req.session.message = "The genre was modified"
    res.redirect('/genres')
  })
})

module.exports = router;
