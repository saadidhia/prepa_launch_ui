import { instance } from './adminApi'
import { bearerAuth } from './AuthApi'

export const quizzesApi = {
  // User endpoints
  getQuizzes,
  getQuizById,
  submitAttempt,
  getMyAttempts,
  getMyAttemptsForQuiz,

  // Admin endpoints
  adminGetQuizzes,
  adminCreateQuiz,
  adminUpdateQuiz,
  adminDeleteQuiz,
  adminAddQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
  adminGetAttempts,
}

function getQuizzes(user, params = {}) {
  return instance.get('/api/v1/quizzes', {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    },
    params
  })
}

function getQuizById(user, quizId) {
  return instance.get(`/api/v1/quizzes/${quizId}`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function submitAttempt(user, quizId, payload) {
  return instance.post(`/api/v1/quizzes/${quizId}/attempt`, payload, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function getMyAttempts(user) {
  return instance.get('/api/v1/quizzes/attempts/me', {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function getMyAttemptsForQuiz(user, quizId) {
  return instance.get(`/api/v1/quizzes/${quizId}/attempts/me`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

// Admin endpoints

function adminGetQuizzes(user) {
  return instance.get('/api/v1/quizzes/admin', {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminCreateQuiz(user, quiz) {
  return instance.post('/api/v1/quizzes/admin', quiz, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminUpdateQuiz(user, quizId, quiz) {
  return instance.put(`/api/v1/quizzes/admin/${quizId}`, quiz, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminDeleteQuiz(user, quizId) {
  return instance.delete(`/api/v1/quizzes/admin/${quizId}`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminAddQuestion(user, quizId, question) {
  return instance.post(`/api/v1/quizzes/admin/${quizId}/questions`, question, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminUpdateQuestion(user, quizId, questionId, question) {
  return instance.put(`/api/v1/quizzes/admin/${quizId}/questions/${questionId}`, question, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminDeleteQuestion(user, quizId, questionId) {
  return instance.delete(`/api/v1/quizzes/admin/${quizId}/questions/${questionId}`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}

function adminGetAttempts(user, quizId) {
  return instance.get(`/api/v1/quizzes/admin/${quizId}/attempts`, {
    headers: {
      'Authorization': bearerAuth(user),
      'Content-type': 'application/json'
    }
  })
}
