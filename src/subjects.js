import { Mp1 } from './components/user/subjects/mp1'

const subjects = [
    { 
        links: "math1",
        name: "Math1",
        section: ["MP"],
        components: <Mp1 name="Math 1"/>
        
    },
    {
        links: "math2",
       name: "Math2",
       section: ["MP"],
       components: <Mp1 name="MAth2"/>
    },
    {
        links:"maths",
        name: "Maths",
        section: ["MP", "PC","PT","BG"],
        components: <Mp1 name="Maths"/>
    },
    { 
        links:"physique",
        name: "Physique",
        section: ["MP", "PC","PT","BG"],
        components : <Mp1/>

    },
    {
        links: "chimie",
        name: "Chimie",
        section: ["MP", "PC","PT","BG"],
        components: <Mp1/>
    },
    { 
        links: "sta",
        name:"STA",
        section: ["MP","PC","PT"],
        components: <Mp1/>
    },
    {
        links: "info",
        name: "INFO",
        section: ["MP", "PC","PT","BG"],
        components: <Mp1/>
    },
    {
        links: "anglais",
        name:"Anglais",
        section: ["MP","PC","PT","BG"],
        components: <Mp1/>
    },
    {
        links: "francais",
        name: "Francais",
        section: ["MP","PC","PT","BG"],
        components: <Mp1/>
    },
    {
        link: "cfm",
        name: "CFM",
        section: ["PT"],
        components: <Mp1/>
    },
    {
        link: "geologie",
        name: "Geologie",
        section: ["BG"],
        components: <Mp1/>
    },
    {  link: "bio_animal",
       name: "Bio.Animal",
       section:["BG"],
       components: <Mp1/>
        
    },
    {
        link: "bio_vegetable",
        name: "Bio.vegetale",
        section:["BG"],
        components: <Mp1/>
    },
    {
        link: "bio_cellelaire",
        name: "Bio.cellelaire",
        section: ["BG"],
        components: Mp1
    }


];

export default subjects
