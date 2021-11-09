const CartController = require('../controllers/CartController')
const Router = require('express').Router()

Router.get('/', CartController.getCart)

Router.get('/add', CartController.addToCart)

Router.get('/change', CartController.changeItemQuantity)


module.exports = Router