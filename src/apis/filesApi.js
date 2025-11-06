import { bearerAuth } from './AuthApi'
import { instance } from './adminApi'


export const filesApi = {
  getPdfs,
  presignedUrl
}

function getPdfs(user, subFolderName) {
  return instance.get(`/api/files?folderPrefix=${user.data.level}/${user.data.field}/${subFolderName}`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-Type': 'application/json'
    }
  });
}

function presignedUrl(user, pdf,expiryMinutes) {
  return instance.get(`/api/url?key=${encodeURIComponent(pdf)}&expiryMinutes=${expiryMinutes}`, {
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
   
    localStorage.removeItem('user'); // Adjust key based on how you're storing the token
    window.location.href = "/connexion"; // Redirect to login
  }
  return Promise.reject(error);
});
