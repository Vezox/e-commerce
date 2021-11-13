const Router = require('express').Router()
const CheckOutController = require('../controllers/CheckOutController')

Router.get('/', CheckOutController.checkOut)

module.exports = Router
