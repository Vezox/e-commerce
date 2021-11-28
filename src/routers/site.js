const Router = require('express').Router()
const SiteController = require('../controllers/SiteController')

Router.get('/', SiteController.home)

Router.get('/filter-products', SiteController.filterProducts)

Router.get('/search-products', SiteController.searchProducts)

Router.get('/product/details/:slug', SiteController.getDetailsProduct)


module.exports = Router