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
     // const data = await response.json();
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
        // TODO: Add endpoint for subscribed toggle if different from check
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
      'MP': 'Maths-Physique',
      'PC': 'Physique-Chimie',
      'PT': 'Physique-Technologie',
      'BG': 'Biologie-Géologie'
    };
    return labels[field] || field;
  };

  const getDurationLabel = (duration) => {
    const labels = {
      'ONE': '1 mois',
      'THREE': '3 mois',
      'SIX': '6 mois',
      'TEN': '10 mois'
    };
    return labels[duration] || duration;
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
              <option value="MP">MP</option>
              <option value="PC">PC</option>
              <option value="PT">PT</option>
              <option value="BG">BG</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Tous les niveaux</option>
              <option value="PREMIERE">Première année</option>
              <option value="DEUXIEME">Deuxième année</option>
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
              <th>Durée</th>
              <th>Vérifié</th>
              <th>Abonné</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="13" className="empty-state">
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
                      {person.level === 'PREMIERE' ? '1ère' : '2ème'}
                    </span>
                  </td>
                  <td className="gender-cell">
                    <span className="gender-icon">
                      {person.gender === 'MALE' ? '👨' : '👩'}
                    </span>
                  </td>
                  <td className="duration-cell">
                    {getDurationLabel(person.duration)}
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
    </div>
  );
};

export default Interested;