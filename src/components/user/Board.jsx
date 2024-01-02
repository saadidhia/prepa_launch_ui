import React from 'react';
import Card from './Card'; 

const Board = ({  cards,handleDelete, handleUpdate }) => {
    return (
        <div className="board">
          {console.log("cards cards",cards)}
        {cards.map((card, index) => (
          <Card
            key={index} 
            content={card}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    );
  };

export default Board;