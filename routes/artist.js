let express = require('express');
let router = express.Router();
let db = require("../database");
const { param, route } = require('./media');
let { Paginator } = require('../paginator')

router.get('/artists', function (req, res, next) {

  let nameFilter = ""
  let params = []
  if (req.query.n) {
    nameFilter = "and Name LIKE '%' || ? || '%'"
    params.push(req.query.n)
  }
  let offset = +req.query.o || 0

  let order = req.query?.or?.toLowerCase() || "ad";
  let orderby = "order by "
  switch(order){
    case "ad":
      orderby += "ArtistId desc"
      break
    case "au":
      orderby += "ArtistId asc"
      break
    case "nd":
      orderby += "Name desc"
      break
    case "nu":
      orderby += "Name asc"
      break
  }

  let sql = `SELECT * FROM  Artist a
  where 1=1
  ${nameFilter}
  ${orderby}
  limit 10 offset ${offset}`

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.toString() });
      return;
    }

    let sql = `SELECT count(*) count FROM  Artist a
      where 1=1
      ${nameFilter}`
    db.get(sql, params, function (err, row) {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }

      let paginator = new Paginator(10, offset, row.count)
      res.render('artist/artists', {
        ...req.query,
        rows: rows,
        ...row,
        ...paginator,
        ...req.session
      })

      delete req.session.error_message
      delete req.session.message
    })
  });
});

router.get('/artist/add', function(req, res, next) {
  //let sql = "insert into artist (Name) values ($Name)"
  res.render('artist/add-artist')
})

router.post('/artist/add', function(req, res, next) {
  let sql = "insert into artist (Name) values ($Name)"
  let params = req.body
  db.run(sql, params, function(err) {
    if(err) {
      req.session.error_message = JSON.stringify(err)
      res.redirect('/artists')
      return
    }

    req.session.message = "The artist was added to the list"
    res.redirect('/artists')
  })
})

router.get('/artist/:ArtistId', function(req, res, next) {
  let sql = "SELECT * FROM artist where ArtistId = $ArtistId"
  let params = { $ArtistId: req.params.ArtistId }
  db.get(sql, params, (err, row) => {
    if(err) {
      res.status(400).json(err)
      return
    }
    
    res.render('artist/edit-artist', { ...row })
  })
})

router.post('/artist/edit/:ArtistId', function (req, res, next) {
  let sql = "update artist set Name = $Name where ArtistId = $ArtistId"
  let params = req.body
  db.run(sql, params, function (err){
    if(err) {
      req.session.error_message = JSON.stringify(err)
      res.redirect('/artists')
      return
    }

    req.session.message = "The artist was modified"
    res.redirect('/artists')
  })
})

module.exports = router;
