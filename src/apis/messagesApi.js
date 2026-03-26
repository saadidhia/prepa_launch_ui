import { bearerAuth } from './AuthApi';
import { instance } from './adminApi';

export const MAX_MESSAGE_LENGTH = 2000;

export const messagesApi = {
  sendMessage,
  getMyConversation,
  getAdminConversations,
  getAdminConversationByUserId,
  replyToConversation,
  deleteConversation,
  createUserSse,
  createAdminSse,
};

function sendMessage(user, payload) {
  return instance.post('/api/v1/messages', payload, {
    headers: {
      Authorization: bearerAuth(user),
      'Content-type': 'application/json',
    },
  });
}

function getMyConversation(user) {
  return instance.get('/api/v1/messages/me', {
    headers: {
      Authorization: bearerAuth(user),
      'Content-type': 'application/json',
    },
  });
}

function getAdminConversations(admin) {
  return instance.get('/api/v1/messages/admin/conversations', {
    headers: {
      Authorization: bearerAuth(admin),
      'Content-type': 'application/json',
    },
  });
}

function getAdminConversationByUserId(admin, userId) {
  return instance.get(`/api/v1/messages/admin/conversations/user/${userId}`, {
    headers: {
      Authorization: bearerAuth(admin),
      'Content-type': 'application/json',
    },
  });
}

function replyToConversation(admin, conversationId, payload) {
  return instance.post(`/api/v1/messages/admin/conversations/${conversationId}/reply`, payload, {
    headers: {
      Authorization: bearerAuth(admin),
      'Content-type': 'application/json',
    },
  });
}

function deleteConversation(admin, conversationId) {
  return instance.delete(`/api/v1/messages/admin/conversations/${conversationId}`, {
    headers: {
      Authorization: bearerAuth(admin),
      'Content-type': 'application/json',
    },
  });
}

function createUserSse(token) {
  return new EventSource(buildSseUrl('api/v1/messages/sse/user', token));
}

function createAdminSse(token) {
  return new EventSource(buildSseUrl('api/v1/messages/sse/admin', token));
}

export function getConversationCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.conversations)) {
    return payload.conversations;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export function normalizeConversation(conversation) {
  const messages = normalizeMessages(conversation?.messages || conversation?.messageDtos || conversation?.items || []);
  const user = conversation?.user || conversation?.candidate || conversation?.owner || {};
  const lastMessage = messages[messages.length - 1] || null;

  return {
    id: conversation?.id ?? conversation?.conversationId ?? null,
    userId: conversation?.userId ?? user?.id ?? conversation?.candidateId ?? null,
    username:
      conversation?.username ??
      user?.username ??
      user?.preferredUsername ??
      conversation?.preferredUsername ??
      '',
    userFullName:
      conversation?.userFullName ??
      conversation?.name ??
      user?.name ??
      conversation?.fullName ??
      '',
    userEmail: conversation?.userEmail ?? user?.email ?? conversation?.email ?? '',
    unreadAdminCount:
      toNumber(
        conversation?.unreadAdminCount ??
          conversation?.adminUnreadCount ??
          conversation?.unreadCountAdmin ??
          conversation?.unreadForAdmin
      ),
    unreadUserCount:
      toNumber(
        conversation?.unreadUserCount ??
          conversation?.userUnreadCount ??
          conversation?.unreadCountUser ??
          conversation?.unreadForUser
      ),
    messages,
    lastMessage,
    lastMessageAt:
      lastMessage?.createdAt ||
      conversation?.lastMessageAt ||
      conversation?.updatedAt ||
      conversation?.createdAt ||
      null,
  };
}

export function normalizeMessage(message, index = 0) {
  const senderRole = `${message?.senderRole || message?.role || message?.sender || ''}`.toUpperCase();

  return {
    id: message?.id ?? `${senderRole || 'MESSAGE'}-${index}`,
    content: message?.content ?? message?.message ?? message?.text ?? '',
    senderRole: senderRole === 'ADMIN' ? 'ADMIN' : 'USER',
    isRead: Boolean(message?.isRead ?? message?.read ?? false),
    createdAt:
      message?.createdAt ??
      message?.sentAt ??
      message?.createdDate ??
      message?.date ??
      null,
  };
}

export function normalizeMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .map((message, index) => normalizeMessage(message, index))
    .sort((left, right) => getDateValue(left.createdAt) - getDateValue(right.createdAt));
}

function getDateValue(value) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildSseUrl(path, token) {
  const baseURL = process.env.REACT_APP_API || '';
  const serializedToken = encodeURIComponent(token || '');
  return `${baseURL}${path}?token=${serializedToken}`;
}