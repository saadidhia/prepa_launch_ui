import React from 'react';
import PaginatedTable from '../utilComponent/PaginatedTable';
import TimerForm from '../user/timerForm';

const columns = [
  { id: 'day', label: 'Jour' },
  { id: 'start', label: 'Debut' },
  { id: 'stop', label: 'Fin' },
  { id: 'subject', label: 'Matiere' },
  { id: 'description', label: 'Description' },
  
];

const rows = [
    { id: 1, day: 'Monday', start: '08:00', stop: '10:00', subject: 'Math', description: 'Algebra and Geometry' },
    { id: 2, day: 'Tuesday', start: '10:00', stop: '12:00', subject: 'Science', description: 'Physics and Chemistry' },
    { id: 3, day: 'Wednesday', start: '08:00', stop: '10:00', subject: 'History', description: 'Ancient Civilizations' },
    { id: 4, day: 'Thursday', start: '10:00', stop: '12:00', subject: 'Geography', description: 'Physical and Human Geography' },
    { id: 5, day: 'Friday', start: '08:00', stop: '10:00', subject: 'Literature', description: 'Classical and Modern Literature' },
    { id: 6, day: 'Monday', start: '10:00', stop: '12:00', subject: 'Art', description: 'Painting and Sculpture' },
    { id: 7, day: 'Tuesday', start: '08:00', stop: '10:00', subject: 'Music', description: 'Theory and Practice' },
    { id: 8, day: 'Wednesday', start: '10:00', stop: '12:00', subject: 'Physical Education', description: 'Fitness and Sports' },
    { id: 9, day: 'Thursday', start: '08:00', stop: '10:00', subject: 'Biology', description: 'Human Anatomy and Ecology' },
    { id: 10, day: 'Friday', start: '10:00', stop: '12:00', subject: 'Computer Science', description: 'Programming and Algorithms' },
  ];

const Timer = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1>Timer</h1>
      <TimerForm></TimerForm>
      <PaginatedTable columns={columns} rows={rows} />
    </div>
  );
};

export default Timer;
