let express = require('express');
let router = express.Router();
let db = require("../database");
let { Paginator } = require('../paginator')
let { setSelected } = require('../util')

router.get('/tracks', function (req, res, next) {

    let filter = ""
    let params = []

    if (req.query.a) {
        filter += "and a.Title LIKE '%' || ? || '%'"
        params.push(req.query.a)
    }

    if (req.query.c) {
        filter += "and Composer LIKE '%' || ? || '%'"
        params.push(req.query.c)
    }

    if (req.query.t) {
        filter += "and t.Name LIKE '%' || ? || '%'"
        params.push(req.query.t)
    }

    if (req.query.m) {
        filter += "and t.MediaTypeId = ?"
        params.push(+req.query.m)
    }

    if (req.query.g) {
        filter += "and t.GenreId = ?"
        params.push(+req.query.g)
    }

    let offset = +req.query.o || 0

    let order = req.query?.or?.toLowerCase() || "id";
    let orderby = "order by "
    switch (order) {
        case "td": orderby += "t.Name desc"; break
        case "tu": orderby += "t.Name"; break
        case "ad": orderby += "a.Title desc"; break
        case "au": orderby += "a.Title"; break
        case "cd": orderby += "t.Composer desc"; break
        case "cu": orderby += "t.Composer"; break
        case "id": orderby += "t.TrackId desc"; break
        case "iu": orderby += "t.TrackId"; break
    }

    let sql = `
SELECT t.*, a.Title Album, mt.Name Media, g.Name Genre
FROM Track t
left join Album a on a.AlbumId = t.AlbumId 
LEFT JOIN MediaType mt on mt.MediaTypeId = t.MediaTypeId 
LEFT JOIN Genre g on g.GenreId = t.GenreId 
WHERE 1=1
${filter}
${orderby}
LIMIT 10 OFFSET ${offset}`

    let sqlcount = `
SELECT count(*) count FROM Track t
left join Album a on a.AlbumId = t.AlbumId 
LEFT JOIN MediaType mt on mt.MediaTypeId = t.MediaTypeId 
LEFT JOIN Genre g on g.GenreId = t.GenreId 
WHERE 1=1
${filter}`

    Promise.all([
        db.mrow(sql, params),
        db.srow(sqlcount, params),
        db.mrow("select * from MediaType"),
        db.mrow("select * from Genre"),
    ]).then(function ([rows, r, medias, genres]) {
        medias = [{Name: "All medias"}, ...medias]
        genres = [{Name: "All genres"}, ...genres]

        setSelected(medias, "MediaTypeId", +req.query.m)
        setSelected(genres, "GenreId", +req.query.g)

        let paginator = new Paginator(10, offset, r.count)
        res.render('track/tracks', {
            medias, genres,
            ...req.query,
            rows: rows,
            ...r,
            ...paginator,
            ...req.session
        })

        delete req.session.error_message
        delete req.session.message
    })
});

router.get('/test', function (req, res, next) {

    Promise.all([
        db.mrow("select * from genre limit 2"),
        db.mrow("select * from artist limit 2")
    ]).then(function ([genre, artist]) {
        res.json({ genre, artist })
    })
})

module.exports = router;