import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const timersApi = {
    getTimers,
    startTimer,
    stopTimer
}

function getTimers(user) {
    return instance.get('/api/v1/timer',{
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      });

}

function startTimer(user, timer){
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
  }