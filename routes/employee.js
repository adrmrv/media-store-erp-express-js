let express = require('express')
let router = express.Router()
let db = require('../database')
let { Paginator } = require('../paginator')

router.get('/employees', function (req, res, next) {

    let filter = ""
    let params = {}

    if(req.query.n) {
        filter += " AND (e.FirstName LIKE '%' || $name || '%' or e.LastName LIKE '%' || $name || '%')"
        params.$name = req.query.n
    }

    if(req.query.t) {
        filter += " AND Title LIKE '%' || $t || '%'"
        params.$t = req.query.t
    }

    if(req.query.p) {
        filter += " AND e.Phone LIKE '%' || $p || '%'"
        params.$p = req.query.p
    }

    if(req.query.e) {
        filter += " AND e.Email LIKE '%' || $e || '%'"
        params.$e = req.query.e
    }

    let offset = +req.query.o || 0

    let order = req.query?.or?.toLowerCase() || 'id'
    let orderby = "order by "
    switch (order) {
        case "id": orderby += "e.EmployeeId desc"; break
        case "ia": orderby += "e.EmployeeId"; break
        case "nd": orderby += "e.LastName desc"; break
        case "na": orderby += "e.LastName"; break
        case "td": orderby += "e.Title desc"; break
        case "ta": orderby += "e.Title"; break
        case "bd": orderby += "e.BirthDate desc"; break
        case "ba": orderby += "e.BirthDate"; break
        case "hd": orderby += "e.HireDate desc"; break
        case "ha": orderby += "e.HireDate"; break
        case "ed": orderby += "e.Email desc"; break
        case "ea": orderby += "e.Email"; break
        case "pd": orderby += "e.Phone desc"; break
        case "pa": orderby += "e.Phone"; break
        default: orderby += "e.EmployeeId desc";
    }

    let sql = `
SELECT EmployeeId,
FirstName || ' ' || LastName Name,
Title, BirthDate, HireDate, Email, Phone 
FROM Employee e 
where 1=1 ${filter} ${orderby}
limit 10 offset ${offset}
    `
console.log(sql, params)
    let sqlcount = `
SELECT count(*) count 
FROM Employee e 
where 1=1 ${filter}
    `

    Promise.all([
        db.mrow(sql, params),
        db.srow(sqlcount, params)
    ]).then(function([rows, r]) {
        for(let row of rows) {
            row.BirthDate = row.BirthDate.split(' ')[0]
        }

        let paginator = new Paginator(10, offset, r.count)

        res.render('employee/employees', {
            ...req.query,
            rows,
            ...r,
            ...paginator,
            ...req.session
        })

        delete req.session.error_message
        delete req.session.message
    })
})

module.exports = router