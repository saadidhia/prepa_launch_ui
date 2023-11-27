import React from 'react';
import Card from './Card'; // Import the Card component

const Board = ({  cards }) => {
    return (
        <div className="board">
        {cards.map((card, index) => (
          <Card
            key={index} // Ensure each card has a unique key
            title={card.title}
            content={card.content}
          />
        ))}
      </div>
    );
  };

export default Board;