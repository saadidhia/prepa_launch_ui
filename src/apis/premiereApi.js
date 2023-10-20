import { config } from '../constants'
import { parseJwt } from '../misc/Helpers'
import { bearerAuth } from './AuthApi'
import { instance } from './adminApi'


export const premiereApi = {
    getPdfs
}


function getPdfs(user) {
    return instance.get('/api/v1/drive/premiere',{
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      });
}