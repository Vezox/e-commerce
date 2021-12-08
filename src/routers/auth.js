const Router = require('express').Router()
const AuthController = require('../controllers/AuthController')

Router.get('/login', AuthController.getLogin)

Router.post('/verify', AuthController.verify)

Router.get('/register', AuthController.register)

Router.post('/register', AuthController.createAccount)

Router.get('/register/verify', AuthController.getVerifyAccount)

Router.post('/register/verify', AuthController.verifyAccount)

Router.get('/logout', AuthController.logout)

Router.get('/password-change', AuthController.getPasswordChange)

Router.post('/password-change', AuthController.verifyPasswordChange)


module.exports =  Router
