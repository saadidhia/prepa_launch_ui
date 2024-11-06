import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const chronometersApi = {
    getChronometers,
  //  startTimer,
 //   stopTimer,
    updateTimerDescription,
    deleteTimer
}

function getChronometers(user) {
    return instance.get('/api/v1/chronometers',{
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      });

}

/*function startTimer(user, timer){
    console.log("card ", timer)
    return instance.post(`/api/v1/timer`,timer, {
      headers: {
        'Authorization': bearerAuth(user),
        'Content-type': 'application/json'
      }
    })
  }

  function stopTimer(user, id){
  
    return instance.put(`/api/v1/timer/stop/${id}`,{}, {
      headers: {
        'Authorization': bearerAuth(user),
        'Content-type': 'application/json'
      }
    })
  }*/

  function updateTimerDescription(user,id, timer){

      return instance.put(`/api/v1/timer/update-timer-description/${id}`,timer, {
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      })
    }

    function deleteTimer(user,deleteRowId){

          return instance.delete(`/api/v1/timer/delete/${deleteRowId}`, {
            headers: {
              'Authorization': bearerAuth(user),
              'Content-type': 'application/json'
            }
          })
        }

