const Router = require('express').Router()
const EmailController = require('../controllers/EmailController')

Router.get('/forgot-password', EmailController.forgotPassword)

Router.post('/forgot-password', EmailController.sendMail)

Router.get('/verify-email', EmailController.getVerifyEmail)

Router.post('/verify-email', EmailController.verifyEmail)

module.exports = Router