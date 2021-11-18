const Router = require('express').Router()
const CheckOutController = require('../controllers/CheckOutController')

Router.get('/', CheckOutController.checkOut)

Router.get('/order', CheckOutController.order)

module.exports = Router
