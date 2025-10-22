import React, { useState } from "react";
import '../css/services.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faUser, faPhone, faEnvelope, faVenusMars, faGraduationCap, faBook } from "@fortawesome/free-solid-svg-icons";

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

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [level, setLevel] = useState("");
  const [branch, setBranch] = useState("");

  const handleSelectPlan = (plan) => setSelectedPlan(plan);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Bonjour, je souhaite souscrire au plan ${selectedPlan.plan} (${selectedPlan.price}).
Nom: ${name}, Téléphone: ${phone}, Email: ${email}, Genre: ${gender}, Niveau: ${level}, Branche: ${branch}`;
    const whatsappNumber = "+4917684505107"; // replace with your number
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    // reset
    setSelectedPlan(null);
    setName("");
    setPhone("");
    setEmail("");
    setGender("");
    setLevel("");
    setBranch("");
  };

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
                <button className="btn btn-primary" onClick={() => handleSelectPlan(plan)}>
                  sélectionner un plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Form */}
        {selectedPlan && (
          <div className="modal-overlay">
            <div className="modal-content form-modal">

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                  <input type="text" placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <FontAwesomeIcon icon={faPhone} className="input-icon" />
                  <input type="text" placeholder="Votre téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="input-group">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input type="email" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                  <FontAwesomeIcon icon={faVenusMars} className="input-icon" />
                  <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                    <option value="">Sélectionnez le genre</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
                <div className="input-group">
                  <FontAwesomeIcon icon={faGraduationCap} className="input-icon" />
                  <select value={level} onChange={(e) => setLevel(e.target.value)} required>
                    <option value="">Sélectionnez le niveau</option>
                    <option value="Premiere">Première</option>
                    <option value="Deuxieme">Deuxième</option>
                  </select>
                </div>
                <div className="input-group">
                  <FontAwesomeIcon icon={faBook} className="input-icon" />
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
                    <option value="">Sélectionnez la branche</option>
                    <option value="MP">MP</option>
                    <option value="PC">PC</option>
                    <option value="PT">PT</option>
                    <option value="BG">BG</option>
                  </select>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn btn-primary">Envoyer à WhatsApp</button>
                  <button type="button" className="btn btn-danger" onClick={() => setSelectedPlan(null)}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
