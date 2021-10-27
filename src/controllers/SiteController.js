const Product = require('../models/Product')

class SiteController {
    home(req, res) {
        Product.find({ status: 'pending' }, {
            productName: 1,
            coverImg: 1,
            price: 1,
            discount: 1,
            slug: 1,
        }, (err, products) => {
            if (err) res.status(500).send(err)
            res.render('site/home', { products })
        }).sort({createdAt: -1}).limit(4)
    }

    filterProducts(req, res) {
        const LIMIT = 4
        let find = { status: 'pending' }
        if (req.body.options != 'all') find['type'] = req.body.options

        let sort = null
        if (req.body.sort == 'old') {
            sort = { createdAt: 1 }
        } else if (req.body.sort == 'new') {
            sort = { createdAt: -1 }
        } else if (req.body.sort == 'asc') {
            sort = { price: 1 }
        } else {
            sort = { price: -1 }
        }

        const skip = req.body.pageIndex

        Promise.all([
            Product.find(find, {
                productName: 1,
                coverImg: 1,
                price: 1,
                discount: 1,
                slug: 1,
                type: 1,
            }).sort(sort).skip(skip * LIMIT).limit(LIMIT),
            Product.countDocuments(find)
        ])
            .then(data => {
                res.json({ products: data[0], pageTotal: Math.ceil(data[1] / LIMIT) })
            })
            .catch(err => {
                res.status(500)
            })
    }


    searchProducts(req, res) {
        const text = new RegExp(req.body.text, "gi")
        Product.find({
            productName: text,
            status: 'pending'
        }, {
            productName: 1,
            coverImg: 1,
            price: 1,
            discount: 1,
            slug: 1,
        }, (err, products) => {
            if (err) res.status(500).send(err)
            res.json({ products })
        }).limit(5)
    }

}

module.exports = new SiteController
