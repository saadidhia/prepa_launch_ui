import {Users} from './components/admin/users'
import { SignUp } from './components/admin/signUp';



const adminNavigations = [
 
   
    
    {
        text: "users",
        link: "users",
        component: Users,
       // icon: HistoryIcon
       
    },
    {
        text: "Register",
        link: "register",
        component: SignUp,
       
    }

   
];

export default adminNavigations
