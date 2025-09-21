import axios from 'axios'
import { config } from '../constants'
import { parseJwt } from '../misc/Helpers'
import { Fingerprint } from 'fingerprintjs'; // Import Fingerprint from fingerprintjs library


export const authApi = {
  authenticate,
  signup,
  logout

}

async function authenticate(username, password) {

  return instance.post('api/auth/authenticate', { username, password }, {
    headers: {
      'Content-type': 'application/json'
    }
  })
};

function signup(user, admin) {
  return instance.post("api/auth/signup", user, {
    headers: {
      Authorization: bearerAuth(admin),
      "Content-type": "application/json",
    },
  });
}

function logout(user) {
  return instance.post('api/auth/logout', null, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}


// -- Axios

const instance = axios.create({
  baseURL: process.env.REACT_APP_API
})

instance.interceptors.request.use(function (config) {
  // If token exists in the request headers, process it
  if (config.headers.Authorization) {
    const token = config.headers.Authorization.split(' ')[1];
    const data = parseJwt(token);

    // Check if the token is expired and redirect to login if it is
    if (Date.now() > data.exp * 1000) {
      window.location.href = "/connexion";
      return Promise.reject(new Error("Token expired, redirecting to login."));
    }
  }
  return config;
}, function (error) {
  return Promise.reject(error);
});


// -- Helper functions

export function bearerAuth(user) {
  return `Bearer ${user.accessToken}`

}




