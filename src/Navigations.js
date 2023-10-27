import {Premiere} from './components/user/premiere'
import {Users} from './components/admin/users'
import { SignUp } from './components/admin/signUp';
import { NotifCandidates } from './components/admin/notifCandidates';



const navigations = [
    {
        text: "Premiere",
        link: "premiere",
        component: Premiere,
        role: "user"
    },
   
    
    {
        text: "users",
        link: "users",
        component: Users,
        role: "admin"
    },
    {
        text: "Register",
        link: "register",
        component: SignUp,
        role: "admin"
    },
    {
        text: "NotifCandidates",
        link: "NotifiedCandidates",
        component: NotifCandidates,
        role: "admin"
    }

   
];

export default navigations
