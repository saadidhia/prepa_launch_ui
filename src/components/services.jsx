import React from "react";
import '../css/services.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export const Services = () => {
  const pricingData = [
    {
      plan: "Un mois",
      price: "25 Dt",
      features: [
        "Des cours",
        "Des Examens",
        "Des Series (Monastir, Tunis, Manar)",
        "Concours (Tunisie, France, Maroc)",
        "Suivez votre temps consacré à la préparation",
        "Gérez vos notes sous forme de résumé ou de règles",
        "Contrôlez-vous grâce à une statistique",
      ],
    },
    {
      plan: "Trois mois",
      price: "70 Dt",
      features: [
        "Des cours",
        "Des Examens",
        "Des Series (Monastir, Tunis, Manar)",
        "Concours (Tunisie, France, Maroc)",
        "Suivez votre temps consacré à la préparation",
        "Gérez vos notes sous forme de résumé ou de règles",
        "Contrôlez-vous grâce à une statistique",
      ],
    },
    {
      plan: "Six mois",
      price: "130 Dt",
      features: [
        "Des cours",
        "Des Examens",
        "Des Series (Monastir, Tunis, Manar)",
        "Concours (Tunisie, France, Maroc)",
        "Suivez votre temps consacré à la préparation",
        "Gérez vos notes sous forme de résumé ou de règles",
        "Contrôlez-vous grâce à une statistique",
      ],
    },
    {
      plan: "Dix mois",
      price: "210 Dt",
      features: [
        "Des cours",
        "Des Examens",
        "Des Series (Monastir, Tunis, Manar)",
        "Concours (Tunisie, France, Maroc)",
        "Suivez votre temps consacré à la préparation",
        "Gérez vos notes sous forme de résumé ou de règles",
        "Contrôlez-vous grâce à une statistique",
      ],
    },
  ];

  return (
    <div id="services" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Les Abonnements</h2>
          <p>

            Choisissez un plan qui correspond à vos besoins. Chaque plan offre des durées flexibles et des avantages uniques pour vous aider à réussir.
          </p>
        </div>
        <div className="row">
          {pricingData.map((plan, index) => (
            <div key={index} className="col-md-3 col-sm-6">
              <div className="pricing-card">
                <h4>{plan.plan}</h4>
                <h4>{plan.price}</h4>
                <ul>
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        style={{ color: "green", marginRight: "8px" }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="btn btn-primary">sélectionner un plan</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
