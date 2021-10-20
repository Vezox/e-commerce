const Router = require('express').Router()
const SiteController = require('../controllers/SiteController')

Router.get('/', SiteController.home)

Router.post('/filter-products', SiteController.filterProducts)

Router.post('/search-products', SiteController.searchProducts)



module.exports = Router