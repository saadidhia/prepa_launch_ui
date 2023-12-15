import React from 'react';
import Card from './Card'; 

const Board = ({  cards,handleDelete }) => {
    return (
        <div className="board">
          {console.log("cards cards",cards)}
        {cards.map((card, index) => (
          <Card
            key={index} 
            content={card}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

export default Board;