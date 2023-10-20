import axios from 'axios'
import { config } from '../constants'
import { parseJwt } from '../misc/Helpers'
import { bearerAuth } from './AuthApi'

export const adminApi = {

  getUsers,
  deleteUser
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
  console.log("user2", username)
  return instance.delete(`/api/admin/delete/${username}`, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}
