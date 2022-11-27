let express = require('express');
let router = express.Router();
let db = require("../database");
let { Paginator } = require('../paginator')


router.get('/albums', function (req, res, next) {

    let nameFilter = ""
    let titleFilter = ""
    let params = []

    if (req.query.n) {
        nameFilter = "and Name LIKE '%' || ? || '%'"
        params.push(req.query.n)
    }

    if (req.query.t) {
        titleFilter = "and Title LIKE '%' || ? || '%'"
        params.push(req.query.t)
    }

    let offset = +req.query.o || 0

    let order = req.query?.or?.toLowerCase() || "ad";
    let orderby = "order by "
    switch (order) {
        case "ad":
            orderby += "AlbumId desc"
            break
        case "au":
            orderby += "AlbumId asc"
            break
        case "nd":
            orderby += "Title desc"
            break
        case "nu":
            orderby += "Title asc"
            break
        case "rd":
            orderby += "Name desc"
            break
        case "ru":
            orderby += "Name asc"
            break
    }

    let sql = `
SELECT *, (select count(*) from Track t 
    WHERE t.AlbumId = a.AlbumId) Tracks 
FROM Album a
left join Artist ar on ar.ArtistId  = a.ArtistId
WHERE 1=1
${titleFilter}
${nameFilter}
${orderby}
LIMIT 10 OFFSET ${offset}`

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.toString(), sql });
            return;
        }

        let sql = `SELECT count(*) count FROM Album a
        left join Artist ar on ar.ArtistId  = a.ArtistId
        where 1=1
        ${titleFilter}
        ${nameFilter}`
        db.get(sql, params, function (err, row) {
            if (err) {
                res.status(400).json({ "error": err.message, sql });
                return;
            }

            let paginator = new Paginator(10, offset, row.count)
            res.render('album/albums', {
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


module.exports = router;