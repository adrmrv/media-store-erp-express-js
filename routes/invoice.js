let express = require('express')
let router = express.Router()
let db = require('../database')
let { Paginator } = require('../paginator')

router.get('/invoices', function (req, res, next) {

    let filter = ""
    let params = {}

    if(req.query.n) {
        filter += " AND (c.FirstName LIKE '%' || $name || '%' or c.LastName LIKE '%' || $name || '%')"
        params.$name = req.query.n
    }

    if(req.query.a) {
        filter += " AND BillingAddress LIKE '%' || $a || '%'"
        params.$a = req.query.a
    }

    if(req.query.c) {
        filter += " AND BillingCity LIKE '%' || $c || '%'"
        params.$c = req.query.c
    }

    let offset = +req.query.o || 0

    let order = req.query?.or?.toLowerCase() || 'id'
    let orderby = "order by "
    switch (order) {
        case "id": orderby += "i.InvoiceId desc"; break
        case "ia": orderby += "i.InvoiceId"; break
        case "dd": orderby += "i.InvoiceDate desc"; break
        case "da": orderby += "i.InvoiceDate"; break
        case "ad": orderby += "i.BillingAddress desc"; break
        case "aa": orderby += "i.BillingAddress"; break
        case "cd": orderby += "i.BillingCity desc"; break
        case "ca": orderby += "i.BillingCity"; break
        case "td": orderby += "i.Total desc"; break
        case "ta": orderby += "i.Total"; break
        case "nd": orderby += "c.LastName desc"; break
        case "na": orderby += "c.LastName"; break
        default: orderby += "i.InvoiceId desc";
    }

    let sql = `
SELECT c.FirstName || ' ' || c.LastName Name,
InvoiceId, InvoiceDate, BillingAddress, BillingCity,
Total
FROM Invoice i
left join Customer c ON c.CustomerId = i.CustomerId
where 1=1 ${filter} ${orderby}
limit 10 offset ${offset}
    `
console.log(sql, params)
    let sqlcount = `
SELECT count(*) count
FROM Invoice i
left join Customer c ON c.CustomerId = i.CustomerId
where 1=1 ${filter}
    `

    Promise.all([
        db.mrow(sql, params),
        db.srow(sqlcount, params)
    ]).then(function([rows, r]) {
        for(let row of rows) {
            row.InvoiceDate = row.InvoiceDate.split(' ')[0]
        }

        let paginator = new Paginator(10, offset, r.count)

        res.render('invoice/invoices', {
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