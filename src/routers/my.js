const Router = require('express').Router()
const MyController = require('../controllers/MyController')

Router.get('/password-change', MyController.getPasswordChange)

Router.post('/password-change', MyController.verifyPasswordChange)

Router.get('/address', MyController.myAddress)

Router.post('/address', MyController.createAddress)

Router.get('/address/delete/:id', MyController.deleteAddress)

module.exports = Router