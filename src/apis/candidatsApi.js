import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const candidatsApi = {
    getMotivations,
    createNote,
    getCards,
    deleteCard,
    getCardById,
    updateCardById,
    getMyProfile
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
  console.log("card ", card)
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

function getMyProfile (user){
  return instance.get('api/v1/profile',{
    headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
    })
}
