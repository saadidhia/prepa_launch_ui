import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MarkChatReadRoundedIcon from '@mui/icons-material/MarkChatReadRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
import { useAuth } from '../context/AuthContext';
import {
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

export function Messages() {
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
  const [conversation, setConversation] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);

  const limitDraft = useCallback((value) => value.slice(0, MAX_MESSAGE_LENGTH), []);

  const emojiOptions = [
    '😀', '😁', '😊', '😎', '🤩', '🙌', '👏', '🙏', '🤝', '👍',
    '💪', '🧠', '❤️', '🔥', '⚡', '🚀', '⭐', '🌟', '✨', '🎯',
    '🏆', '🥇', '🎖️', '📈', '✅', '💯', '📚', '📝', '⏳', '🏁',
  ];

  const messages = useMemo(() => conversation?.messages || [], [conversation]);

  // ─── Auto-scroll ──────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // ─── Reset badge to 0 when this page mounts ───────────────────────────────────
  // The backend marks admin messages as read when GET /messages/me is called.
  // So as soon as the user lands on this page, their unread count is 0.
  // We do this once on mount, separately from fetchConversation, so that
  // subsequent silent refreshes (after sending a message) don't reset a
  // badge that may have been incremented by SSE while the user was typing.
  useEffect(() => {
    Auth.updateUnreadMessages(0);
  }, []); // ← runs once when user opens this page

  // ─── Fetch conversation (REST) ────────────────────────────────────────────────
  const fetchConversation = useCallback(
    async (keepLoader = false) => {
      if (!authClient) {
        if (keepLoader) setLoading(false);
        return;
      }
      if (keepLoader) setLoading(true);
      setError('');
      try {
        const response = await messagesApi.getMyConversation(authClient);
        const normalized = normalizeConversation(response.data);
        setConversation(normalized);
        // Don't call updateUnreadMessages here — the mount effect already
        // reset it to 0, and we don't want silent refreshes to interfere.
      } catch (fetchError) {
        if (fetchError?.response?.status === 404) {
          setConversation(null);
        } else {
          handleLogError(fetchError);
          setError('تعذر تحميل المحادثة حاليا.');
        }
      } finally {
        if (keepLoader) setLoading(false);
      }
    },
    [authClient]
  );

  // Initial load
  useEffect(() => {
    fetchConversation(true);
  }, [fetchConversation]);

  // ─── SSE — connect ONCE on mount ──────────────────────────────────────────────
  // Even though the user is ON this page, we still handle incoming SSE messages
  // so new admin replies appear live without a refresh.
  // We do NOT increment the Dashboard badge here because the user is already
  // reading the conversation — the badge should stay at 0 while this page is open.
  useEffect(() => {
    const token = authTokenRef.current;
    if (!token) return;

    const eventSource = messagesApi.createUserSse(token);

    const onAdminReply = (event) => {
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

      const isAdminReply =
        payloadType === 'ADMIN_REPLY' ||
        eventType === 'ADMIN_REPLY' ||
        (payloadType === '' && incoming.senderRole === 'ADMIN');

      if (!isAdminReply) return;

      // Append the new message directly into the conversation — user sees it live.
      setConversation((current) => {
        const base = current || {
          id: null,
          userId: null,
          username: '',
          unreadAdminCount: 0,
          unreadUserCount: 0,
          messages: [],
          lastMessage: null,
          lastMessageAt: null,
        };
        const mergedMessages = normalizeMessages([...(base.messages || []), incoming]);
        return {
          ...base,
          messages: mergedMessages,
          lastMessage: mergedMessages[mergedMessages.length - 1] || null,
          lastMessageAt: incoming.createdAt || base.lastMessageAt,
          // Keep local unreadUserCount in sync for the chip in the header
          unreadUserCount: (base.unreadUserCount || 0) + 1,
        };
      });

      // Badge stays 0 — user is actively reading this page.
      // Auth.updateUnreadMessages is intentionally NOT called here.
    };

    eventSource.addEventListener('admin-reply', onAdminReply);
    eventSource.addEventListener('admin_reply', onAdminReply);
    eventSource.addEventListener('ADMIN_REPLY', onAdminReply);
    eventSource.onmessage = onAdminReply;

    return () => {
      eventSource.removeEventListener('admin-reply', onAdminReply);
      eventSource.removeEventListener('admin_reply', onAdminReply);
      eventSource.removeEventListener('ADMIN_REPLY', onAdminReply);
      eventSource.onmessage = null;
      eventSource.close();
    };
  }, []); // ← empty: one connection for the lifetime of this page

  // ─── Send message ─────────────────────────────────────────────────────────────
  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();

    if (!content) { setError('يرجى كتابة رسالة قبل الإرسال.'); return; }
    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`يجب ألا تتجاوز الرسالة ${MAX_MESSAGE_LENGTH} حرفا.`);
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      await messagesApi.sendMessage(authClient, { content });
      setDraft('');
      setSuccess('تم إرسال الرسالة إلى الإدارة.');
      await fetchConversation(false);
    } catch (submitError) {
      handleLogError(submitError);
      setError('فشل إرسال الرسالة. يرجى المحاولة بعد قليل.');
    } finally {
      setSending(false);
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
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f766e 0%, #155e75 100%)',
          color: 'white',
          boxShadow: '0 18px 40px rgba(21, 94, 117, 0.25)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <ForumRoundedIcon />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  مراسلة الإدارة
                </Typography>
              </Stack>
              <Typography sx={{ opacity: 0.9, maxWidth: 680 }}>
                استخدم هذه المساحة لطرح سؤال أو طلب مساعدة أو متابعة رد الإدارة.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
              <Chip
                icon={<MarkChatReadRoundedIcon />}
                label={`${conversation?.unreadUserCount || 0} غير مقروءة`}
                sx={{ backgroundColor: 'rgba(255,255,255,0.16)', color: 'white' }}
              />
              <Chip
                icon={<SupportAgentRoundedIcon />}
                label="دعم الإدارة"
                sx={{ backgroundColor: 'rgba(255,255,255,0.16)', color: 'white' }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2.5}>
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>المحادثة</Typography>
            <Typography variant="body2" color="text.secondary">
              تظهر ردود الإدارة هنا ويتم تعليمها كمقروءة عند فتح الصفحة.
            </Typography>
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
            {messages.length === 0 ? (
              <Box
                sx={{
                  minHeight: 300,
                  borderRadius: 3,
                  border: '1px dashed #94a3b8',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Box>
                  <ForumRoundedIcon sx={{ fontSize: 48, color: '#0f766e', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>لا توجد محادثة حاليا</Typography>
                  <Typography color="text.secondary">أرسل رسالتك الأولى لبدء المحادثة مع الإدارة.</Typography>
                </Box>
              </Box>
            ) : (
              <Stack spacing={2}>
                {messages.map((message) => {
                  const isAdminMessage = message.senderRole === 'ADMIN';
                  return (
                    <Box
                      key={message.id}
                      sx={{ display: 'flex', justifyContent: isAdminMessage ? 'flex-start' : 'flex-end' }}
                    >
                      <Box
                        sx={{
                          maxWidth: { xs: '100%', md: '72%' },
                          background: isAdminMessage
                            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                            : 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                          color: isAdminMessage ? '#0f172a' : 'white',
                          borderRadius: 3,
                          px: 2,
                          py: 1.75,
                          boxShadow: isAdminMessage
                            ? '0 8px 24px rgba(15, 23, 42, 0.08)'
                            : '0 14px 28px rgba(15, 118, 110, 0.22)',
                          border: isAdminMessage ? '1px solid #e2e8f0' : 'none',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {isAdminMessage
                            ? <SupportAgentRoundedIcon fontSize="small" />
                            : <PersonRoundedIcon fontSize="small" />}
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {isAdminMessage ? 'الإدارة' : 'أنت'}
                          </Typography>
                          {message.isRead && isAdminMessage && (
                            <Chip size="small" label="مقروء" sx={{ height: 22 }} />
                          )}
                        </Stack>
                        <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {message.content}
                        </Typography>
                        <Divider sx={{ my: 1.25, opacity: isAdminMessage ? 1 : 0.2 }} />
                        <Typography
                          variant="caption"
                          sx={{ color: isAdminMessage ? 'text.secondary' : 'rgba(255,255,255,0.78)' }}
                        >
                          {formatDateTime(message.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Card>

        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>رسالة جديدة</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                multiline
                minRows={5}
                maxRows={10}
                value={draft}
                onChange={(event) => setDraft(limitDraft(event.target.value))}
                placeholder="اكتب رسالتك هنا..."
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
                  كن واضحا ومختصرا لتسهيل الرد السريع من الإدارة.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
                  <IconButton
                    onClick={openEmojiMenu}
                    sx={{ border: '1px solid #cbd5e1', borderRadius: 2 }}
                    aria-label="إضافة رمز تعبيريا"
                  >
                    <EmojiEmotionsRoundedIcon />
                  </IconButton>
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendRoundedIcon />}
                    disabled={sending}
                    sx={{
                      alignSelf: { xs: 'stretch', sm: 'auto' },
                      background: 'linear-gradient(135deg, #0f766e 0%, #155e75 100%)',
                      px: 3,
                      py: 1.25,
                    }}
                  >
                    {sending ? 'جاري الإرسال...' : 'إرسال'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Menu
        anchorEl={emojiAnchorEl}
        open={Boolean(emojiAnchorEl)}
        onClose={closeEmojiMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem disableRipple sx={{ pointerEvents: 'none', opacity: 0.8 }}>
          اختر رمزا تعبيريا
        </MenuItem>
        <Box sx={{ px: 1.5, pb: 1.5, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.5 }}>
          {emojiOptions.map((emoji) => (
            <Button
              key={emoji}
              onClick={() => addEmojiToDraft(emoji)}
              sx={{ minWidth: 0, fontSize: 22, p: 0.5 }}
            >
              {emoji}
            </Button>
          ))}
        </Box>
      </Menu>
    </Box>
  );
}