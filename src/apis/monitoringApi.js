import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const monitoringApi = {
  startSession,
  endSession,
  reportEvent,
  getMySessions,
  adminGetAllSessions,
  adminGetSessionStats,
}

function startSession(user) {
  return instance.post('/api/v1/monitoring/session/start', {}, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function endSession(user, sessionId) {
  return instance.post(`/api/v1/monitoring/session/end/${sessionId}`, {}, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function reportEvent(user, sessionId, eventType) {
  return instance.post('/api/v1/monitoring/event', { sessionId, eventType }, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function getMySessions(user) {
  return instance.get('/api/v1/monitoring/sessions/me', {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminGetAllSessions(user) {
  return instance.get('/api/v1/monitoring/admin/sessions', {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminGetSessionStats(user, sessionId) {
  return instance.get(`/api/v1/monitoring/admin/session/${sessionId}/stats`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}
