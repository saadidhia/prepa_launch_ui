import { Content } from './components/user/subjects/Content'
import science from './assets/statics/science.png'
import math from './assets/statics/math.png'
import physique from './assets/statics/physique.png'
import philo from './assets/statics/philo.png'
import francais from './assets/statics/Francais.png'
import anglais from './assets/statics/anglais.png'
import arabe from './assets/statics/arabe.png'
import informatique from './assets/statics/informatique.jpg'
import histoire_geo from './assets/statics/histoire_geo.jpg'
import pensee_islamique from './assets/statics/pensee_islamique.jpg'
import algo from './assets/statics/algo.jpg'
import economie from './assets/statics/economie.jpg'
import gestion from './assets/statics/gestion.jpg'
import base_de_donnee from './assets/statics/base_de_donnee.jpeg'
import tech from './assets/statics/tech.jpeg'
import sport from './assets/statics/sport.jpeg'
import option from './assets/statics/option.jpeg'
//import sti from './assets/statics/sti.jpg'


const subjects = [
    { 
        links: "science",
        name: "science",
        section: ["MATH","SCIENCE","LETTER"],
        components: <Content name="Science"/>,
        image: science
        
    },
    {
        links: "math",
       name: "math",
       section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT"],
       components: <Content name="Math"/>,
       image: math
    },
    {
        links:"physique",
        name: "Physique",
        section: ["MATH","SCIENCE","TECH","INFO","SPORT"],
        components: <Content name="Physique"/>,
        image: physique
    },
    { 
        links:"philosophie",
        name: "Philosophie",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components : <Content/>,
        image: philo

    },
    {
        links: "Francais",
        name: "Francais",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: francais
    },
    { 
        links: "Anglais",
        name:"Anglais",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: anglais
    },
    {
        links: "Arabe",
        name: "Arabe",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: arabe
    },
    {
        links: "Informatique",
        name:"Informatique",
        section: ["MATH", "SCIENCE","TECH","ECO","SPORT","LETTER"],
        components: <Content/>,
        image: informatique
    },
    {
        links: "Histoire_Geographie",
        name: "Histoire Geographie",
        section: ["ECO","LETTER"],
        components: <Content/>,
        image: histoire_geo
    },
    {
        links: "Pensee_islamique",
        name: "Pensée islamique",
        section: ["LETTER"],
        components: <Content/>,
        image: pensee_islamique
    },
    {
        links: "Algorithmes",
        name: "Algorithmes",
        section: ["INFO"],
        components: <Content/>,
        image: algo
    },
    {  links: "Bases_de_donnees",
       name: "Bases de données",
       section:["INFO"],
       components: <Content/>,
       image: base_de_donnee
        
    },
    {
        links: "sti",
       name: "STI",
       section:["INFO"],
       components: <Content/>,
       image: informatique

    },
    {
        links: "technique",
        name: "Technique",
        section:["TECH"],
        components: <Content/>,
        image: tech
    },
    {
        links: "sport",
        name: "sport",
        section: ["MATH", "SCIENCE","TECH","ECO","INFO","SPORT","LETTER"],
        components: <Content/>,
        image: sport
    },
     {
        links: "economie",
        name: "Economie",
        section: ["ECO"],
        components: <Content/>,
        image: economie
    },
    {
        links: "gestion",
        name: "Gestion",
        section: ["ECO"],
        components: <Content/>,
        image: gestion
    },
    {
        links: "option",
        name: "Option",
        section: ["ECO","SCIENCE","LETTER","TECH","INFO","MATH","SPORT"],
        components: <Content/>,
        image: option
    }


];

export default subjects
