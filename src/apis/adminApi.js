import axios from 'axios'
import { config } from '../constants'
import { bearerAuth } from './AuthApi'

export const adminApi = {

  getUsers,
  deleteUser,
  getNotifiedUsers,
}

export const instance = axios.create({
  baseURL: config.url.API_BASE_URL
})

function getUsers(admin) {
  return instance.get('/api/admin', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
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
