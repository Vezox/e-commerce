const Router = require('express').Router()
const AuthController = require('../controllers/AuthController')

Router.get('/login', AuthController.getLogin)

Router.post('/verify', AuthController.verify)

module.exports =  Router
