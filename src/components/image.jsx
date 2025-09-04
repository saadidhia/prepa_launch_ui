import React from "react";

export const Image = ({ name, price, description, subjects, fields, levels, largeImage, link }) => {
  return (
    <div className="livres-item">
      <div className="hover-bg">
        {" "}
        <a href={link} name={name} data-lightbox-gallery="gallery1">
          <div className="hover-text">
            <h1>{name}</h1>
            <h5>{description}</h5>
            <h4>{subjects}</h4>
            <h4>{levels}</h4>
            <h4>{fields}</h4>
            <h3>{price} Dt</h3>
            
          </div>
          <img src={link} className="img-responsive" alt={name} />{" "}
        </a>{" "}
      </div>
    </div>
  );
};
