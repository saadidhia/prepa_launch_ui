import { Cours } from './components/user/cours'
import { Exams } from './components/user/exams'
import { Series } from './components/user/series'
import { Notes } from './components/user/notes'
import { Users } from './components/admin/users'
import { SignUp } from './components/admin/signUp';
import { NotifCandidates } from './components/admin/notifCandidates';
import { Resume } from './components/user/Resume'
import { CreateMotivation } from './components/admin/createMotivation'
import { Motivations } from './components/user/motivations'
import { Concours } from './components/user/Concours'
import { ArchiveCards } from './components/admin/ArchiveCards'
import { CreateBook } from './components/admin/createBook'
import { Books } from './components/admin/Books'
import Chronometer  from './components/user/chronometer'
import { UsersStat } from './components/admin/UsersStat'
import { Progression } from './components/user/Progression'


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
        link: "resumes",
        component: Resume,
        role: "user"
    },
    {
        text: "Concours",
        link: "Concours",
        component: Concours,
        role: "user"

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

    },
    {
        text: "Motivation mananegement",
        link: "motivation-admin",
        component: Motivations,
        role: "admin"
    },
    {
        text: "Archive Cards",
        link: "archive_cards",
        component: ArchiveCards,
        role: "admin"
    },
    {
        text: "Book",
        link: "book",
        component: CreateBook,
        role: "admin"
    },
    {
        text: "Books",
        link: "books",
        component: Books,
        role: "admin"
    },
    {
        text: "Chronometer",
        link: "chronometer",
        component:  Chronometer,
        role: "user"
    },
    {
        text: "Statics",
        link: "statics",
        component:  UsersStat,
        role: "admin"
        
    },
    {
        text: "Progression",
        link: "progression",
        component:  Progression,
        role: "user"
        
    }


];

export default navigations
