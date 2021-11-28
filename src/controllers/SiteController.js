const Product = require('../models/Product')
const Order = require('../models/Order')

class SiteController {
    home(req, res) {
        Product.find({ status: 'accept' }, {
            productName: 1,
            coverImg: 1,
            price: 1,
            discount: 1,
            slug: 1,
        }, (err, products) => {
            if (err) res.status(500).send(err)
            res.render('site/home', { products })
        }).sort({createdAt: -1}).limit(8)
    }

    filterProducts(req, res) {
        const LIMIT = 8
        let find = { status: 'accept' }
        if (req.query.options != 'all')
            find['type'] = req.query.options

        if (req.query.sort == 'old')
           var sort = { createdAt: 1 }
        else if (req.query.sort == 'new')
           var sort = { createdAt: -1 }
        else if (req.query.sort == 'asc')
           var sort = { price: 1 }
        else 
           var sort = { price: -1 }
        const skip = req.query.pageIndex

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
        const text = new RegExp(req.query.search, "gi")
        Product.find({
            productName: text,
            status: 'accept'
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

    
    async getDetailsProduct(req, res) {
        const slug = req.params.slug.split('.')
        const name = slug[0]
        const id = slug[1]
        Promise.all([
            Product.findById(id),
            Order.find({ productId: id, isReviewed: true }, { review: 1 })
        ]).then(([product, reviews]) => {
            res.render('site/details', { product, reviews })
        }).catch(err => {
            res.status(500)
        })
    }


}

module.exports = new SiteController
