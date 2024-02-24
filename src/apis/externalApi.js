import { instance } from './adminApi'

export const externalApi = {
    getExternalBooks
    
  }

 function getExternalBooks() {
    return instance.get('/api/books/external')
  }