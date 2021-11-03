const CartController = require('../controllers/CartController')
const Router = require('express').Router()

Router.get('/', CartController.getCart)

Router.post('/add', CartController.addToCart)

module.exports = Router