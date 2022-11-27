

class Paginator {

    constructor(limit, offset, count) {
        this.pages = []
        this.pages.push({
            name: "Prev.",
            offset: offset > 0 ? offset - limit : 0,
            disabled: offset ? "" : "disabled"
        })

        if(offset >= 3*limit) {
            this.pages.push({
                name: "1",
                offset: 0
            })
        }
        if(offset >= 4*limit) {
            this.pages.push({
                name: "2",
                offset: 10
            })
        }
        if(offset >= 5*limit) {
            this.pages.push({
                name: "...",
                disabled: "disabled"
            })
        }

        for (let k = -2; k < 3; ++k) {
            let o = offset + k * limit
            if (o >= 0 && o < count) {
                this.pages.push({
                    name: Math.floor((o / limit)+1).toString(),
                    offset: o,
                    active: k == 0 ? "active" : null
                })
            }
        }

        if(offset <= count - 5*limit) {
            this.pages.push({
                name: "...",
                disabled: "disabled"
            })
        }
        if(offset <= count - 4*limit) {
            this.pages.push({
                name: (Math.ceil(count / limit) - 1).toString(),
                offset: Math.ceil(count / limit)*limit - 2*limit
            })
        }
        if(offset <= count - 3*limit) {
            this.pages.push({
                name: (Math.ceil(count / limit)).toString(),
                offset: Math.ceil(count / limit)*limit - limit
            })
        }

        this.pages.push({
            offset: offset < count ? offset + limit : offset,
            name: "Next",
            disabled: offset + limit > count ? "disabled": null
        })
    }
}

module.exports.Paginator = Paginator