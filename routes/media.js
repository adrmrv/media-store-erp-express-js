let express = require('express');
let router = express.Router();
let db = require("../database")

router.get('/medias', function (req, res, next) {

  let sql = "select * from MediaType"
  let params = []
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }

    res.render('media/medias', { rows, message: req.session.message, error_message: req.session.error_message })
    delete req.session.message
    delete req.session.error_message
  });
});


router.post("/media/edit/:MediaTypeId", (req, res, next) => {
  let sql = "UPDATE MediaType set Name = $name WHERE MediaTypeId = $id"
  let params = req.body
  db.run(sql, params, function(err) {
    if (err) {
      req.session.error_message = JSON.stringify(err);
      res.redirect(`/media/${req.params.MediaTypeId}`);
      return;
    }

    req.session.message = "Le type de media a bien été modifié";
    res.redirect('/medias');
  });
});

router.post("/media/delete/:MediaTypeId", (req, res, next) => {
  let sql = "DELETE from MediaType WHERE MediaTypeId = $id"
  let params = { $id: +req.params.MediaTypeId }
  db.run(sql, params, function(err) {
    if (err) {
      req.session.error_message = err.toString();
      res.redirect(`/medias`);
      return;
    }

    req.session.message = "Le type de media a bien été supprimé";
    res.redirect('/medias');
  });
});

router.post("/media/add", (req, res, next) => {
  let sql = "INSERT  into MediaType (Name) Values ($name)"
  let params = req.body
  db.run(sql, params, function(err) {
    if (err) {
      req.session.error_message = JSON.stringify(err);
      res.redirect(`/medias`);
      return;
    }

    req.session.message = "Le type de media a bien été supprimé";
    res.redirect('/medias');
  });
});

router.get("/media/add", (req, res, next) => {
  res.render("media/add-media")
});

router.get("/media/:MediaTypeId", (req, res, next) => {
  let sql = "select * from MediaType where MediaTypeId = ?"
  let params = [req.params.MediaTypeId]
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.render('media/edit-media', { ...row, error_message: req.session.error_message })
    delete req.session.error_message
  });
});
module.exports = router;
