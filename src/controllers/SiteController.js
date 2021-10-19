const Product = require('../models/Product')

class SiteController {
    home(req, res) {
        Product.find({ status: 'pending'}, {
            productName: 1,
            coverImg: 1,
            price: 1,
            discount: 1,
            slug: 1,
        }, (err, products) => {
            if(err) res.status(500).send(err)
            res.render('site/home', { products })
        })
    }

    getData(req, res) {
        Product.find({ status: 'pending'}, {
            productName: 1,
            coverImg: 1,
            price: 1,
            discount: 1,
            slug: 1,
            type: 1,
        }, (err, products) => {
            if(err) res.status(500).send(err)
            res.json({ products })
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
                if(err) res.status(500).send(err)
                res.json({ products })
        }).limit(5)
    }

}

module.exports = new SiteController
