import { bearerAuth } from './AuthApi'
import { instance } from './adminApi'


export const filesApi = {
  getPdfs,
  presignedUrl,
  getPdfProgress,
  updatePdfProgress
}

function buildFolderPrefix(user, subFolderName) {
  let finalSubFolderName = subFolderName;
  if (subFolderName.toLowerCase().endsWith('option')) {
    finalSubFolderName = `${subFolderName}/${user.data.option}`;
  }
  return `${user.data.level}/${user.data.field}/${finalSubFolderName}`;
}

function getPdfs(user, subFolderName) {
  return instance.get(`/api/files?folderPrefix=${buildFolderPrefix(user, subFolderName)}`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-Type': 'application/json'
    }
  });
}

function getPdfProgress(user) {
  return instance.get('/api/pdf-progress', {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-Type': 'application/json'
    }
  });
}

function updatePdfProgress(user, pdfKey, inProgress, completed) {
  return instance.put('/api/pdf-progress', { pdfKey, inProgress, completed }, {
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
