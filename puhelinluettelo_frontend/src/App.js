import { useState, useEffect } from 'react'
import axios from 'axios'
import personService from './services/persons'
import ActionMessage from './components/ActionMessage'

const Numbers = ({ persons, filter, removePerson }) => {
  // Filtteröi personsin newFilter mukaan
  let filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <>
      <h2>Numbers</h2>
      <ul>
        {filteredPersons.map(person =>
          <li key={person.name}>
            {person.name} {person.number} <RemoveButton id={person.id} removePerson={removePerson} />
          </li>
        )}
      </ul>
    </>
  )
}

const Filter = ({ newFilter, handleFilterChange }) => {
  return (
    <>
      <form>
        <div>
          filter shown with <input
            value={newFilter}
            onChange={handleFilterChange} />
        </div>
      </form>
    </>
  )
}

const Add = ({ AddPerson, newName, handlePersonChange, newNumber, handleNumberChange }) => {
  return (
    <>
      <form onSubmit={AddPerson}>
        <div>
          name: <input
            value={newName}
            onChange={handlePersonChange} />
        </div>
        <div>
          number: <input
            value={newNumber}
            onChange={handleNumberChange} />
        </div>

        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </>
  )
}

const RemoveButton = ({ id, removePerson }) => {
  return (
    <>
      <button onClick={() => removePerson(id)}>remove {id} </button>
    </>
  )
}

const App = () => {
  // Tallennetaan tänne persons json
  const [persons, setPersons] = useState([])
  const [TextAndCss, setTextAndCss] = useState({
    text : "",
    css: ""
  })

  // Haetaan nimilista ensimmmäisen kerran
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  // newName arvo on input kentän arvo
  const [newName, setNewName] = useState('Add new person')
  const [newNumber, setNewNumber] = useState('Add new number')
  const [newFilter, setNewFilter] = useState('')

  // Haetaan id perusteella personsista nimeä. Jos nimi löytyy palautetaan nimi, jos ei löydy palautetaan tyhjä stringi
  const getNameById = (id) => {
    const person = persons.find((person) => person.id === id)
    return person ? person.name : ""
  }

  const createNotificationMessage = (text, color, name) => {
    setTextAndCss({
      text: `${text} ${name}`,
      css: color

    })
    setTimeout(() => {
      setTextAndCss({
        text: "", 
        css: ""
      })
    }, 5000)
  }

  //Luo uuden objektin joka lisätään personsiin
  const AddPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }
    // Tarkastetaan onko puhelinluettelossa jo saman niminen
    // Jos on, kysytään halutaanko muuttaa numeroa
    if (persons.some(person => person.name.toLocaleLowerCase() === personObject.name.toLocaleLowerCase())) {
      if (window.confirm(`Do you want to update the number?`)) {
        const personNameToUpdate = personObject.name
        const personToUpdate = persons.find(person => person.name.toLocaleLowerCase() === personNameToUpdate.toLocaleLowerCase())
        const personToUpdateId = personToUpdate.id
        
        const updatedPerson = {...personToUpdate, number: personObject.number}
        
        axios.put(`http://localhost:3001/persons/${personToUpdateId}`, updatedPerson)
        .then(response => {
          setPersons(persons.map(person => person.id !== personToUpdateId ? person : response.data))
          setNewName("")
          setNewNumber("")
          createNotificationMessage("changed the number of", "purple", updatedPerson.name)
        })
        // Jos muutetaan numeroa henkilöltä joka on poistettu
        .catch(error => {
          createNotificationMessage("there was no record of user", "maroon", personNameToUpdate)
          setPersons(persons.filter(person => person.id !== personToUpdateId))
        })
      } else {
        console.log('User did not want to update the number')
      }
      }
    else {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          createNotificationMessage("Added", "green", returnedPerson.name)

        })
    }
  }
  // Lähetetään deletepyyntö id:n kanssa ja päivitetään persons listalla joka ei sisällä kyseistä id:tä
  const removePerson = (id) => {
    const removedPersonsName = getNameById(id)

    let confirm = window.confirm('Are you sure you want to delete this item?')
    if (confirm) {
      axios
        .delete(`http://localhost:3001/persons/${id}`)
        .then(response => {
          setPersons(persons.filter(person => person.id !== id))
          createNotificationMessage("Deleted", "red", removedPersonsName)
        })
    }
  }

  // Jokaisella merkillä muuttaa newName arvoksi tekstikentän arvon
  const handlePersonChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  return (
    <div>
      <ActionMessage message={TextAndCss} />
      <h2>Phonebook</h2>
      <Filter newFilter={newFilter} handleFilterChange={handleFilterChange} />
      <h1>add a new</h1>
      <Add AddPerson={AddPerson} newName={newName} handlePersonChange={handlePersonChange} newNumber={newNumber} handleNumberChange={handleNumberChange} />
      <Numbers persons={persons} filter={newFilter} removePerson={removePerson} />
    </div>
  )
}

export default App