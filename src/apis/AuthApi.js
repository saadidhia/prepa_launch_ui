import axios from 'axios'
import { config } from '../constants'
import { parseJwt } from '../misc/Helpers'
import { Fingerprint } from 'fingerprintjs'; // Import Fingerprint from fingerprintjs library


export const authApi = {
  authenticate,
  signup,
  logout

}


const getIPAddress = async () => {
  try {
    const response = await axios.get('https://ip-api.com/json');
    console.log("IPPPPPPPPPP", response.data.query);
    const ipAddress = response.data.query; // IP address is available in the 'query' field
    return ipAddress;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return 'Unknown';
  }
};



async function authenticate (username, password) {
  
    const ipAddress = await getIPAddress(); // Get client's IP address
    return instance.post('/auth/authenticate', { username, password }, {
      headers: { 'Content-type': 'application/json',
       'deviceId': ipAddress }
    })
};

function signup(user, admin) {
  console.log("user2", user)
  return instance.post('/auth/signup', user, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function logout (user){
  return instance.post('/auth/logout',null,{
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