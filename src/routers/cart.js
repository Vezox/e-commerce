const CartController = require('../controllers/CartController')
const Router = require('express').Router()

Router.get('/', CartController.getCart)

Router.post('/add', CartController.addToCart)

Router.post('/change', CartController.changeItemQuantity)


module.exports = Router