module.exports = {}
module.exports.setSelected = function(items, field, id) {
    for(let item of items) {
        if(item[field] == id) {
            item["selected"] = "selected"
        }
    }
}