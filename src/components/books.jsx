import React, { useEffect, useState } from "react";
import { Image } from "./image";
import { externalApi } from "../apis/externalApi"


export const Books = (props) => {

  const [externalBooks, setExternalBooks] = useState([])


  const fetchExternalBooks = async () => {
    const response = await externalApi.getExternalBooks();
    setExternalBooks(response.data);
  }

  useEffect(() => {
    fetchExternalBooks()
  }
    , []);

  return (
    <div id="livres" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Livres disponibles</h2>
          <p>

            Explorez notre collection de livres disponibles pour apprendre ! Parcourez nos titres et passez commande dès maintenant pour trouver votre prochain livre d'apprentissage.
          </p>
        </div>
        <div className="row">
          <div className="livres-items">
            {externalBooks
              ? externalBooks.map((b, i) => (
                <div
                  key={`${b.name}-${i}`}
                  className="col-sm-6 col-md-4 col-lg-4"
                >

                  <Image
                    name={b.name}
                    description={b.description}
                    price={b.price}
                    levels={b.levels}
                    subjects={b.subjects}
                    fields={b.fields}
                    link={b.link}
                    largeImage={b.largeImage}
                    smallImage={b.smallImage}
                  />
                </div>
              ))
              : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
};
