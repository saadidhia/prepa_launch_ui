import axios from 'axios'
import { config } from '../constants'
import { parseJwt } from '../misc/Helpers'

export const authApi = {
  authenticate,
  signup

}

function authenticate(username, password) {
  return instance.post('/auth/authenticate', { username, password }, {
    headers: { 'Content-type': 'application/json' }
  })
}

function signup(user, admin) {
  console.log("user2", user)
  return instance.post('/auth/signup', user, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}


// -- Axios

const instance = axios.create({
  baseURL: config.url.API_BASE_URL
})

instance.interceptors.request.use(function (config) {
  // If token is expired, redirect user to login
  if (config.headers.Authorization) {
    const token = config.headers.Authorization.split(' ')[1]
    const data = parseJwt(token)
    if (Date.now() > data.exp * 1000) {
      window.location.href = "/connexion"
    }
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// -- Helper functions

export function bearerAuth(user) {
  return `Bearer ${user.accessToken}`
}