import { Cours } from './components/user/cours'
import { Exams } from './components/user/exams'
import { Series } from './components/user/series'
import { Notes } from './components/user/notes'
import { Quizzes } from './components/user/Quizzes'
import { AdminQuizzes } from './components/admin/AdminQuizzes'
import { AdminMonitoring } from './components/admin/AdminMonitoring'
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
import { Messages } from './components/user/Messages'
import { MessagesAdmin } from './components/admin/MessagesAdmin'
import NewsIcon from './assets/css/icons/news.png'
import BookIcon from './assets/css/icons/books.png'
import CoursIcon from './assets/css/icons/cours.png'
import SeriesIcon from './assets/css/icons/series.png'
import MessageIcon from './assets/css/icons/message.png'
import StatisticIcon from './assets/css/icons/statistic.png'
import AgendaIcon from './assets/css/icons/agenda.png'
import ChronometerIcon from './assets/css/icons/chronometer.png'
import NotesIcon from './assets/css/icons/notes.png'
import ExamsIcon from './assets/css/icons/exams.png'

const navigations = [
     {
        text: "الكتب",
        link: "books",
        component: Content,
        role: "user",
        icon: BookIcon
    },
    {
        text: "الدروس",
        link: "cours",
        component: Cours,
        role: "user",
        icon: CoursIcon
    },
    {
        text: "تمارين",
        link: "series",
        component: Series,
        role: "user",
        icon: SeriesIcon
    },
    {
        text: "الإمتحانات",
        link: "exams",
        component: Exams,
        role: "user",
        icon: ExamsIcon
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
        role: "user",
        icon: NotesIcon
    },
    {
        text: "مراسلة الإدارة",
        link: "messages",
        component: Messages,
        role: "user",
        icon: MessageIcon
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
        text: "الرسائل",
        link: "messages-admin",
        component: MessagesAdmin,
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
        role: "user",
        icon: ChronometerIcon
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
        role: "user",
        icon: StatisticIcon
    },
    {
        text: "مواعيد الإمتحانات",
        link: "agenda",
        component: Agenda,
        role: "user",
        icon: AgendaIcon
    },
    {
        text:"الأخبار",
        link:"ournews",
        component: NewsRead,
        role:"user",
        icon: NewsIcon
    },
    {
        text: "أسئلة تقييمية",
        link: "quizzes",
        component: Quizzes,
        role: "user",
        icon: ExamsIcon
    },
    {
        text: "إدارة الاختبارات",
        link: "quizzes-admin",
        component: AdminQuizzes,
        role: "admin"
    },
   /* {
        text: "مراقبة التركيز",
        link: "monitoring-admin",
        component: AdminMonitoring,
        role: "admin"
    },*/
];

export default navigations
