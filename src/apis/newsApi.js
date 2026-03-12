

import { bearerAuth } from './AuthApi'
import { instance } from './adminApi'


export const newsApi = {
  getNews, 
}


function getNews(user) {
    return instance.get('/api/v1/news',{
        headers: {
          'Authorization': bearerAuth(user),
          'Content-type': 'application/json'
        }
      });

}