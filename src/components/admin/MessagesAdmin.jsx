import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
import { useAuth } from '../context/AuthContext';
import {
  getConversationCollection,
  MAX_MESSAGE_LENGTH,
  messagesApi,
  normalizeMessage,
  normalizeMessages,
  normalizeConversation,
} from '../../apis/messagesApi';
import { handleLogError } from '../../misc/Helpers';

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getUserInitials(conversation) {
  const source = conversation.userFullName || conversation.username || 'U';
  return source.trim().charAt(0).toUpperCase();
}

function getPreviewText(conversation) {
  const preview = conversation.lastMessage?.content || 'لا توجد رسالة';
  return preview.length > 72 ? `${preview.slice(0, 72)}...` : preview;
}

function hasMessages(conversation) {
  if (!conversation) return false;
  if ((conversation.messages || []).length > 0) return true;
  if ((conversation.lastMessage?.content || '').trim().length > 0) return true;
  if (conversation.unreadAdminCount > 0 || conversation.unreadUserCount > 0) return true;
  return false;
}

function normalizeSseType(value) {
  return `${value || ''}`.trim().toUpperCase().replace(/[-\s]/g, '_');
}

function parseSsePayload(event) {
  if (!event?.data) return null;
  try {
    return JSON.parse(event.data);
  } catch {
    return null;
  }
}

export function MessagesAdmin() {
  const Auth = useAuth();

  // ─── Auth token ───────────────────────────────────────────────────────────────
  const [initialToken] = useState(() => {
    const stored = Auth.getUser();
    return stored?.accessToken || null;
  });
  const authToken = Auth.user?.accessToken || initialToken;
  const authTokenRef = useRef(authToken);
  useEffect(() => { authTokenRef.current = authToken; }, [authToken]);

  const authClient = useMemo(
    () => (authToken ? { accessToken: authToken } : null),
    [authToken]
  );

  // ─── State ────────────────────────────────────────────────────────────────────
  const messagesContainerRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);

  const limitDraft = useCallback((value) => value.slice(0, MAX_MESSAGE_LENGTH), []);

  const emojiOptions = [
    '😀', '😁', '😊', '😎', '🤩', '🙌', '👏', '🙏', '🤝', '👍',
    '💪', '🧠', '❤️', '🔥', '⚡', '🚀', '⭐', '🌟', '✨', '🎯',
    '🏆', '🥇', '🎖️', '📈', '✅', '💯', '📚', '📝', '⏳', '🏁',
  ];

  // ─── Filtered list ────────────────────────────────────────────────────────────
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((c) => {
      const haystack = [c.username, c.userFullName, c.userEmail]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [conversations, search]);

  // ─── Auto-scroll ──────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (messagesContainerRef.current && activeConversation?.messages?.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  // ─── Sync badge from conversations list ───────────────────────────────────────
  // Whenever the conversations list changes, push the authoritative total
  // unread count into AuthContext so the Dashboard badge stays accurate.
  useEffect(() => {
    const total = conversations.reduce((sum, c) => sum + c.unreadAdminCount, 0);
    Auth.updateUnreadMessages(total);
  }, [conversations]);

  // ─── Fetch conversation list (REST) ───────────────────────────────────────────
  const fetchConversations = useCallback(
    async (withLoader = false) => {
      if (!authClient) {
        if (withLoader) setLoadingList(false);
        return;
      }
      if (withLoader) setLoadingList(true);
      setError('');
      try {
        const response = await messagesApi.getAdminConversations(authClient);
        const normalized = getConversationCollection(response.data)
          .map(normalizeConversation)
          .filter(hasMessages)
          .sort((a, b) => {
            if (b.unreadAdminCount !== a.unreadAdminCount)
              return b.unreadAdminCount - a.unreadAdminCount;
            return (
              new Date(b.lastMessageAt || 0).getTime() -
              new Date(a.lastMessageAt || 0).getTime()
            );
          });
        setConversations(normalized);
        setSelectedUserId((current) => {
          if (normalized.some((c) => c.userId === current)) return current;
          return normalized[0]?.userId ?? null;
        });
      } catch (fetchError) {
        handleLogError(fetchError);
        setError('تعذر تحميل قائمة المحادثات.');
      } finally {
        if (withLoader) setLoadingList(false);
      }
    },
    [authClient]
  );

  // ─── Load single conversation (REST) ──────────────────────────────────────────
  const loadConversation = useCallback(
    async (userId) => {
      if (!authClient || !userId) { setActiveConversation(null); return; }
      setLoadingConversation(true);
      setError('');
      try {
        const response = await messagesApi.getAdminConversationByUserId(authClient, userId);
        const normalized = normalizeConversation(response.data);
        setActiveConversation(normalized);
        // Clear unread badge for this conversation — backend marked them read
        setConversations((current) =>
          current.map((c) =>
            c.userId === userId ? { ...c, ...normalized, unreadAdminCount: 0 } : c
          )
        );
      } catch (fetchError) {
        handleLogError(fetchError);
        setError('تعذر تحميل المحادثة المحددة.');
        setActiveConversation(null);
      } finally {
        setLoadingConversation(false);
      }
    },
    [authClient]
  );

  // Initial load
  useEffect(() => { fetchConversations(true); }, [fetchConversations]);

  // Load conversation when selection changes
  useEffect(() => { loadConversation(selectedUserId); }, [loadConversation, selectedUserId]);

  // ─── Stable refs for SSE handler ──────────────────────────────────────────────
  const fetchConversationsRef = useRef(fetchConversations);
  const loadConversationRef = useRef(loadConversation);
  const selectedUserIdRef = useRef(selectedUserId);
  const conversationsRef = useRef(conversations);
  useEffect(() => { fetchConversationsRef.current = fetchConversations; }, [fetchConversations]);
  useEffect(() => { loadConversationRef.current = loadConversation; }, [loadConversation]);
  useEffect(() => { selectedUserIdRef.current = selectedUserId; }, [selectedUserId]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // ─── SSE — connect ONCE on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token = authTokenRef.current;
    if (!token) return;

    const eventSource = messagesApi.createAdminSse(token);

    const onNewMessage = (event) => {
      const payload = parseSsePayload(event);
      if (!payload) return;

      const payloadType = normalizeSseType(
        payload?.type || payload?.eventType || payload?.event
      );
      const eventType = normalizeSseType(event?.type);
      const messagePayload =
        payload?.message ?? payload?.data ?? (payload?.content ? payload : null);
      if (!messagePayload) return;

      const incoming = normalizeMessage(messagePayload);
      const isUserMessage =
        payloadType === 'NEW_MESSAGE' ||
        eventType === 'NEW_MESSAGE' ||
        (payloadType === '' && incoming.senderRole === 'USER');
      if (!isUserMessage) return;

      // ── Update sidebar list ──────────────────────────────────────────────────
      setConversations((current) =>
        current.map((conversation) => {
          const matchById = payload.userId && conversation.userId === payload.userId;
          const matchByUsername =
            !payload.userId &&
            payload.senderUsername &&
            conversation.username === payload.senderUsername;
          if (!matchById && !matchByUsername) return conversation;
          return {
            ...conversation,
            unreadAdminCount: conversation.unreadAdminCount + 1,
            lastMessage: incoming,
            lastMessageAt: incoming.createdAt || conversation.lastMessageAt,
          };
        })
      );
      // Note: the useEffect above that watches `conversations` will automatically
      // push the new total to Auth.updateUnreadMessages — no extra call needed here.

      // ── Update open conversation panel if this message belongs to it ─────────
      const currentSelectedUserId = selectedUserIdRef.current;
      const isActiveConversation =
        (payload.userId && payload.userId === currentSelectedUserId) ||
        (!payload.userId &&
          payload.senderUsername &&
          payload.senderUsername ===
            conversationsRef.current.find((c) => c.userId === currentSelectedUserId)?.username);

      if (isActiveConversation) {
        setActiveConversation((current) => {
          if (!current) return current;
          const mergedMessages = normalizeMessages([...(current.messages || []), incoming]);
          return {
            ...current,
            messages: mergedMessages,
            lastMessage: mergedMessages[mergedMessages.length - 1] || null,
            lastMessageAt: incoming.createdAt || current.lastMessageAt,
          };
        });
      }

      fetchConversationsRef.current(false);
      if (!isActiveConversation && currentSelectedUserId) {
        loadConversationRef.current(currentSelectedUserId);
      }
    };

    eventSource.addEventListener('new-message', onNewMessage);
    eventSource.addEventListener('new_message', onNewMessage);
    eventSource.addEventListener('NEW_MESSAGE', onNewMessage);
    eventSource.onmessage = onNewMessage;

    return () => {
      eventSource.removeEventListener('new-message', onNewMessage);
      eventSource.removeEventListener('new_message', onNewMessage);
      eventSource.removeEventListener('NEW_MESSAGE', onNewMessage);
      eventSource.onmessage = null;
      eventSource.close();
    };
  }, []); // ← empty: one connection for the lifetime of this page

  // ─── Reply ────────────────────────────────────────────────────────────────────
  const handleReply = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!activeConversation?.id) { setError('يرجى اختيار محادثة قبل الرد.'); return; }
    if (!authClient) { setError('الجلسة غير صالحة، يرجى تسجيل الدخول مجددا.'); return; }
    if (!content) { setError('يرجى كتابة رد.'); return; }
    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`يجب ألا يتجاوز الرد ${MAX_MESSAGE_LENGTH} حرفا.`);
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await messagesApi.replyToConversation(authClient, activeConversation.id, { content });
      setDraft('');
      setSuccess('تم إرسال الرد.');
      await Promise.all([fetchConversations(false), loadConversation(selectedUserId)]);
    } catch (replyError) {
      handleLogError(replyError);
      setError('فشل إرسال الرد.');
    } finally {
      setSending(false);
    }
  };

  // ─── Delete conversation ──────────────────────────────────────────────────────
  const handleDeleteConversation = async () => {
    if (!activeConversation?.id || !authClient) {
      setError('الجلسة غير صالحة، يرجى تسجيل الدخول مجددا.');
      return;
    }
    const confirmed = window.confirm('هل تريد حذف هذه المحادثة وجميع رسائلها؟');
    if (!confirmed) return;

    setError('');
    setSuccess('');
    try {
      await messagesApi.deleteConversation(authClient, activeConversation.id);
      setSuccess('تم حذف المحادثة.');
      setDraft('');
      setActiveConversation(null);
      await fetchConversations(false);
    } catch (deleteError) {
      handleLogError(deleteError);
      setError('فشل حذف المحادثة.');
    }
  };

  // ─── Emoji picker ─────────────────────────────────────────────────────────────
  const openEmojiMenu = (event) => setEmojiAnchorEl(event.currentTarget);
  const closeEmojiMenu = () => setEmojiAnchorEl(null);
  const addEmojiToDraft = (emoji) => {
    setDraft((current) => limitDraft(`${current}${emoji}`));
    closeEmojiMenu();
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  if (loadingList) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
          color: 'white',
          boxShadow: '0 18px 40px rgba(30, 58, 138, 0.24)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <MailOutlineRoundedIcon />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>صندوق رسائل الإدارة</Typography>
              </Stack>
              <Typography sx={{ opacity: 0.9, maxWidth: 720 }}>
                استعرض جميع المحادثات، وافتح محادثة أي مستخدم، ثم أرسل الرد دون مغادرة لوحة التحكم.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
              <Chip
                icon={<MarkEmailUnreadRoundedIcon />}
                label={`${conversations.reduce((sum, c) => sum + c.unreadAdminCount, 0)} غير مقروءة`}
                sx={{ backgroundColor: 'rgba(255,255,255,0.16)', color: 'white' }}
              />
              <Chip
                icon={<ForumRoundedIcon />}
                label={`${conversations.length} محادثة`}
                sx={{ backgroundColor: 'rgba(255,255,255,0.16)', color: 'white' }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2.5}>
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* ── Conversation list ─────────────────────────────────────────────── */}
          <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>المحادثات</Typography>
              <TextField
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن مستخدم..."
                InputProps={{ startAdornment: <SearchRoundedIcon sx={{ color: '#64748b', mr: 1 }} /> }}
              />
            </Box>

            {filteredConversations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>لا توجد محادثات</Typography>
                <Typography variant="body2" color="text.secondary">لا توجد نتائج مطابقة لبحثك.</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredConversations.map((conversation, index) => (
                  <Box key={conversation.id || conversation.userId || index}>
                    <ListItemButton
                      selected={conversation.userId === selectedUserId}
                      onClick={() => setSelectedUserId(conversation.userId)}
                      sx={{
                        px: 2.5, py: 2, alignItems: 'flex-start',
                        '&.Mui-selected': { backgroundColor: '#dbeafe' },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
                        <Avatar sx={{ bgcolor: '#1d4ed8' }}>{getUserInitials(conversation)}</Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <ListItemText
                              primary={conversation.userFullName || conversation.username || 'مستخدم'}
                              secondary={conversation.userEmail || conversation.username || ''}
                              primaryTypographyProps={{
                                sx: { fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                              }}
                              secondaryTypographyProps={{
                                sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                              }}
                            />
                            {conversation.unreadAdminCount > 0 && (
                              <Chip size="small" color="error" label={conversation.unreadAdminCount} sx={{ fontWeight: 700 }} />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                            {getPreviewText(conversation)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(conversation.lastMessageAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    </ListItemButton>
                    <Divider />
                  </Box>
                ))}
              </List>
            )}
          </Card>

          {/* ── Conversation panel ────────────────────────────────────────────── */}
          <Card sx={{ borderRadius: 4, minHeight: 640 }}>
            {!selectedUserId ? (
              <Box sx={{ minHeight: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 4 }}>
                <Box>
                  <ForumRoundedIcon sx={{ fontSize: 52, color: '#1d4ed8', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>اختر محادثة</Typography>
                  <Typography color="text.secondary">افتح محادثة مستخدم لقراءة كامل الرسائل والرد عليه.</Typography>
                </Box>
              </Box>
            ) : loadingConversation ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : activeConversation ? (
              <>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {activeConversation.userFullName || activeConversation.username || 'مستخدم'}
                      </Typography>
                      <Typography color="text.secondary">
                        {activeConversation.userEmail || activeConversation.username || ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        icon={<PersonRoundedIcon />}
                        label={`المستخدم #${activeConversation.userId || '-'}`}
                        sx={{ backgroundColor: '#e2e8f0' }}
                      />
                      <Button variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={handleDeleteConversation}>
                        حذف
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                <Box
                  ref={messagesContainerRef}
                  sx={{
                    p: { xs: 2, md: 3 },
                    backgroundColor: '#f8fafc',
                    minHeight: 360,
                    maxHeight: { xs: 420, md: 560 },
                    overflowY: 'auto',
                    scrollBehavior: 'smooth',
                  }}
                >
                  <Stack spacing={2}>
                    {activeConversation.messages.map((message) => {
                      const isAdminMessage = message.senderRole === 'ADMIN';
                      return (
                        <Box
                          key={message.id}
                          sx={{ display: 'flex', justifyContent: isAdminMessage ? 'flex-end' : 'flex-start' }}
                        >
                          <Box
                            sx={{
                              maxWidth: { xs: '100%', md: '78%' },
                              background: isAdminMessage
                                ? 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)'
                                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              color: isAdminMessage ? 'white' : '#0f172a',
                              borderRadius: 3,
                              px: 2,
                              py: 1.75,
                              border: isAdminMessage ? 'none' : '1px solid #e2e8f0',
                              boxShadow: isAdminMessage
                                ? '0 14px 28px rgba(29, 78, 216, 0.2)'
                                : '0 8px 24px rgba(15, 23, 42, 0.08)',
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              {isAdminMessage ? <SupportAgentRoundedIcon fontSize="small" /> : <PersonRoundedIcon fontSize="small" />}
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {isAdminMessage ? 'الإدارة' : 'المستخدم'}
                              </Typography>
                              {!isAdminMessage && message.isRead && (
                                <Chip size="small" label="مقروء" sx={{ height: 22 }} />
                              )}
                            </Stack>
                            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {message.content}
                            </Typography>
                            <Divider sx={{ my: 1.25, opacity: isAdminMessage ? 0.2 : 1 }} />
                            <Typography
                              variant="caption"
                              sx={{ color: isAdminMessage ? 'rgba(255,255,255,0.78)' : 'text.secondary' }}
                            >
                              {formatDateTime(message.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>

                <Divider />

                <Box component="form" onSubmit={handleReply} sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>الرد</Typography>
                  <TextField
                    fullWidth multiline minRows={4} maxRows={10}
                    value={draft}
                    onChange={(e) => setDraft(limitDraft(e.target.value))}
                    placeholder="اكتب ردك للمستخدم..."
                    helperText={`${draft.length}/${MAX_MESSAGE_LENGTH}`}
                  />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      عند فتح هذا الحوار، يتم تعليم رسائل المستخدم كمقروءة لدى الإدارة.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
                      <IconButton onClick={openEmojiMenu} sx={{ border: '1px solid #cbd5e1', borderRadius: 2 }} aria-label="إضافة رمز تعبيري">
                        <EmojiEmotionsRoundedIcon />
                      </IconButton>
                      <Button
                        type="submit" variant="contained" endIcon={<ReplyRoundedIcon />} disabled={sending}
                        sx={{
                          alignSelf: { xs: 'stretch', sm: 'auto' },
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
                          px: 3, py: 1.25,
                        }}
                      >
                        {sending ? 'جاري الإرسال...' : 'إرسال الرد'}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 4 }}>
                <Typography color="text.secondary">لم يتم العثور على المحادثة.</Typography>
              </Box>
            )}
          </Card>
        </Box>
      </Stack>

      <Menu
        anchorEl={emojiAnchorEl}
        open={Boolean(emojiAnchorEl)}
        onClose={closeEmojiMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem disableRipple sx={{ pointerEvents: 'none', opacity: 0.8 }}>اختر رمزا تعبيريا</MenuItem>
        <Box sx={{ px: 1.5, pb: 1.5, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
          {emojiOptions.map((emoji) => (
            <Button key={emoji} onClick={() => addEmojiToDraft(emoji)} sx={{ minWidth: 0, fontSize: 22, p: 0.5 }}>
              {emoji}
            </Button>
          ))}
        </Box>
      </Menu>
    </Box>
  );
}