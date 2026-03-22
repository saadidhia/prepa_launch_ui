import React, { useState } from 'react';
import '../assets/css/interested.css';
import axios from 'axios';
import logo from "../assets/logo/logo.png"; 

export const instance = axios.create({
  baseURL: process.env.REACT_APP_API
})

const CITIES = [
  { value: "TUNIS", label: "Tunis" },
  { value: "ARIANA", label: "Ariana" },
  { value: "BEN_AROUS", label: "Ben Arous" },
  { value: "MANOUBA", label: "Manouba" },
  { value: "NABEUL", label: "Nabeul" },
  { value: "ZAGHOUAN", label: "Zaghouan" },
  { value: "BIZERTE", label: "Bizerte" },
  { value: "BEJA", label: "Béja" },
  { value: "JENDOUBA", label: "Jendouba" },
  { value: "KEF", label: "Le Kef" },
  { value: "SILIANA", label: "Siliana" },
  { value: "SOUSSE", label: "Sousse" },
  { value: "MONASTIR", label: "Monastir" },
  { value: "MAHDIA", label: "Mahdia" },
  { value: "SFAX", label: "Sfax" },
  { value: "KAIROUAN", label: "Kairouan" },
  { value: "KASSERINE", label: "Kasserine" },
  { value: "SIDI_BOUZID", label: "Sidi Bouzid" },
  { value: "GABES", label: "Gabès" },
  { value: "MEDENINE", label: "Médenine" },
  { value: "TATAOUINE", label: "Tataouine" },
  { value: "GAFSA", label: "Gafsa" },
  { value: "TOZEUR", label: "Tozeur" },
  { value: "KEBILI", label: "Kébili" },
  { value: "NONE", label: "Autre" },
];

const InterestedForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
 //   whatsappPhone: '',
    phone: '',
    field: '',
    level: '',
    gender: '',
    option: 'ALLEMAND',
    city: ''
  });

  // -- INVOICE PHOTO (commented out for future use) --
  // const [invoicePhoto, setInvoicePhoto] = useState(null);
  // const [invoicePreview, setInvoicePreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  // -- FILE HANDLING (commented out for future use) --
  // const handleFileChange = (e) => { ... };
  // const removeInvoicePhoto = () => { ... };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    else if (formData.name.trim().split(/\s+/).length < 2) newErrors.name = 'Veuillez entrer votre prénom et nom (ex: Ahmed Ben Ali)';

    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    else if (!/^\d{8}$/.test(formData.phone.trim())) newErrors.phone = 'Le téléphone doit contenir exactement 8 chiffres';

    if (!formData.level) newErrors.level = 'Le niveau est requis';
    if (!formData.field) newErrors.field = 'La filière est requise';
    if (!formData.gender) newErrors.gender = 'Le genre est requis';
    if (!formData.city) newErrors.city = 'La ville est requise';
    // -- INVOICE VALIDATION (commented out for future use) --
    // if (!invoicePhoto) newErrors.invoice = 'La photo de facture est requise';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setSubmitStatus(null);
      
      try {
        const apiData = {
          email: formData.email,
          name: formData.name,
 //         whatsappPhone: formData.whatsappPhone || formData.phone,
          phone: formData.phone,
          field: formData.field,
          level: formData.level.toUpperCase(),
          gender: formData.gender === 'Homme' ? 'MALE' : 'FEMALE',
          option: formData.option,
          city: formData.city,
          // message: formData.message  -- removed (field deleted)
        };

        // -- OLD MULTIPART/FORM-DATA CALL (commented out for future use) --
        // const formDataToSend = new FormData();
        // ...
        console.log("API Data being sent:", apiData); // Debug log
        const response = await instance.post('/api/auth/signup/not-verified', apiData, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 200 || response.status === 201) {
          setSubmitStatus('success');
          setFormData({
            email: '',
            name: '',
 //         whatsappPhone: '',
            phone: '',
            field: '',
            level: '',
            gender: '',
            option: 'ALLEMAND',
            city: ''
          });
          // -- RESET INVOICE (commented out for future use) --
          // setInvoicePhoto(null);
          // setInvoicePreview(null);

          setTimeout(() => {
            setSubmitStatus(null);
          }, 5000);
        } else {
          setSubmitStatus('error');
        }
      } catch (error) {
        console.error('Network error:', error);
        setSubmitStatus('error');
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="subscription-container">
      <div className="subscription-wrapper">
        {/* Left Side - Logo & Branding */}
        <div className="branding-section">
          <div className="branding-content">
            <div className="logo-container">
              <img 
                src={logo} 
                alt="Prepa Launch Logo" 
                style={{ 
                  width: "280px", 
                  height: "auto", 
                  marginBottom: "16px",
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                }} 
              />
              <h2 className="brand-name">GRINTTA</h2>
              <p className="brand-tagline">Les classes du secondaire (3ème, Bac)</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">📚</div>
                <div>
                  <h3>Cours Complets</h3>
                  <p>Tous les cours et exercices dont vous avez besoin</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⏱️</div>
                <div>
                  <h3>Gestion du Temps</h3>
                  <p>Organisez votre emploi du temps efficacement</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📝</div>
                <div>
                  <h3>Notes & Rappels</h3>
                  <p>Ne manquez jamais un examen important</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <div>
                  <h3>Suivi de Progrès</h3>
                  <p>Visualisez votre évolution en temps réel</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📅</div>
                <div>
                  <h3>Agenda</h3>
                  <p>Suivez vos examens et ne manquez aucune échéance importante</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="form-section">
          <div className="form-content">
            <h1 className="form-title">Rejoignez Grintta</h1>
            <p className="form-subtitle">
              Inscrivez-vous pour accéder à tous nos cours et ressources
            </p>

            {submitStatus === 'success' && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <div>
                  <strong>Inscription réussie!</strong>
                  <p>Nous vous contacterons bientôt avec plus d'informations.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                <div>
                  <strong>Erreur d'inscription</strong>
                  <p>Une erreur s'est produite. Veuillez réessayer.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="subscription-form">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Prénom Nom (ex: Ahmed Ben Ali)"
                  disabled={loading}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="votre.email@exemple.com"
                  disabled={loading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Phone Numbers Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    Téléphone * <small style={{ fontWeight: 'normal', color: '#888' }}>(8 chiffres)</small>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="XX XXX XXX"
                    maxLength={8}
                    disabled={loading}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              {/* Level and Field Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="level">Niveau *</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={errors.level ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="troisieme">troisieme année</option>
                    <option value="bac">bac</option>
                  </select>
                  {errors.level && <span className="error-message">{errors.level}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="field">Filière *</label>
                  <select
                    id="field"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    className={errors.field ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="SCIENCE">SCIENCE - SECTION-SCIENCE</option>
                    <option value="MATH">MATH - SECTION MATH</option>
                    <option value="INFO">INFO - SECTION INFO</option>
                    <option value="TECH">TECH - SECTION TECH</option>
                    <option value="ECO">ECO - SECTION ECO</option>
                    <option value="LETTER">LETTER - SECTION LETTER</option>
                    <option value="SPORT">SPORT - SECTION SPORT</option>
                  </select>
                  {errors.field && <span className="error-message">{errors.field}</span>}
                </div>
              </div>

              {/* Gender and Option Row */}
              <div className="form-row">
                <div className="form-group">
                  <label>Genre *</label>
                  <div className="radio-group radio-group-vertical">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="Homme"
                        checked={formData.gender === 'Homme'}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <span>Homme</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value="Femme"
                        checked={formData.gender === 'Femme'}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <span>Femme</span>
                    </label>
                  </div>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="option">Option *</label>
                  <select
                    id="option"
                    name="option"
                    value={formData.option}
                    onChange={handleChange}
                    className={errors.option ? 'error' : ''}
                    disabled={loading}
                  >
                    <option value="ALLEMAND">Allemand</option>
                    <option value="ESPAGNOL">Espagnole</option>
                    <option value="ITALIEN">Italien</option>
                    <option value="TURC">Turc</option>
                    <option value="CHINOIS">Chinois</option>
                    <option value="DESSIN">Dessin</option>
                  </select>
                  {errors.option && <span className="error-message">{errors.option}</span>}
                </div>
              </div>

              {/* City */}
              <div className="form-group">
                <label htmlFor="city">Ville *</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Sélectionner une ville...</option>
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    S'inscrire maintenant
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>

              <p className="form-footer">
                En vous inscrivant, vous acceptez nos conditions d'utilisation
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestedForm;