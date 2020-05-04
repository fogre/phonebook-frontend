import axios from 'axios'

const baseURL = '/api/persons';

const getAll = () => {
  const response = axios.get(`${baseURL}`)
  return response.then(response => response.data)
}

const post = newPerson => {
  const response = axios.post(`${baseURL}`, newPerson)
  return response.then(response => response.data)
}

const remove = id => {
  const response = axios.delete(`${baseURL}/${id}`)
  return response.then(response => response.data)
}

const replace = person => {
  const response = axios.put(`${baseURL}/${person.id}`, person)
  return response.then(response => response.data)
}

export default { getAll, post, remove, replace }