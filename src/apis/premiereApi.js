import { bearerAuth } from './AuthApi'
import { instance } from './adminApi'


export const premiereApi = {
  getPdfs
}


function getPdfs(user,subFolderName) {
  return instance.get(`/api/v1/drive/premiere`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    },
    params: {
      subFolderName
    }
  });
}