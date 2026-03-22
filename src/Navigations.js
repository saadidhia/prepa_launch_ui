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
import { Progression }  from './components/user/Progression'
import Agenda from './components/user/Agenda'
import{ News }from './components/admin/News'
import { Content } from './components/user/subjects/Content'
import { NewsRead } from './components/user/NewsRead'
import {  NotVerifiedUsers } from './components/admin/Activate'

const navigations = [
     {
        text: "الكتب",
        link: "books",
        component: Content,
        role: "user"
    },
    {
        text: "الدروس",
        link: "cours",
        component: Cours,
        role: "user"
    },
    {
        text: "تمارين",
        link: "series",
        component: Series,
        role: "user"
    },
    {
        text: "الإمتحانات",
        link: "exams",
        component: Exams,
        role: "user"
    },
   /* {
        text: "الملاحظات",
        link: "resumes",
        component: Resume,
        role: "user"
    },
   /* {
        text: "مسابقات",
        link: "Concours",
        component: Concours,
        role: "user"
    },*/
    {
        text: "ملاحظاتي",
        link: "notes",
        component: Notes,
        role: "user"
    },
    /* {
        text: "تحفيز",
        link: "motivation",
        component: Motivations,
        role: "user"
    }, */

    {
        text: "المستخدمون",
        link: "users",
        component: Users,
        role: "admin"
    },
    {
        text: "تفعيل المستخدمين",
        link: "activation",
        component: NotVerifiedUsers,
        role: "admin"
    },
    {
        text: "تسجيل",
        link: "register",
        component: SignUp,
        role: "admin"
    },
    {
        text:"الأخبار",
        link:"news",
        component:News,
        role:"admin"

    },
    {
        text: "المرشحون المُبلّغون",
        link: "NotifiedCandidates",
        component: NotifCandidates,
        role: "admin"
    },
    {
        text: "كتابة تحفيز",
        link: "CreateMotivation",
        component: CreateMotivation,
        role: "admin"
    },
    {
        text: "إدارة التحفيز",
        link: "motivation-admin",
        component: Motivations,
        role: "admin"
    },
    {
        text: "بطاقات الأرشيف",
        link: "archive_cards",
        component: ArchiveCards,
        role: "admin"
    },
    {
        text: "كتاب",
        link: "book",
        component: CreateBook,
        role: "admin"
    },
    {
        text: "الكتب",
        link: "books",
        component: Books,
        role: "admin"
    },
    {
        text: "مؤقت التركيز",
        link: "chronometer",
        component: Chronometer,
        role: "user"
    },
    {
        text: "إحصائيات",
        link: "statics",
        component: UsersStat,
        role: "admin"
    },
    {
        text: "تقدمك الدراسي",
        link: "progression",
        component: Progression,
        role: "user"
    },
    {
        text: "مواعيد الإمتحانات",
        link: "agenda",
        component: Agenda,
        role: "user"
    },
    {
        text:"الأخبار",
        link:"ournews",
        component: NewsRead,
        role:"user"
    }
];

export default navigations
