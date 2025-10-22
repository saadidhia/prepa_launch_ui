import React, { useState, useEffect } from 'react'
import '../../assets/css/modernCalendar.css'
import AgendaFormular from '../small/agendaFormular'
import { useAuth } from '../context/AuthContext';
import { candidatsApi } from '../../apis/candidatsApi';
import { useNavigate } from "react-router-dom"
import { FaPlus, FaCheckCircle, FaTrash } from "react-icons/fa"; // ✅ added trash icon

const WEEK_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function formatDateISO(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  return date.toISOString().slice(0, 10);
}

export default function ModernCalendar() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [agendas, setAgendas] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeAgenda, setActiveAgenda] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const response = await candidatsApi.getAgendas(user);
        setAgendas(response.data);
      } catch (err) {
        console.error('Error fetching agendas:', err);
        setError('Failed to load agendas');
      }
    };
    fetchAgendas();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'low': return '#60a5fa';
      case 'optional': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const handleDeleteAgenda = async (id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this agenda?")) return;
    try {
      await candidatsApi.deleteAgenda(user, id);
      setAgendas(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Error deleting agenda:", err);
      alert("❌ Failed to delete agenda.");
    }
  };

  // ✅ Fixed: ensure alreadySpent is initialized to 0
  const addEvent = (formData) => {
    const newAgenda = {
      ...formData,
      date: formatDateISO(selectedDay),
      alreadySpent: 0, // ✅ default value added
    };
    setAgendas([...agendas, newAgenda]);
    setShowModal(false);
  };

  const handlePlusClick = (agenda) => {
    setActiveAgenda(agenda);
    setInputVisible(true);
  };

  const handleAddNumber = async () => {
    if (!activeAgenda) return;

    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0 || num > activeAgenda.timeShouldSpent) {
      alert(`Please enter a number between 0 and ${activeAgenda.timeShouldSpent}`);
      return;
    }

    const newAlreadySpent = (activeAgenda.alreadySpent || 0) + num;

    try {
      await candidatsApi.updateAgendaById(user, activeAgenda.id, newAlreadySpent);

      setAgendas(prev =>
        prev.map(ag =>
          ag.id === activeAgenda.id
            ? { ...ag, alreadySpent: newAlreadySpent }
            : ag
        )
      );

      alert(`✅ You added ${num} hours to "${activeAgenda.title}"`);
    } catch (err) {
      console.error("Error updating agenda:", err);
      alert("❌ Failed to update agenda");
    } finally {
      setInputVisible(false);
      setInputValue('');
    }
  };

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const days = [];
  for (let i = 0; i < startDay.getDay(); i++) days.push(null);
  for (let i = 1; i <= endDay.getDate(); i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-button" onClick={prevMonth}>◀ Précédent</button>
        <span style={{ fontWeight: 'bold', fontSize: '22px', margin: '5px' }}>
          {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
        </span>
        <button className="calendar-button" onClick={nextMonth}>Suivant ▶</button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {WEEK_DAYS.map(d => (
          <div key={d} style={{ padding: '8px', color: '#555', fontSize: '18px' }}>{d}</div>
        ))}

        {days.map((day, i) => (
          <div
            key={i}
            className="calendar-day-cell"
            style={{ backgroundColor: day ? '#f9f9f9' : '#e5e7eb' }}
            onClick={() => day && (setSelectedDay(day), setShowModal(true))}
          >
            {day && <div className="day-number">{day.getDate()}</div>}

            {day && agendas
              .filter(ag => {
                const dateValue = ag.date || ag.eventTime;
                if (!dateValue) return false;
                const parsed = new Date(dateValue);
                if (isNaN(parsed)) return false;
                return formatDateISO(parsed) === formatDateISO(day);
              })
              .map((ag, idx) => (
                <div key={idx} style={{
                  fontSize: '14px',
                  backgroundColor: getPriorityColor(ag.priority),
                  color: 'white',
                  margin: '3px 0',
                  borderRadius: '5px',
                  padding: '3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center'
                }}>
                  {ag.time} {ag.title.length > 25 ? ag.title.slice(0, 20) + '…' : ag.title}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Agenda Section */}
      <div>
        {agendas.length === 0 && <div style={{ color: '#777', fontSize: '16px' }}>No events</div>}
        {agendas.map((ag, i) => {
          const now = new Date();
          const remind = new Date(ag.remindTime);
          const event = new Date(ag.eventTime);
          const isActive = remind < now && now < event;

          const should = ag.timeShouldSpent || 0;
          const spent = ag.alreadySpent || 0;
          const percentage = should > 0 ? Math.min((spent / should) * 100, 100) : 0;
          const isCompleted = percentage >= 100;

          return (
            <div
              key={i}
              className="agenda-card"
              style={{
                borderLeft: `6px solid ${getPriorityColor(ag.priority)}`,
                position: "relative",
                backgroundColor: isCompleted ? "#e0f7e9" : "white",
                transition: "all 0.2s ease-in-out",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                borderRadius: "10px",
                marginBottom: "10px",
                padding: "10px 12px"
              }}
            >
              {/* ➕ Add Button */}
              <button
                disabled={!isActive}
                onClick={() => handlePlusClick(ag)}
                title={isActive ? "Add number" : "Not available yet"}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "50px",
                  backgroundColor: isActive ? "#3b82f6" : "#cbd5e1",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: isActive ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
              >
                <FaPlus size={14} />
              </button>

              {/* 🗑️ Delete Button */}
              <button
                onClick={() => handleDeleteAgenda(ag.id)}
                title="Delete Agenda"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
              >
                <FaTrash size={13} />
              </button>

              {/* Title */}
              <div
                style={{
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3em',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                {ag.title}
              </div>

              <div style={{ fontSize: '14px', color: '#555' }}>
                Event Date: {ag.eventTime && new Date(ag.eventTime).toLocaleDateString()}
              </div>

              <div style={{ fontSize: '14px', color: '#555' }}>
                First date Remind: {new Date(ag.remindTime).toLocaleDateString()} · {new Date(ag.remindTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div style={{ fontSize: '14px', color: '#555' }}>Time should spent: {ag.timeShouldSpent} Hours</div>
              <div style={{ fontSize: '14px', color: '#555' }}>Already Spent: {ag.alreadySpent} Hours</div>

              {isCompleted && (
                <FaCheckCircle
                  size={22}
                  color="#22c55e"
                  style={{ position: "absolute", bottom: "10px", right: "10px" }}
                  title="Completed"
                />
              )}

              <div style={{
                fontSize: '14px',
                color: isCompleted ? '#22c55e' : '#555',
                fontWeight: 'bold',
                marginTop: '5px'
              }}>
                Progress: {percentage.toFixed(0)}%
              </div>

              {ag.notes && ag.notes.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  justifyContent: 'center'
                }}>
                  {ag.notes.map((note, nIdx) => (
                    <button
                      key={nIdx}
                      onClick={() => navigate(`/dashboard/notes?id=${note.id}`)}
                      style={{
                        backgroundColor: '#e0e7ff',
                        color: '#1e3a8a',
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: '1px solid #c7d2fe',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        maxWidth: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={note.title}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c7d2fe'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#e0e7ff'}
                    >
                      {note.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Modal */}
      {inputVisible && activeAgenda && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            minWidth: "300px",
            textAlign: "center"
          }}>
            <h3 style={{ marginBottom: "10px" }}>Add Number for "{activeAgenda.title}"</h3>
            <h3 style={{ marginBottom: "10px" }}>Already Spent {activeAgenda.alreadySpent} hours</h3>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min="0"
              max={activeAgenda.timeShouldSpent - activeAgenda.alreadySpent}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                marginBottom: "10px"
              }}
            />
            <button
              onClick={handleAddNumber}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
            >
              Add
            </button>
            <button
              onClick={() => setInputVisible(false)}
              className="ml-2 bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showModal && selectedDay && (
        <AgendaFormular
          onClose={() => setShowModal(false)}
          onSave={addEvent}
          date={selectedDay}
        />
      )}
    </div>
  );
}
