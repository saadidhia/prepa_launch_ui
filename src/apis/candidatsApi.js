import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const candidatsApi = {
    getMotivations
}

function getMotivations(user) {
    return instance.get('/api/motivations',{
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      });

}
