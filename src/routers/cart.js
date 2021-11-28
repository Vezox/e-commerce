const Router = require('express').Router()
const CartController = require('../controllers/CartController')
const CodeController = require('../controllers/CodeController')

Router.get('/', CartController.getCart)

Router.get('/add', CartController.addToCart)

Router.get('/change', CartController.changeItemQuantity)

Router.get('/delete', CartController.deleteItem)

Router.get('/code/apply-code', CodeController.applyCode)

Router.get('/checkout', CartController.checkOut)

Router.get('/confirm', CartController.orderConfirm)



module.exports = Router