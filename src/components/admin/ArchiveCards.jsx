import React, { useEffect,useState } from "react"
import Card from "../user/Card";
import { useAuth } from '../context/AuthContext';
import {adminApi} from '../../apis/adminApi'


export function ArchiveCards() { 


    const Auth = useAuth();
    const admin = Auth.getUser();
   const [archiveCards, setArchiveCards] = useState([]);

  const fetchArchiveCards = async () => { 
    try {
        const response = await adminApi.getArchiveCards(admin);
        console.log("response", response);
        const data = response.data;
        console.log("data archive Cards", data);
        setArchiveCards(data);
    } catch (error) {
        console.error('Error fetching Archive Cards:', error);
    }
};

    useEffect(() => {
        fetchArchiveCards();
    }, []);

    const handleDelete = async (cardId) => {
        try {
          await adminApi.deleteArchiveCard(admin,cardId);
          setArchiveCards(prevArchiveCards => prevArchiveCards.filter(card => card.id !== cardId));
    
        console.log("DELETe")
         // onDelete(); // Trigger the parent component to update state or re-fetch data
        } catch (error) {
          console.error('Error deleting Archive card:', error);
        }
    
    
    };
   


    return (
        <>
        <h1>WE SURVIVE</h1>
        <>
        <div className="board">
        {archiveCards.map((card, index) => (
          <Card
            key={index} 
            content={card}
            onDelete={()=>handleDelete(card.id)}
         //   onUpdate={handleUpdate}
          />
        ))}
      </div>
        </>
        </>
    )

}