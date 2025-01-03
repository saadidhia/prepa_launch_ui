import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const candidatsApi = {
    getMotivations,
    createNote,
    getCards,
    deleteCard,
    getCardById,
    updateCardById,
    getMyProfile,
    updateNumberPhone,
    getSubscriptions,
    updateCardStatusById,
    getMyStatisticsBasedOnRangeDate,
}

function getMotivations(user) {
    return instance.get('/api/motivations',{
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      });

}

function createNote(user, card){
  return instance.post(`/api/cards`,card, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function getCards(user) {
  return instance.get('/api/cards',{
      headers: {
        'Authorization': bearerAuth(user),
        'Content-type': 'application/json'
      }
    });

}

function deleteCard(user,id){
  return instance.delete(`api/cards/${id}`,{
  headers: {
        'Authorization': bearerAuth(user),
        'Content-type': 'application/json'
      }
  })
}

function getCardById (user, id){
return instance.get(`api/cards/${id}`, {
  headers: {
        'Authorization': bearerAuth(user),
        'Content-type': 'application/json'
      }
  } )
}

function updateCardById (user,id,card ){
  return instance.put(`api/cards/${id}`,card,{
    headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
    })
}

function updateCardStatusById(user,id,status){
  return instance.patch(`api/cards/${id}?status=${status}`,null,{
    headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
    })
}

function getMyProfile (user){
  return instance.get('api/v1/profile',{
    headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
    })
}

function updateNumberPhone(user, numberPhone) {
  return instance.patch(`api/v1/profile/change?numberPhone=${numberPhone}`, null, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json',
    },
  });
}


function getSubscriptions(user){

  return instance.get('/api/v1/subscriptions',{
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })

}


  function getMyStatisticsBasedOnRangeDate(user, subjects, startDate, endDate) {
    // Create an object to hold query parameters
    const params = {};
  
    if (subjects) {
      params.subjects = subjects.join(','); // Convert subjects array to a comma-separated string
    }
    if (startDate) {
      params.startDate = startDate; // Expect startDate in 'yyyy-MM-dd' format
    }
    if (endDate) {
      params.endDate = endDate; // Expect endDate in 'yyyy-MM-dd' format
    }
    console.log("params ", params)
    // Make the API call
    return instance.get('/api/v1/statistics/subjects', {
      headers: {
        'Authorization': bearerAuth(user),
        'Content-Type': 'application/json',
      },
      params, // Axios will handle query parameters
    });
  }
  

