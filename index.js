const express = require('express')
const routers = require('./src/routers')
require('dotenv').config()

const dataBase = require('./src/configs/dataBase')

const app = express()

//middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//views
app.set('view engine', 'ejs')
app.set('views', './src/views')

// static
app.use(express.static(__dirname + '/src/public'))

dataBase.connect()

routers(app)

app.listen(process.env.PORT || 3000)