const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
require('dotenv').config()
const Person = require('./models/person')

// Käyttöön json-parser. Ilman tätä postia tehdessä request.body olisi undefined
app.use(express.json())

app.use(cors())

// Tarkastaa build kansion juuressa ja tarjoaa pyydetyn tiedoston sieltä, jos sieltä sen niminen tiedosto löytyy
app.use(express.static('build'))


// /info page 
const phonebookInfo = `<p>Phonebook has info for $ {persons.length} people</p>`
const showCurrentTime = () => {
    const now = new Date();
    const dateString = `${now.toString()}`;
    return `<p>${dateString}</p>`
}

// Virheenkäsittely middleware
const errorHandler = (error, request, response, next) => {
    console.log('ERROR HANDLER KUTSUTTU')
    console.log(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error)}


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

app.post('/api/persons', morganOutput, (request, response, next) => {
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
        .catch(error => next(error))
})

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</>')
})

// if-else tarkastaa onko oikean tyyppinen id olemassa ja herjaa jos oikeanlainen id on annettu mutta sitä ei löydy. 
// .catch toimii vasta jos annetaan kokonaan vääräntyyppinen id 
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
    res.send(phonebookInfo + showCurrentTime())
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})
// Otetaan käyttöön virheenkäsittely middleware
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on ${PORT}`)