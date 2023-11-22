import {Cours} from './components/user/cours'
import {Exams} from './components/user/exams'
import {Series} from  './components/user/series'
import {Notes} from './components/user/notes'
import {Motivation} from './components/user/motivation'
import {Users} from './components/admin/users'
import { SignUp } from './components/admin/signUp';
import { NotifCandidates } from './components/admin/notifCandidates';
import { Resume } from './components/user/Resume'
import { CreateMotivation } from './components/admin/createMotivation'
import { Motivations } from './components/user/motivations'



const navigations = [
    {
        text: "Cours",
        link: "cours",
        component: Cours,
        role: "user"
    },
    {
        text: "Series",
        link: "series",
        component: Series,
        role: "user"
    },
    {
        text: "Exams",
        link: "exams",
        component: Exams,
        role: "user"
    },
    {
        text: "Resumes",
        link: "Resumes",
        component: Resume,
        role:"user"
    },
    {
        text: "Notes",
        link: "notes",
        component: Notes,
        role: "user"
    },
    {
        text: "Motivation",
        link: "motivation",
        component: Motivations,
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
    },
    {
        text: "write motivation",
        link: "CreateMotivation",
        component: CreateMotivation,
        role: "admin"

    }

   
];

export default navigations
