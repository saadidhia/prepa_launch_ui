import { bearerAuth } from './AuthApi'
import { instance } from './adminApi'


export const filesApi = {
  getPdfs
}

function getPdfs(user, subFolderName) {
  return instance.get(`/api/files?folderPrefix=${user.data.level}/${user.data.field}/${subFolderName}`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-Type': 'application/json'
    }
  });
}