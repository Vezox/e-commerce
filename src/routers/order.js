const Router = require('express').Router()
const OrderController = require('../controllers/OrderController')

Router.get('/checkout', OrderController.checkOut)

Router.get('/confirm', OrderController.orderConfirm)

Router.get('/:options', OrderController.getOrder)

Router.patch('/accept', OrderController.acceptOrder)

module.exports = Router
