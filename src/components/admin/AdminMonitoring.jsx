import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Alert, Divider, Grid,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import BarChartIcon from '@mui/icons-material/BarChart'
import RefreshIcon from '@mui/icons-material/Refresh'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { monitoringApi } from '../../apis/monitoringApi'
import { handleLogError } from '../../misc/Helpers'

const EVENT_META = {
  FACE_ABSENT:    { label: 'وجه غائب',    color: '#ef4444' },
  LOOKING_AWAY:   { label: 'نظرة بعيدة',  color: '#eab308' },
  PHONE_DETECTED: { label: 'هاتف مكتشف',  color: '#8b5cf6' },
}

function formatDuration(secs) {
  if (secs == null) return '—'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ar', { dateStyle: 'short', timeStyle: 'short' })
}

export function AdminMonitoring() {
  const { getUser } = useAuth()
  const user = getUser()

  const [sessions, setSessions]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [selected, setSelected]       = useState(null)   // session for stats dialog
  const [stats, setStats]             = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await monitoringApi.adminGetAllSessions(user)
      setSessions(res.data || [])
    } catch (err) {
      setError('فشل تحميل جلسات المراقبة.')
      handleLogError(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  async function openStats(session) {
    setSelected(session)
    setStats(null)
    setStatsLoading(true)
    try {
      const res = await monitoringApi.adminGetSessionStats(user, session.id)
      setStats(res.data)
    } catch (err) {
      handleLogError(err)
    } finally {
      setStatsLoading(false)
    }
  }

  function closeStats() {
    setSelected(null)
    setStats(null)
  }

  // Normalise events array into [{name, count, color}] for recharts
  function buildChartData(statsData) {
    if (!statsData) return []
    const events = statsData.events || statsData.eventCounts || {}
    if (Array.isArray(events)) {
      return events.map(e => ({
        name: EVENT_META[e.type]?.label || e.type,
        count: e.count,
        color: EVENT_META[e.type]?.color || '#64748b',
      }))
    }
    return Object.entries(events).map(([type, count]) => ({
      name: EVENT_META[type]?.label || type,
      count,
      color: EVENT_META[type]?.color || '#64748b',
    }))
  }

  const distractionColor = (count) => {
    if (count == null) return 'default'
    if (count === 0) return 'success'
    if (count < 5) return 'warning'
    return 'error'
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, direction: 'rtl', maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          جلسات مراقبة التركيز
        </Typography>
        <Button
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={fetchSessions}
          disabled={loading}
          size="small"
        >
          تحديث
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : sessions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>لا توجد جلسات بعد</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>المستخدم</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>تاريخ البدء</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>تاريخ الانتهاء</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>المدة</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>التشتيتات</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>تفاصيل</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s, i) => {
                  const distractions = s.distractionCount ?? s.totalDistractions ?? null
                  return (
                    <TableRow key={s.id || i} hover>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>{s.username || s.userEmail || s.userId}</Typography>
                      </TableCell>
                      <TableCell align="right">{formatDateTime(s.startTime)}</TableCell>
                      <TableCell align="right">{formatDateTime(s.endTime)}</TableCell>
                      <TableCell align="right">{formatDuration(s.durationSeconds)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={distractions ?? '—'}
                          size="small"
                          color={distractionColor(distractions)}
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => openStats(s)}>
                          <BarChartIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Stats dialog */}
      <Dialog open={!!selected} onClose={closeStats} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
          <Typography fontWeight={700}>
            تفاصيل الجلسة — {selected?.username || selected?.userEmail || selected?.userId}
          </Typography>
          <IconButton onClick={closeStats}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ direction: 'rtl' }}>
          {statsLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : stats ? (
            <>
              {/* Summary cards */}
              <Grid container spacing={2} mb={3}>
                {[
                  { label: 'بدء الجلسة', value: formatDateTime(stats.startTime) },
                  { label: 'نهاية الجلسة', value: formatDateTime(stats.endTime) },
                  { label: 'المدة', value: formatDuration(stats.durationSeconds) },
                  {
                    label: 'إجمالي التشتيتات',
                    value: stats.totalDistractions ?? stats.distractionCount ?? '—',
                  },
                ].map(({ label, value }) => (
                  <Grid item xs={6} key={label}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="body1" fontWeight={700}>{value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Bar chart */}
              {buildChartData(stats).length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>توزيع أنواع التشتت</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={buildChartData(stats)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="عدد مرات التشتت" radius={[4, 4, 0, 0]}>
                        {buildChartData(stats).map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Event chips breakdown */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {buildChartData(stats).map(({ name, count, color }) => (
                      <Chip
                        key={name}
                        label={`${name}: ${count}`}
                        size="small"
                        sx={{
                          bgcolor: color + '20',
                          color,
                          fontWeight: 700,
                          border: `1px solid ${color}40`,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={3}>
              لا توجد إحصائيات متاحة لهذه الجلسة
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
