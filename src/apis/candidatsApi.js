import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const candidatsApi = {
    getMotivations,
    createNote,
    getCards
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
