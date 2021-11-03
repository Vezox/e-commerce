const Router = require('express').Router()
const AuthController = require('../controllers/AuthController')

Router.get('/login', AuthController.getLogin)

Router.post('/verify', AuthController.verify)

Router.get('/register', AuthController.register)

Router.post('/register', AuthController.createAccount)

Router.get('/register/success', AuthController.success)

Router.get('/logout', AuthController.logout)


module.exports =  Router
