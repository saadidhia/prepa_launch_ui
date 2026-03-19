import React, { useState, useEffect } from 'react';
import '../../assets/css/interestedAdmin.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { bearerAuth } from '../../apis/AuthApi';


export const instance = axios.create({
  baseURL: process.env.REACT_APP_API
})

const Interested = () => {
  const [interestedList, setInterestedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const Auth = useAuth();
  const admin = Auth.getUser();

  useEffect(() => {
    fetchInterestedList();
  }, []);

  const fetchInterestedList = async () => {
    try {
      setLoading(true);
      console.log('Fetching interested list...'+admin.data.token);
      const response = await instance.get('/api/v1/interested/all',{
          headers: {
            'Authorization': bearerAuth(admin),
            'Content-type': 'application/json'
          }
        });
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch data');
      }
      console.log('Interested list fetched:', response.data);
      setInterestedList(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching interested list:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, field, currentValue) => {
    try {
      // Optimistic update
      setInterestedList(prevList =>
        prevList.map(item =>
          item.id === id ? { ...item, [field]: !currentValue } : item
        )
      );
      console.log(`Toggling ${field} for ID ${id} to ${!currentValue}`);

      // API call to update the backend
      if (field === 'checked') {
        await instance.patch(`/api/v1/interested/check/${id}`, {}, {
          headers: {
            'Authorization': bearerAuth(admin),
            'Content-type': 'application/json'
          }
        });
      } else if (field === 'subscribed') {
        await instance.patch(`/api/v1/interested/subscribe/${id}`, {}, {
          headers: {
            'Authorization': bearerAuth(admin),
            'Content-type': 'application/json'
          }
        });
      }

    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      // Revert on error
      fetchInterestedList();
    }
  };

  const handleImageClick = (imageUrl) => {
    // If it's already a full URL (e.g. S3 https://...), use it directly
    const fullUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${process.env.REACT_APP_API.replace(/\/$/, '')}/${imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl}`;
    setSelectedImage(fullUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showImageModal) {
        closeImageModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFieldLabel = (field) => {
    const labels = {
      'MATH': 'SECTION MATH',
      'SCIENCE': 'SECTION SCIENCE',
      'TECH': 'SECTION TECHNIQUE',
      'INFO': 'SECTION INFORMATIQUE',
      'ECO': 'SECTION ECONOMIE',
      'LETTER': 'SECTION LETTER',
      'SPORT': 'SECTION SPORT'
    };
    return labels[field] || field;
  };

  const getOptionLabel = (option) => {
    const labels = {
      'ALLEMAND': 'Allemand',
      'ESPAGNOL': 'Espagnole',
      'ITALIEN': 'Italien',
      'TURC': 'Turc',
      'CHINOIS': 'Chinois',
      'DESSIN': 'Dessin'
    };
    return labels[option] || option;
  };

  const getInvoiceFileName = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName;
  };

  // Filter logic
  const filteredList = interestedList.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm);
    
    const matchesField = filterField === 'ALL' || item.field === filterField;
    const matchesLevel = filterLevel === 'ALL' || item.level === filterLevel;
    
    return matchesSearch && matchesField && matchesLevel;
  });

  if (loading) {
    return (
      <div className="interested-list-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interested-list-container">
        <div className="error-state">
          <span className="error-icon">❌</span>
          <h3>{error}</h3>
          <button onClick={fetchInterestedList} className="retry-button">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interested-list-container">
      <div className="list-header">
        <div className="header-top">
          <h1 className="list-title">📋 Personnes Intéressées</h1>
          <div className="header-actions">
            <button onClick={fetchInterestedList} className="refresh-button">
              🔄 Actualiser
            </button>
            <div className="stats-badge">
              {filteredList.length} / {interestedList.length}
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Toutes les filières</option>
              <option value="MATH">SECTION MATH</option>
              <option value="SCIENCE">SECTION SCIENCE</option>
              <option value="TECH">SECTION TECHNIQUE</option>
              <option value="ECO">SECTION ECONOMIE</option>
              <option value="LETTER">SECTION LETTER</option>
              <option value="SPORT">SECTION SPORT</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Tous les niveaux</option>
              <option value="TROISIEME">Troisieme année</option>
              <option value="BAC">Bac</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="interested-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>WhatsApp</th>
              <th>Filière</th>
              <th>Niveau</th>
              <th>Genre</th>
              <th>Option</th>
              <th>Facture</th>
              <th>Vérifié</th>
              <th>Abonné</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="14" className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>Aucun résultat trouvé</p>
                </td>
              </tr>
            ) : (
              filteredList.map((person) => (
                <tr key={person.id}>
                  <td className="date-cell">{formatDate(person.createdAt)}</td>
                  <td className="time-cell">{formatTime(person.createdAt)}</td>
                  <td className="name-cell">{person.name}</td>
                  <td className="email-cell">{person.email}</td>
                  <td className="phone-cell">{person.phone}</td>
                  <td className="phone-cell">
                    {person.whatsappPhone || '-'}
                  </td>
                  <td className="field-cell">
                    <span className={`field-badge field-${person.field}`}>
                      {person.field}
                    </span>
                  </td>
                  <td className="level-cell">
                    <span className={`level-badge level-${person.level}`}>
                      {person.level === 'TROISIEME' ? '3ème' : 'Bac'}
                    </span>
                  </td>
                  <td className="gender-cell">
                    <span className="gender-icon">
                      {person.gender === 'MALE' ? '👨' : '👩'}
                    </span>
                  </td>
                  <td className="duration-cell">
                    {getOptionLabel(person.option)}
                  </td>
                  <td className="invoice-cell">
                    {person.invoicePhotoUrl ? (
                      <button
                        className="invoice-button"
                        onClick={() => handleImageClick(person.invoicePhotoUrl)}
                        title="Cliquez pour voir la facture"
                      >
                        📄 {getInvoiceFileName(person.invoicePhotoUrl)}
                      </button>
                    ) : (
                      <span className="no-invoice">Aucune</span>
                    )}
                  </td>
                  <td className="toggle-cell">
                    <button
                      className={`toggle-button ${person.checked ? 'active' : ''}`}
                      onClick={() => handleToggle(person.id, 'checked', person.checked)}
                      title={person.checked ? 'Vérifié' : 'Non vérifié'}
                    >
                      <span className="toggle-slider">
                        {person.checked ? '✓' : '○'}
                      </span>
                    </button>
                  </td>
                  <td className="toggle-cell">
                    <button
                      className={`toggle-button ${person.subscribed ? 'active' : ''}`}
                      onClick={() => handleToggle(person.id, 'subscribed', person.subscribed)}
                      title={person.subscribed ? 'Abonné' : 'Non abonné'}
                    >
                      <span className="toggle-slider">
                        {person.subscribed ? '✓' : '○'}
                      </span>
                    </button>
                  </td>
                  <td className="message-cell">
                    {person.message ? (
                      <div className="message-preview" title={person.message}>
                        {person.message.substring(0, 30)}
                        {person.message.length > 30 ? '...' : ''}
                      </div>
                    ) : (
                      <span className="no-message">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="image-modal-overlay"
          onClick={closeImageModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              animation: 'scaleIn 0.2s ease'
            }}
          >
            {/* Close button */}
            <button
              className="modal-close-button"
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 1
              }}
            >
              ✕
            </button>

            {/* Title */}
            <p style={{
              margin: 0,
              fontWeight: '600',
              fontSize: '14px',
              color: '#374151',
              alignSelf: 'flex-start'
            }}>
              📄 Facture
            </p>

            {/* Image */}
            <img
              src={selectedImage}
              alt="Facture"
              className="modal-image"
              style={{
                maxWidth: '80vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />


          </div>

          {/* Keyframe animations injected inline */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.92); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Interested;