const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
    },
    number: {
        type: String,
        validate: {
            validator: function(value) {
            // ##-###### tai ###-##### kelpaa, eli 2-3 ennen - merkkiä ja yhteensä 8
                return /^\d{2}-\d{6,}$/.test(value) || /^\d{3}-\d{5,}$/.test(value);
            },
            message: 'Number needs to be 8 digits long, start with 2-3 digits followed by - sign'
        }

    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// added persons to be used as a collection name
module.exports = mongoose.model('Person', personSchema, 'persons')