import { bearerAuth } from './AuthApi'
import { instance } from './adminApi'


export const premiereApi = {
  getPdfs
}

function getPdfs(user, subFolderName) {
  console.log("level"+ user.data.level);
  console.log("field"+ user.data.field);
  console.log("sub"+ subFolderName);
  return instance.get(`/api/files?folderPrefix=${user.data.level}/${user.data.field}/${subFolderName}`, {
   // headers: {
     // 'Authorization': bearerAuth(user),
     // 'Content-Type': 'application/json'
   // },
  //  params: {
    //  subFolderName
   // }
  });
}