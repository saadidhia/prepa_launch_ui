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


instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response && error.response.status === 401) {
    console.log("Unauthorized error detected.");
    localStorage.removeItem('user'); // Adjust key based on how you're storing the token
    window.location.href = "/connexion"; // Redirect to login
  }
  return Promise.reject(error);
});
