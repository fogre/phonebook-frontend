import React, {useState, useEffect} from 'react';
import personService from './services/persons.js';
import './App.css';

const Filter = ({ filterNames }) => {
  return (
    <div>
      Filter Phonebook: <input onChange={filterNames} />
    </div>
  )
}

const Form = ({handleChange, handleSubmit}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>name: <input name='name' onChange={handleChange}/></div>
      <div>number: <input name='number' onChange={handleChange}/></div>
      <div><button type="submit">add</button></div>
    </form>
  )
}

const Notification = ({ message }) => {
    if (!message) return null;
    return( 
      <div className={!message.type ? 'success' : message.type}>
        {message.message}
      </div>
    );  
}

const PersonsList = ({persons, filter, handleDelete}) => {
  const filteredPersons = persons.filter(pers => 
      pers.name.toLowerCase().includes(filter.toLowerCase())
  ) 
  return (
    <div>
      {
       filteredPersons.map(person => 
          <li key={person.id}>
            {person.name} {person.number}
            <button onClick={() => handleDelete(person)}>
              delete
            </button>
          </li>
       )
      }
    </div>  
  )
}

const App = () => {

  const [persons, setPersons] = useState([]);
  const [newPerson, setNewPerson] = useState({});
  const [searchString, setSearchString] = useState('');
  const [infoMessage, setInfoMessage] = useState(null);

  useEffect(() => {
    personService.getAll().then(persons =>{
      setPersons(persons);
    });  
  }, []);

  const addPerson = () => {
    personService.post(newPerson)
      .then(result => {
        setPersons(persons.concat(result));
        setInfoMessage({
          message: `${result.name} added to Phonebook`,
          type: 'success'
        });
      })
      .catch (error =>
        setInfoMessage({ message: error.response.data.error, type: 'error'})
      )
      .then(() => hideInfoMessage());
  }

  const handleChange = e => {
    const personToAdd = {...newPerson};
    personToAdd[e.target.name] = e.target.value;
    setNewPerson(personToAdd);
  }

  const handleDelete = person => {
    if (!window.confirm(`Remove ${person.name}?`)) return;
    personService.remove(person.id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== person.id))
        setInfoMessage({ 
          message: `${person.name} deleted from the server`, 
          type: 'success' 
        });
      })
      .catch(error => {
        setInfoMessage({ 
          message: `${person.name} already deleted from the server.`, 
          type: 'error'
        })
        setPersons(persons.filter(p => p.id !== person.id));
      })
      .then(() => hideInfoMessage());
  }

  const handleSubmit = e => {
    e.preventDefault();
    const existingPerson = persons.find(
      p => p.name.toLowerCase() === newPerson.name.toLowerCase()
    );
    if (existingPerson) {
      replaceExistingPerson(existingPerson);
    } else {
      addPerson();
    }
  }

  const hideInfoMessage = () => {
    setTimeout(() => {
      setInfoMessage(null)
    }, 5000);
  }

  const replaceExistingPerson = (existingPerson) => {
    if (!window.confirm(`${existingPerson.name} already exists in the phone book. Replace number?`)) 
      return;
    personService.replace({...existingPerson, number: newPerson.number})
      .then(res => { 
        const index = persons.findIndex(p => p.id === res.id);
        const p = persons.concat();
        p[index] = res;
        setPersons(p);
        setInfoMessage({
          message: `Number updated for ${existingPerson.name}`,
          type: 'success'
        });
      })
      .catch (error =>
        setInfoMessage({ message: error.response.data.error, type: 'error'})
      )
      .then(() => hideInfoMessage());
  }

  return (
    <div className='App'>
      <h1 className='header'>Phonebook</h1>
      <Notification message={infoMessage}/>
      <h2>Add new</h2>
      <Form 
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
      <h2>Persons</h2>
      <Filter filterNames={e => setSearchString(e.target.value)}/>
      <br/>
      <PersonsList 
        persons={persons}
        filter={searchString}
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default App;
