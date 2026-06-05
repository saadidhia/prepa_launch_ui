import axios from 'axios'
// eslint-disable-next-line
import { config } from '../constants'
import { bearerAuth } from './AuthApi'
// eslint-disable-next-line
import { create } from '@mui/material/styles/createTransitions'

export const adminApi = {

  getUsers,
  getActiveSessionsCount,
  deleteUser,
  activateAndExtendUser,
  getNotifiedUsers,
  extendUser,
  createMotivation,
  deleteMotivation,
  getArchiveCards,
  deleteArchiveCard,
  updateArchiveCardById,
  createBook,
  getBooks,
  deleteBook,
  getStatics,
  resetSession,
  createNews,
  deleteNews,
  getNotVerifiedUsers,
  verifyUser,
  getCandidatesPerMonth
}

export const instance = axios.create({
  baseURL: process.env.REACT_APP_API
})

function getUsers(admin, page=0 , size=10, email, activeOnly=false) {
  return instance.get('/api/admin', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    },
    params: {
      page,
      size,
      email,
      activeOnly: activeOnly || undefined
    }
  })
}

function getNotVerifiedUsers(admin) {
  return instance.get('/api/admin/users/not-activated', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function verifyUser(admin, username) {
    return instance.patch(
        `/api/auth/signup/verify/${username}`,
        {},
        {
            headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
        }
    );
}


function getActiveSessionsCount(admin) {
  return instance.get('/api/admin/active-sessions', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function createBook(book, admin) {
  return instance.post('/api/books', book, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function getBooks(admin){
  return instance.get('/api/books', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }

  })
}

function deleteBook(admin,id){
  
  return instance.delete(`/api/books/${id}`, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function extendUser(admin, username, months) {
  return instance.post(`/api/admin/${username}/${months}`, null, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-Type': 'application/json'
    }
  });
}



function deleteUser(admin, username) {
  return instance.delete(`/api/admin/delete/${username}`, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function activateAndExtendUser(admin, userId, subscription) {
  return instance.post(`/api/admin/subscriptions/extend/${userId}`,subscription, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function getNotifiedUsers(admin){
  
  return instance.get('/api/admin/users/notified',{
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })

}

function createMotivation(admin, motivation){
  
  return instance.post('/api/motivations',motivation,{
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })

  

}

function deleteMotivation(admin,motivationId){
 
  instance.delete(`/api/motivations/${motivationId}`,{headers: {
    'Authorization': bearerAuth(admin),
    'Content-type': 'application/json'
  }})

}

function getArchiveCards(admin) {
  return instance.get('/api/v1/archive_cards', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function deleteArchiveCard(admin,id){
  return instance.delete(`/api/v1/archive_cards/${id}`,{
  headers: {
        'Authorization': bearerAuth(admin),
        'Content-type': 'application/json'
      }
  })
}

function updateArchiveCardById (admin,id,card ){
  return instance.put(`/api/v1/archive_cards/${id}`,card,{
    headers: {
          'Authorization': bearerAuth(admin),
          'Content-type': 'application/json'
        }
    })
}

function getStatics(admin){
  return instance.get('/api/admin/total/stat', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function resetSession(admin, username){
  return instance.delete(`/api/v1/sessions/remove?username=${username}`,{
    headers: {
          'Authorization': bearerAuth(admin),
          'Content-type': 'application/json'
        }
    })
}

function createNews(admin, news){

  const formData = new FormData();
  formData.append('title', news.title);
  formData.append('description', news.description);
  formData.append('image', news.image); 

  return instance.post('/api/admin/news', formData, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'multipart/form-data'
    }
  })
}

function deleteNews(admin, newsId){
  return instance.delete(`/api/admin/news/${newsId}`, {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    }
  })
}

function getCandidatesPerMonth(admin, year) {
  return instance.get('/api/admin/stats/candidates-per-month', {
    headers: {
      'Authorization': bearerAuth(admin),
      'Content-type': 'application/json'
    },
    params: { year }
  })
}
