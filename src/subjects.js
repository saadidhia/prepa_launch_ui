import { Content } from './components/user/subjects/Content'
import math1 from './assets/statics/math1.jpg'
import math2 from './assets/statics/math2.jpg'
import maths from './assets/statics/maths.jpg'
import physique from './assets/statics/physique.jpg'
import chimie from './assets/statics/chimie.jpg'
import sta from './assets/statics/sta.jpg'
import info from './assets/statics/info.jpg'
import anglais from './assets/statics/english.jpg'
import francais from './assets/statics/francais.jpg'
import geologie from './assets/statics/geologie.jpg'
import bio_animale from './assets/statics/bio_animale.jpg'
import bio_vegetable from './assets/statics/bio_vegetable.jpg'


const subjects = [
    { 
        links: "math1",
        name: "Math1",
        section: ["MP"],
        components: <Content name="Math 1"/>,
        image: math1
        
    },
    {
        links: "math2",
       name: "Math2",
       section: ["MP"],
       components: <Content name="Math2"/>,
       image: math2
    },
    {
        links:"maths",
        name: "Maths",
        section: ["MP", "PC","PT","BG"],
        components: <Content name="Maths"/>,
        image: maths
    },
    { 
        links:"physique",
        name: "Physique",
        section: ["MP", "PC","PT","BG"],
        components : <Content/>,
        image: physique

    },
    {
        links: "chimie",
        name: "Chimie",
        section: ["MP", "PC","PT","BG"],
        components: <Content/>,
        image: chimie
    },
    { 
        links: "sta",
        name:"STA",
        section: ["MP","PC","PT"],
        components: <Content/>,
        image: sta
    },
    {
        links: "info",
        name: "INFO",
        section: ["MP", "PC","PT","BG"],
        components: <Content/>,
        image: info
    },
    {
        links: "anglais",
        name:"Anglais",
        section: ["MP","PC","PT","BG"],
        components: <Content/>,
        image: anglais
    },
    {
        links: "francais",
        name: "Francais",
        section: ["MP","PC","PT","BG"],
        components: <Content/>,
        image: francais
    },
    {
        link: "cfm",
        name: "CFM",
        section: ["PT"],
        components: <Content/>,
        image:"dd"
    },
    {
        link: "geologie",
        name: "Geologie",
        section: ["BG"],
        components: <Content/>,
        image: geologie
    },
    {  link: "bio_animal",
       name: "Bio.Animal",
       section:["BG"],
       components: <Content/>,
       image: bio_animale
        
    },
    {
        link: "bio_vegetable",
        name: "Bio.vegetale",
        section:["BG"],
        components: <Content/>,
        image: bio_vegetable
    },
    {
        link: "bio_cellelaire",
        name: "Bio.cellelaire",
        section: ["BG"],
        components: <Content/>,
        image: ""
    }


];

export default subjects
