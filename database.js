
var path = require('path');
const sqlite3 = require("sqlite3").verbose();

const db_name = path.join(__dirname, "Chinook.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connexion réussie à la base de données");
});

db.srow = function (sql, params) {
    return new Promise(function(resolve, reject){
        db.get(sql, params, function(err, row) {
            if(err) {
                return reject(err)
            }
            resolve(row)
        })
    })
}

db.mrow = function (sql, params) {
    return new Promise(function(resolve, reject){
        db.all(sql, params, function(err, rows) {
            if(err) {
                return reject(err)
            }
            resolve(rows)
        })
    })
}

module.exports = db;