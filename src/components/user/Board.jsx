import React from 'react';
import Card from './Card'; 

const Board = ({  cards }) => {
    return (
        <div className="board">
          {console.log("cards cards",cards)}
        {cards.map((card, index) => (
          <Card
            key={index} 
            content={card}
          />
        ))}
      </div>
    );
  };

export default Board;