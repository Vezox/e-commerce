const Router = require('express').Router()
const SiteController = require('../controllers/SiteController')
const ProductController = require('../controllers/ProductController')

Router.get('/', SiteController.home)

Router.post('/filter-products', SiteController.filterProducts)

Router.post('/search-products', SiteController.searchProducts)

Router.get('/product/details/:slug', ProductController.getDetailsProduct)


module.exports = Router