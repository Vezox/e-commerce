const mongoose = require('mongoose')

async function connect() {
    try {
        // await mongoose.connect('mongodb+srv://admin:vezox@cluster0.xqgwo.mongodb.net/LazaPee', {
            await mongoose.connect('mongodb://localhost:27017/LazaPee', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connect Successfully')
    } catch (error) {
        console.log(error)
    }
}

module.exports = { connect }