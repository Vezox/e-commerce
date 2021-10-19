const Router = require('express').Router()
const SiteController = require('../controllers/SiteController')

Router.get('/',SiteController.home)

Router.get('/get-data',SiteController.getData)

Router.post('/search-products',SiteController.searchProducts)



module.exports = Router