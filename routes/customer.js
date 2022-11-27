let express = require('express')
let router = express.Router()
let db = require('../database')
let { Paginator } = require('../paginator')

router.get('/customers', function (req, res, next) {

    let filter = ""
    let params = {}

    if(req.query.n) {
        filter += " AND (c.FirstName LIKE '%' || $name || '%' or c.LastName LIKE '%' || $name || '%')"
        params.$name = req.query.n
    }

    if(req.query.r) {
        filter += " AND (e.FirstName LIKE '%' || $repr || '%' or e.LastName LIKE '%' || $repr || '%')"
        params.$repr = req.query.r
    }

    if(req.query.c) {
        filter += " AND Company LIKE '%' || $c || '%'"
        params.$c = req.query.c
    }

    if(req.query.a) {
        filter += " AND c.Address LIKE '%' || $a || '%'"
        params.$a = req.query.a
    }

    if(req.query.e) {
        filter += " AND c.Email LIKE '%' || $e || '%'"
        params.$e = req.query.e
    }

    let offset = +req.query.o || 0

    let order = req.query?.or?.toLowerCase() || 'id'
    let orderby = "order by "
    switch (order) {
        case "id": orderby += "c.CustomerId desc"; break
        case "ia": orderby += "c.CustomerId"; break
        case "nd": orderby += "c.LastName desc"; break
        case "na": orderby += "c.LastName"; break
        case "cd": orderby += "c.Company desc"; break
        case "ca": orderby += "c.Company"; break
        case "ed": orderby += "c.Email desc"; break
        case "ea": orderby += "c.Email"; break
        case "rd": orderby += "e.LastName desc"; break
        case "ra": orderby += "e.LastName"; break
        default: orderby += "c.CustomerId desc";
    }

    let sql = `
select 
CustomerId, c.FirstName || ' ' || c.LastName Name, Company,
c.Address || ' ' || c.PostalCode || ' ' || c.City ||  ' ' || c.Country Address,
c.Phone, c.Email, e.FirstName || ' ' || e.LastName Representative
FROM Customer c
left join Employee e on e.EmployeeId = c.SupportRepId 
where 1=1 ${filter} ${orderby}
limit 10 offset ${offset}
    `
console.log(sql, params)
    let sqlcount = `
select count(*) count
FROM Customer c
left join Employee e on e.EmployeeId = c.SupportRepId 
where 1=1 ${filter}
    `

    Promise.all([
        db.mrow(sql, params),
        db.srow(sqlcount, params)
    ]).then(function([rows, r]) {
        let paginator = new Paginator(10, offset, r.count)

        res.render('customer/customers', {
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