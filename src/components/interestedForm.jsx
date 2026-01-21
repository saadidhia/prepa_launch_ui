import React, { useState } from 'react';
import '../assets/css/interested.css';
import axios from 'axios';
import logo from "../assets/logo/logo.png"; 

export const instance = axios.create({
  baseURL: process.env.REACT_APP_API
})

const InterestedForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    whatsappPhone: '',
    phone: '',
    field: '',
    level: '',
    gender: '',
    message: '',
    option: 'ALLEMAND'
  });

  const [invoicePhoto, setInvoicePhoto] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          invoice: 'Veuillez télécharger une image (JPEG, JPG ou PNG)'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          invoice: 'La taille du fichier ne doit pas dépasser 5 MB'
        }));
        return;
      }

      setInvoicePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoicePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.invoice) {
        setErrors(prev => ({
          ...prev,
          invoice: ''
        }));
      }
    }
  };

  const removeInvoicePhoto = () => {
    setInvoicePhoto(null);
    setInvoicePreview(null);
    // Reset file input
    const fileInput = document.getElementById('invoice');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.level) newErrors.level = 'Le niveau est requis';
    if (!formData.field) newErrors.field = 'La filière est requise';
    if (!formData.gender) newErrors.gender = 'Le genre est requis';
    if (!invoicePhoto) newErrors.invoice = 'La photo de facture est requise';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setSubmitStatus(null);
      
      try {
        // Create FormData object
        const formDataToSend = new FormData();
        
        // Add JSON data as a blob
        const apiData = {
          email: formData.email,
          name: formData.name,
          whatsappPhone: formData.whatsappPhone || formData.phone,
          phone: formData.phone,
          field: formData.field,
          level: formData.level.toUpperCase(),
          gender: formData.gender === 'Homme' ? 'MALE' : 'FEMALE',
          message: formData.message || '',
          option: formData.option
        };

        formDataToSend.append('data', new Blob([JSON.stringify(apiData)], {
          type: 'application/json'
        }));

        // Add invoice photo
        formDataToSend.append('invoice', invoicePhoto);

        const response = await instance.post('/api/v1/interested/create', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        if (response.status === 200) {
          const data = response.data;
          console.log('Success:', data);
          setSubmitStatus('success');
          
          // Reset form after successful submission
          setFormData({
            email: '',
            name: '',
            whatsappPhone: '',
            phone: '',
            field: '',
            level: '',
            gender: '',
            message: '',
            option: 'ALLEMAND'
          });
          setInvoicePhoto(null);
          setInvoicePreview(null);
          
          // Show success message for 5 seconds
          setTimeout(() => {
            setSubmitStatus(null);
          }, 5000);
        } else {
          const errorData = await response.json();
          console.error('Error:', errorData);
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
              <p className="brand-tagline">Classes Préparatoires</p>
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
                  placeholder="Votre nom complet"
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
                  <label htmlFor="phone">Téléphone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="+216 XX XXX XXX"
                    disabled={loading}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="whatsappPhone">WhatsApp</label>
                  <input
                    type="tel"
                    id="whatsappPhone"
                    name="whatsappPhone"
                    value={formData.whatsappPhone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    disabled={loading}
                  />
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

              {/* Gender and Duration Row */}
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
                  <label htmlFor="option">Option*</label>
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

              {/* Invoice Photo Upload */}
              <div className="form-group">
                <label htmlFor="invoice">Photo de la facture *</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="invoice"
                    name="invoice"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                  
                  {!invoicePreview ? (
                    <label htmlFor="invoice" className="file-upload-label">
                      <div className="upload-icon">📷</div>
                      <span>Cliquez pour télécharger la facture</span>
                      <small>JPEG, JPG ou PNG (Max 5 MB)</small>
                    </label>
                  ) : (
                    <div className="file-preview">
                      <img src={invoicePreview} alt="Invoice preview" className="preview-image" />
                      <button
                        type="button"
                        onClick={removeInvoicePhoto}
                        className="remove-file-btn"
                        disabled={loading}
                      >
                        ✕ Supprimer
                      </button>
                    </div>
                  )}
                </div>
                {errors.invoice && <span className="error-message">{errors.invoice}</span>}
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">Message (optionnel)</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Parlez-nous de vos objectifs..."
                  disabled={loading}
                />
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