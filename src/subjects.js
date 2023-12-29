import { Mp1 } from './components/user/subjects/mp1'
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
        components: <Mp1 name="Math 1"/>,
        image: math1
        
    },
    {
        links: "math2",
       name: "Math2",
       section: ["MP"],
       components: <Mp1 name="MAth2"/>,
       image: math2
    },
    {
        links:"maths",
        name: "Maths",
        section: ["MP", "PC","PT","BG"],
        components: <Mp1 name="Maths"/>,
        image: maths
    },
    { 
        links:"physique",
        name: "Physique",
        section: ["MP", "PC","PT","BG"],
        components : <Mp1/>,
        image: physique

    },
    {
        links: "chimie",
        name: "Chimie",
        section: ["MP", "PC","PT","BG"],
        components: <Mp1/>,
        image: chimie
    },
    { 
        links: "sta",
        name:"STA",
        section: ["MP","PC","PT"],
        components: <Mp1/>,
        image: sta
    },
    {
        links: "info",
        name: "INFO",
        section: ["MP", "PC","PT","BG"],
        components: <Mp1/>,
        image: info
    },
    {
        links: "anglais",
        name:"Anglais",
        section: ["MP","PC","PT","BG"],
        components: <Mp1/>,
        image: anglais
    },
    {
        links: "francais",
        name: "Francais",
        section: ["MP","PC","PT","BG"],
        components: <Mp1/>,
        image: francais
    },
    {
        link: "cfm",
        name: "CFM",
        section: ["PT"],
        components: <Mp1/>,
        image:"dd"
    },
    {
        link: "geologie",
        name: "Geologie",
        section: ["BG"],
        components: <Mp1/>,
        image: geologie
    },
    {  link: "bio_animal",
       name: "Bio.Animal",
       section:["BG"],
       components: <Mp1/>,
       image: bio_animale
        
    },
    {
        link: "bio_vegetable",
        name: "Bio.vegetale",
        section:["BG"],
        components: <Mp1/>,
        image: bio_vegetable
    },
    {
        link: "bio_cellelaire",
        name: "Bio.cellelaire",
        section: ["BG"],
        components: Mp1,
        image: ""
    }


];

export default subjects
