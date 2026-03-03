import React, { useEffect, useState } from "react";
import { Image } from "./image";
import { externalApi } from "../apis/externalApi"


export const Books = (props) => {

  const [externalBooks, setExternalBooks] = useState([])


  const fetchExternalBooks = async () => {
    const response = await externalApi.getExternalBooks();
    console.log(response.data);
    setExternalBooks(response.data);
  }

  useEffect(() => {
    fetchExternalBooks()
  }
    , []);

  return (
    <div id="livres" className="text-center" style={{ direction: "rtl" }}>
      <div className="container">
        <div className="section-title">
          <h2>الكتب المتوفرة</h2>
          <p>
            استكشف مجموعتنا من الكتب المتاحة للتعلم! تصفح عناويننا واطلب الآن للعثور على كتابك التعليمي التالي.
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
              : "جاري التحميل..."}
          </div>
        </div>
      </div>
    </div>
  );
};