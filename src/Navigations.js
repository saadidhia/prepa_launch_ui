import {Premiere} from './components/user/premiere'
import {Users} from './components/admin/users'
import { SignUp } from './components/admin/signUp';



const navigations = [
    {
        text: "Premiere",
        link: "premiere",
        component: Premiere,
      //  icon: OverviewIcon
        role: "user"
    },
   
    
    {
        text: "users",
        link: "users",
        component: Users,
       // icon: HistoryIcon
        role: "admin"
    },
    {
        text: "Register",
        link: "register",
        component: SignUp,
        role: "admin"
    }

   
];

export default navigations
