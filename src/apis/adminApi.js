import axios from 'axios'
import { config } from '../constants'
import { bearerAuth } from './AuthApi'

export const adminApi = {

  getUsers,
  deleteUser,
  getNotifiedUsers,
  extendUser,
  createMotivation,
  deleteMotivation,
  getArchiveCards,
  deleteArchiveCard
}

export const instance = axios.create({
  baseURL: process.env.REACT_APP_API
})

function getUsers(admin) {
  return instance.get('/api/admin', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function extendUser(admin, username, months) {
  return instance.post(`/api/admin/${username}/${months}`, null, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-Type': 'application/json'
    }
  });
}



function deleteUser(admin, username) {
  return instance.delete(`/api/admin/delete/${username}`, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function getNotifiedUsers(admin){
  console.log(admin)
  return instance.get('/api/admin/users/notified',{
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })

}

function createMotivation(admin, motivation){
  console.log(admin)
  console.log(motivation)
  return instance.post('/api/motivations',motivation,{
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })

  

}

function deleteMotivation(admin,motivationId){
  console.log("Motiva ",motivationId)
  instance.delete(`/api/motivations/${motivationId}`,{headers: {
    'Authorization': bearerAuth(admin),
    'Content-type': 'application/json'
  }})

}

function getArchiveCards(admin) {
  return instance.get('/api/v1/archive_cards', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function deleteArchiveCard(admin,id){
  return instance.delete(`/api/v1/archive_cards/${id}`,{
  headers: {
        'Authorization': bearerAuth(admin),
        'Content-type': 'application/json'
      }
  })
}
