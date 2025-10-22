import { useState, useEffect } from 'react'
import { candidatsApi } from '../../apis/candidatsApi';
import { useAuth } from '../context/AuthContext';
import subjects from '../../subjects';
import { data } from 'autoprefixer';

export default function AgendaFormular({ onClose, onSave }) {
    const Auth = useAuth();
        const user = Auth.getUser();
const userSubjects = subjects.filter(subject => subject.section.includes(user.data.field)); // Default subjects, removing dependency on authentication

  const [cards, setCards] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '',
    eventTime: '',
    subject: '',
    timeShouldSpent: '',
    remindTime: '',
    cardIds: []
  })

  useEffect(() => {
  const fetchCards = async () => {
    try {
      const response = await candidatsApi.getCards(user); // fetch all cards
      const allCards = response.data;

      if (formData.subject) {
        // Make sure to compare strings correctly
        const filtered = allCards.filter(
          card => card.subject?.toLowerCase() === formData.subject.toLowerCase()
        );
        setCards(filtered);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    }
  };

  fetchCards();
}, [formData.subject]);


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Date validation
    if (formData.remindTime && formData.eventTime) {
        const remind = new Date(formData.remindTime);
        const event = new Date(formData.eventTime);
        if (event <= remind) {
            alert('Event Time must be after Remind Time');
            return; // stop form submission
        }
    }
    try {
        data =await candidatsApi.createAgenda(user, formData);
        console.log("dhaw",formData)
      console.log('Agenda created:', data)
      if (onSave) onSave(formData)
      alert('Agenda created successfully!')
      onClose()
    } catch (error) {
      console.error('Error creating agenda:', error)
      
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '15px'
  }

  const modalContainer = {
    backgroundColor: 'white',
    borderRadius: '18px',
    width: '90%',
    maxWidth: '900px',
    boxShadow: '0 6px 25px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn 0.3s ease'
  }

  const formGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '15px',
    alignItems: 'start'
  }

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: '5px',
    color: '#374151'
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '15px',
    boxSizing: 'border-box'
  }

  const buttonBar = {
    padding: '15px 25px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    backgroundColor: '#f9fafb'
  }

  const cancelButton = {
    backgroundColor: '#f3f4f6',
    color: '#333',
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '15px',
    minWidth: '100px'
  }

  const saveButton = {
    backgroundColor: '#1d4ed8',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
    minWidth: '100px'
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 600px) {
            form {
              padding: 15px;
            }
          }
        `}
      </style>

      <div style={overlayStyle}>
        <div style={modalContainer}>
          <form onSubmit={handleSubmit} style={{ padding: '25px' }}>
           

            {/* Horizontal grid form */}
            <div style={formGrid}>
              {/* Row 1: Title + Description */}
              <div>
                <label style={labelStyle}>Titre</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Examen physique à 9h30"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Description courte ..."
                />
              </div>

              {/* Row 2: Type + Priority */}
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="DS">DS</option>
                  <option value="EXAMEN">EXAMEN</option>
                  <option value="TP">TP</option>
                  <option value="OTHER">AUTRE</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priorité</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              {/* Row 3: Event Time + Subject */}
              <div>
                <label style={labelStyle}>Heure de l’événement</label>
                <input
                  type="datetime-local"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
  <label style={labelStyle}>Sujets</label>
  <select
    name="subject"
    value={formData.subject}
    onChange={handleChange}
    style={inputStyle}
    required
  >
    <option value="">Select Subject</option>
    {userSubjects.map((subj, idx) => (
      <option key={idx} value={subj.name}>{subj.name}</option>
    ))}
  </select>
</div>

              {/* Row 4: Time Should Spent + Remind Time */}
              <div>
                <label style={labelStyle}>Durée prévue (Heures)</label>
                <input
                  type="number"
                  name="timeShouldSpent"
                  value={formData.timeShouldSpent}
                  onChange={handleChange}
                  style={inputStyle}
                  min="1"
                  placeholder="e.g. 4"
                />
              </div>
              <div>
                <label style={labelStyle}>Première heure de rappel</label>
                <input
                  type="datetime-local"
                  name="remindTime"
                  value={formData.remindTime}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
  <label style={labelStyle}>Sélectionner des notes</label>
  <div
    style={{
      maxHeight: '150px',
      overflowY: 'auto',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px'
    }}
  >
    {cards.length === 0 ? (
      <p style={{ color: '#9ca3af', fontSize: '14px' }}>No cards for this subject</p>
    ) : (
      cards.map(card => (
        <div key={card.id} style={{ marginBottom: '5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              value={card.id}
              checked={formData.cardIds?.includes(card.id) || false}
              onChange={(e) => {
                const selected = formData.cardIds || [];
                if (e.target.checked) {
                  setFormData({ ...formData, cardIds: [...selected, card.id] });
                } else {
                  setFormData({
                    ...formData,
                    cardIds: selected.filter(id => id !== card.id)
                  });
                }
              }}
            />
            {card.title}
          </label>
        </div>
      ))
    )}
  </div>
</div>

          </form>

          {/* Footer Buttons */}
          <div style={buttonBar}>
            <button type="button" onClick={onClose} style={cancelButton}>Annuler</button>
            <button type="submit" onClick={handleSubmit} style={saveButton}>Enregistrer</button>
          </div>
        </div>
      </div>
    </>
  )
}
