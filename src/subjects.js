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
import bio_cellelaire from './assets/statics/bio_cellelaire.jpg'


const subjects = [
    { 
        links: "science",
        name: "science",
        section: ["MATH","SCIENCE","LETTER"],
        components: <Content name="Science"/>,
        image: math1
        
    },
    {
        links: "math",
       name: "math",
       section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT"],
       components: <Content name="Math"/>,
       image: math2
    },
    {
        links:"physique",
        name: "Physique",
        section: ["MATH","SCIENCE","TECH","INFO","SPORT"],
        components: <Content name="Physique"/>,
        image: maths
    },
    { 
        links:"philosophie",
        name: "Philosophie",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components : <Content/>,
        image: physique

    },
    {
        links: "Francais",
        name: "Francais",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: chimie
    },
    { 
        links: "Anglais",
        name:"Anglais",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: sta
    },
    {
        links: "Arabe",
        name: "Arabe",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: info
    },
    {
        links: "Informatique",
        name:"Informatique",
        section: ["MATH", "SCIENCE","TECH","ECO","SPORT","LETTER"],
        components: <Content/>,
        image: anglais
    },
    {
        links: "Histoire_Geographie",
        name: "Histoire Geographie",
        section: ["ECO","LETTER"],
        components: <Content/>,
        image: francais
    },
    {
        links: "Pensee_islamique",
        name: "Pensée islamique",
        section: ["LETTER"],
        components: <Content/>,
        image:"dd"
    },
    {
        links: "Algorithmes",
        name: "Algorithmes",
        section: ["INFO"],
        components: <Content/>,
        image: geologie
    },
    {  links: "Bases_de_donnees",
       name: "Bases de données",
       section:["INFO"],
       components: <Content/>,
       image: bio_animale
        
    },
    {
        links: "technique",
        name: "Technique",
        section:["TECH"],
        components: <Content/>,
        image: bio_vegetable
    },
    {
        links: "sport",
        name: "sport",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: bio_cellelaire
    },
     {
        links: "economie",
        name: "Economie",
        section: ["ECO"],
        components: <Content/>,
        image: bio_cellelaire
    },
    {
        links: "gestion",
        name: "Gestion",
        section: ["ECO"],
        components: <Content/>,
        image: bio_cellelaire
    }


];

export default subjects
