const mongoose = require('mongoose')

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

if (password.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const url =
    `mongodb+srv://janne:${password}@cluster0.qrchvix.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

// added persons to be used as a collection name
const Person = mongoose.model('Person', personSchema, 'persons')

if (password && name && number) {
    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log(`Added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}
else if (password) {
    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}