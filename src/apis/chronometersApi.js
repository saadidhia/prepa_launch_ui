import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const chronometersApi = {
    getChronometers,
  //  startTimer,
 //   stopTimer,
    updateChronometer,
    deleteChronometer
}

function getChronometers(user) {
    return instance.get('/api/v1/chronometers',{
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      });

}

  function updateChronometer(user,id, timer){

      return instance.put(`/api/v1/chronometers/${id}`,timer, {
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      })
    }

    function deleteChronometer(user,deleteRowId){

          return instance.delete(`/api/v1/chronometers/${deleteRowId}`, {
            headers: {
              'Authorization': bearerAuth(user),
              'Content-type': 'application/json'
            }
          })
        }

