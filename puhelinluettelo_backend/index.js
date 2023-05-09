const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
require('dotenv').config()
const Person = require('./models/person')
app.use(express.json())
app.use(cors())
app.use(express.static('build'))


let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Emma Johnson',
        number: '050-987654'
    },
    {
        id: 3,
        name: 'Juan Martinez',
        number: '555-5555'
    },
    {
        id: 4,
        name: 'Aya Nakamura',
        number: '123-456-7890'
    }
]

// /info page 
const phonebookInfo = `<p>Phonebook has info for $ {persons.length} people</p>`
const showCurrentTime = () => {
    const now = new Date();
    const dateString = `${now.toString()}`;
    return `<p>${dateString}</p>`
}

// this is logged everytime app is used
app.use(morgan('tiny'))

// custom morgan token to show name and number json
morgan.token('req-body', (req) => {
    output = {
        name: req.body.name,
        number: req.body.number
    }
    return JSON.stringify(output)
})

// used in app.post
const morganOutput = morgan(':method :url :status :response-time ms :res[content-length] :req-body')

app.post('/api/persons', morganOutput, (request, response) => {
    const body = request.body

    // error if no name
    if (!body.name) {
        console.log('error: "name missing"')
        return response.status(400).json({
            error: "name missing"
        })
    }
    //error if no number
    if (!body.number) {
        console.log('error: "number missing"')
        return response.status(400).json({
            error: "number missing"
        })
    }
    // check persons for duplicate names, retun true if duplicate
    // function nameFilter() {
    //     return persons.some(p => p.name.toLocaleLowerCase() === person.name.toLocaleLowerCase())
    // }

    // if (nameFilter()) {
    //     console.log('error: "Duplicate name"')
    //     return response.status(400).json({
    //         error: "name must be unique"
    //     })
    // }

    // if checks pass, add person

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
})

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</>')
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }

})

app.get('/info', (req, res) => {
    res.send(phonebookInfo + showCurrentTime())
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on ${PORT}`)