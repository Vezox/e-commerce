const express = require('express')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')


const routers = require('./src/routers')
const dataBase = require('./src/configs/dataBase')

const app = express()

//middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true
}))

dotenv.config()

//views
app.set('view engine', 'ejs')
app.set('views', './src/views')

// static
app.use(express.static(__dirname + '/src/public'))

// connect dataBase
dataBase.connect()


routers(app)

app.listen(process.env.PORT || 3000)