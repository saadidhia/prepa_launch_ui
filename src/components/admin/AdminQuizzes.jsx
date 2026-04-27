import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { quizzesApi } from '../../apis/quizzesApi'
import { handleLogError } from '../../misc/Helpers'

const FIELDS = ['MATH', 'SCIENCE', 'LETTER', 'TECH', 'ECO', 'INFO', 'SPORT']
const FIELD_LABELS = {
  MATH: 'رياضيات', SCIENCE: 'علوم', LETTER: 'آداب',
  TECH: 'تقنية', ECO: 'اقتصاد', INFO: 'إعلامية', SPORT: 'رياضة',
}

const SUBJECTS = [
  'MATH', 'PHYSIQUE', 'SCIENCE', 'TECHNIQUE', 'INFORMATIQUE', 'ARABE',
  'PHILOSOPHIE', 'FRANCAIS', 'ANGLAIS', 'OPTION', 'HISTORY', 'BASES_DE_DONNEES',
  'ALGORITHMES', 'SPORT', 'HISTOIRE_GEOGRAPHIE', 'PENSEE_ISLAMIQUE',
  'ECONOMIE', 'GESTION', 'STI',
]

const SUBJECT_LABELS = {
  MATH: 'رياضيات', PHYSIQUE: 'فيزياء', SCIENCE: 'علوم', TECHNIQUE: 'تقنية',
  INFORMATIQUE: 'إعلامية', ARABE: 'عربي', PHILOSOPHIE: 'فلسفة',
  FRANCAIS: 'فرنسية', ANGLAIS: 'إنجليزية', OPTION: 'اختيار',
  HISTORY: 'تاريخ', BASES_DE_DONNEES: 'قواعد البيانات', ALGORITHMES: 'خوارزميات',
  SPORT: 'رياضة', HISTOIRE_GEOGRAPHIE: 'التاريخ والجغرافيا',
  PENSEE_ISLAMIQUE: 'فكر إسلامي', ECONOMIE: 'اقتصاد', GESTION: 'تصرف', STI: 'STI',
}

const emptyAnswer = () => ({ text: '', correct: false })
const emptyQuestion = () => ({ text: '', answers: [emptyAnswer(), emptyAnswer(), emptyAnswer(), emptyAnswer()] })
const emptyForm = () => ({
  fields: ['MATH'], subject: 'MATH', level: 'BAC', courseName: '',
  questions: [emptyQuestion()],
})

export function AdminQuizzes() {
  const Auth = useAuth()
  const user = Auth.getUser()

  // Views: 'list' | 'form' | 'attempts'
  const [view, setView] = useState('list')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Filters
  const [filterField, setFilterField]     = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterLevel, setFilterLevel]     = useState('')

  // Attempts
  const [attemptsQuiz, setAttemptsQuiz] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [attemptsLoading, setAttemptsLoading] = useState(false)

  // ── Fetch ────────────────────────────────────────────────────
  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await quizzesApi.adminGetQuizzes(user)
      setQuizzes(res.data || [])
    } catch (err) {
      handleLogError(err)
      setError('تعذّر تحميل الاختبارات.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === 'list') fetchQuizzes()
  }, [view, fetchQuizzes])

  // ── Save (create or update) ──────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (editingId) {
        await quizzesApi.adminUpdateQuiz(user, editingId, form)
        setSuccess('تم تحديث الاختبار بنجاح.')
      } else {
        await quizzesApi.adminCreateQuiz(user, form)
        setSuccess('تم إنشاء الاختبار بنجاح.')
      }
      setView('list')
      setEditingId(null)
      setForm(emptyForm())
    } catch (err) {
      handleLogError(err)
      setError('حدث خطأ أثناء الحفظ.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (quizId, courseName) => {
    if (!window.confirm(`هل تريد حذف الاختبار "${courseName || ''}"؟`)) return
    try {
      await quizzesApi.adminDeleteQuiz(user, quizId)
      setQuizzes(prev => prev.filter(q => q.id !== quizId))
    } catch (err) {
      handleLogError(err)
      alert('حدث خطأ أثناء الحذف.')
    }
  }

  // ── Edit ─────────────────────────────────────────────────────
  const openEdit = (quiz) => {
    setEditingId(quiz.id)
    setForm({
      fields: Array.isArray(quiz.fields) ? quiz.fields : (quiz.field ? [quiz.field] : ['MATH']),
      subject: quiz.subject,
      level: quiz.level,
      courseName: quiz.courseName || '',
      questions: quiz.questions?.map(q => ({
        text: q.text,
        answers: q.answers?.map(a => ({ text: a.text, correct: a.correct })) || [],
      })) || [emptyQuestion()],
    })
    setError('')
    setSuccess('')
    setView('form')
  }

  // ── Attempts ─────────────────────────────────────────────────
  const openAttempts = async (quiz) => {
    setAttemptsQuiz(quiz)
    setAttemptsLoading(true)
    setAttempts([])
    setView('attempts')
    try {
      const res = await quizzesApi.adminGetAttempts(user, quiz.id)
      setAttempts(res.status === 204 ? [] : res.data || [])
    } catch (err) {
      handleLogError(err)
      if (err.response?.status === 204) setAttempts([])
    } finally {
      setAttemptsLoading(false)
    }
  }

  // ── Form helpers ─────────────────────────────────────────────
  const setField = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const toggleField = (fieldValue) =>
    setForm(f => {
      const already = f.fields.includes(fieldValue)
      if (already && f.fields.length === 1) return f // keep at least one selected
      return {
        ...f,
        fields: already ? f.fields.filter(v => v !== fieldValue) : [...f.fields, fieldValue],
      }
    })

  const setQuestionText = (qi, val) =>
    setForm(f => {
      const qs = [...f.questions]
      qs[qi] = { ...qs[qi], text: val }
      return { ...f, questions: qs }
    })

  const setAnswerField = (qi, ai, field, val) =>
    setForm(f => {
      const qs = [...f.questions]
      const ans = [...qs[qi].answers]
      ans[ai] = { ...ans[ai], [field]: val }
      qs[qi] = { ...qs[qi], answers: ans }
      return { ...f, questions: qs }
    })

  const addQuestion = () =>
    setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion()] }))

  const removeQuestion = (qi) =>
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))

  const addAnswer = (qi) =>
    setForm(f => {
      const qs = [...f.questions]
      qs[qi] = { ...qs[qi], answers: [...qs[qi].answers, emptyAnswer()] }
      return { ...f, questions: qs }
    })

  const removeAnswer = (qi, ai) =>
    setForm(f => {
      const qs = [...f.questions]
      qs[qi] = { ...qs[qi], answers: qs[qi].answers.filter((_, i) => i !== ai) }
      return { ...f, questions: qs }
    })

  // ════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'list') {
    const filtered = quizzes.filter(q =>
      (!filterField   || (Array.isArray(q.fields) ? q.fields.includes(filterField) : q.field === filterField)) &&
      (!filterSubject || q.subject === filterSubject) &&
      (!filterLevel   || q.level   === filterLevel)
    )
    return (
      <div style={s.page} dir="rtl">
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>إدارة الاختبارات القصيرة</h1>
            <p style={s.headerSub}>{quizzes.length} اختبار</p>
          </div>
          <button style={s.createBtn} onClick={() => { setForm(emptyForm()); setEditingId(null); setError(''); setSuccess(''); setView('form') }}>
            + إنشاء اختبار
          </button>
        </div>

        {success && <p style={s.successMsg}>✅ {success}</p>}
        {error && <p style={s.errorMsg}>⚠️ {error}</p>}

        {/* Filters */}
        <div style={s.filtersRow}>
          <select style={s.filterSelect} value={filterField} onChange={e => setFilterField(e.target.value)}>
            <option value="">كل الفئات</option>
            {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select style={s.filterSelect} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="">كل المواد</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={s.filterSelect} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="">كل المستويات</option>
            <option value="BAC">BAC</option>
            <option value="TROISIEME">TROISIEME</option>
          </select>
          {(filterField || filterSubject || filterLevel) && (
            <button style={s.resetBtn} onClick={() => { setFilterField(''); setFilterSubject(''); setFilterLevel('') }}>
              ✕ إعادة تعيين
            </button>
          )}
        </div>

        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : quizzes.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📝</div>
            <p>لا توجد اختبارات. أنشئ أول اختبار.</p>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>الفئة</th>
                  <th style={s.th}>المادة</th>
                  <th style={s.th}>المستوى</th>
                  <th style={s.th}>الدرس</th>
                  <th style={s.th}>الأسئلة</th>
                  <th style={s.th}>تاريخ الإنشاء</th>
                  <th style={s.th}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>لا توجد نتائج</td></tr>
                ) : filtered.map((quiz, i) => (
                  <tr key={quiz.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(Array.isArray(quiz.fields) ? quiz.fields : quiz.field ? [quiz.field] : []).map(f => (
                          <span key={f} style={s.subjectChip}>{f}</span>
                        ))}
                        {!quiz.fields?.length && !quiz.field && '—'}
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={s.subjectChip}>{quiz.subject}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.levelChip}>{quiz.level}</span>
                    </td>
                    <td style={s.td}>{quiz.courseName || '—'}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{quiz.questions?.length || 0}</td>
                    <td style={s.td}>
                      {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString('ar-TN') : '—'}
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.editBtn} onClick={() => openEdit(quiz)}>تعديل</button>
                        <button style={s.attemptsBtn} onClick={() => openAttempts(quiz)}>المحاولات</button>
                        <button style={s.deleteBtn} onClick={() => handleDelete(quiz.id, quiz.courseName)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // FORM VIEW (Create / Edit)
  // ════════════════════════════════════════════════════════════
  if (view === 'form') {
    return (
      <div style={s.page} dir="rtl">
        <div style={s.header}>
          <h1 style={s.headerTitle}>{editingId ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}</h1>
          <button style={s.backBtn} onClick={() => { setView('list'); setEditingId(null) }}>← رجوع</button>
        </div>

        {error && <p style={s.errorMsg}>⚠️ {error}</p>}

        <form onSubmit={handleSave} style={s.form}>
          {/* Meta fields */}
          <div style={s.metaGrid}>
            <div style={{ ...s.field, gridColumn: '1 / -1' }}>
              <label style={s.label}>الفئة * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(يمكن اختيار أكثر من فئة)</span></label>
              <div style={s.fieldsCheckboxGroup}>
                {FIELDS.map(f => {
                  const checked = form.fields.includes(f)
                  return (
                    <label key={f} style={{ ...s.fieldCheckboxLabel, ...(checked ? s.fieldCheckboxLabelActive : {}) }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleField(f)}
                        style={{ accentColor: '#667eea' }}
                      />
                      {f}
                    </label>
                  )
                })}
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>الدرس</label>
              <input
                style={s.input}
                value={form.courseName}
                onChange={e => setField('courseName', e.target.value)}
                placeholder="مثال: الاشتقاق"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>المادة *</label>
              <select style={s.select} value={form.subject} onChange={e => setField('subject', e.target.value)}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>المستوى *</label>
              <select style={s.select} value={form.level} onChange={e => setField('level', e.target.value)}>
                <option value="BAC">BAC</option>
                <option value="TROISIEME">TROISIEME</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div style={s.questionsSection}>
            <div style={s.questionsSectionHeader}>
              <h2 style={s.sectionTitle}>الأسئلة ({form.questions.length})</h2>
              <button type="button" style={s.addQBtn} onClick={addQuestion}>+ سؤال جديد</button>
            </div>

            {form.questions.map((q, qi) => (
              <div key={qi} style={s.questionBlock}>
                <div style={s.questionBlockHeader}>
                  <span style={s.questionNum}>السؤال {qi + 1}</span>
                  {form.questions.length > 1 && (
                    <button
                      type="button" style={s.removeQBtn}
                      onClick={() => removeQuestion(qi)}
                    >
                      حذف السؤال
                    </button>
                  )}
                </div>

                <textarea
                  style={s.textarea} required
                  rows={2}
                  value={q.text}
                  onChange={e => setQuestionText(qi, e.target.value)}
                  placeholder="نص السؤال..."
                />

                <div style={s.answersSection}>
                  <div style={s.answersHeader}>
                    <span style={s.answersTitle}>الإجابات</span>
                    <button type="button" style={s.addABtn} onClick={() => addAnswer(qi)}>+ إجابة</button>
                  </div>

                  {q.answers.map((ans, ai) => (
                    <div key={ai} style={s.answerRow}>
                      <input
                        type="checkbox"
                        checked={ans.correct}
                        onChange={e => setAnswerField(qi, ai, 'correct', e.target.checked)}
                        title="صحيحة"
                        style={{ accentColor: '#22c55e', width: 16, height: 16, flexShrink: 0 }}
                      />
                      <input
                        style={{ ...s.input, flex: 1, margin: 0 }} required
                        value={ans.text}
                        onChange={e => setAnswerField(qi, ai, 'text', e.target.value)}
                        placeholder={`الإجابة ${ai + 1}`}
                      />
                      <span style={ans.correct ? s.correctLabel : s.wrongLabel}>
                        {ans.correct ? 'صحيحة' : 'خاطئة'}
                      </span>
                      {q.answers.length > 2 && (
                        <button
                          type="button" style={s.removeABtn}
                          onClick={() => removeAnswer(qi, ai)}
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving} style={s.saveBtn}>
            {saving ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديلات' : 'إنشاء الاختبار'}
          </button>
        </form>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // ATTEMPTS VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'attempts') {
    return (
      <div style={s.page} dir="rtl">
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>محاولات الاختبار</h1>
            <p style={s.headerSub}>
              {attemptsQuiz?.courseName || (Array.isArray(attemptsQuiz?.fields)
                ? attemptsQuiz.fields.map(f => FIELD_LABELS[f] || f).join('، ')
                : FIELD_LABELS[attemptsQuiz?.field] || '')}
            </p>
          </div>
          <button style={s.backBtn} onClick={() => setView('list')}>← رجوع</button>
        </div>

        {attemptsLoading ? (
          <div style={s.center}><Spinner /></div>
        ) : attempts.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📊</div>
            <p>لا توجد محاولات لهذا الاختبار بعد.</p>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <div style={s.attemptsStats}>
              <StatCard label="عدد المحاولات" value={attempts.length} />
              <StatCard
                label="متوسط النتيجة"
                value={`${(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length).toFixed(1)}%`}
              />
              <StatCard
                label="أعلى نتيجة"
                value={`${Math.max(...attempts.map(a => a.percentage || 0)).toFixed(0)}%`}
              />
            </div>

            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>التاريخ</th>
                  <th style={s.th}>النتيجة</th>
                  <th style={s.th}>النسبة</th>
                  <th style={s.th}>العدّاد</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt, i) => (
                  <tr key={attempt.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={s.td}>
                      {attempt.createdAt
                        ? new Date(attempt.createdAt).toLocaleDateString('ar-TN', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })
                        : '—'}
                    </td>
                    <td style={s.td}>
                      {attempt.score}/{attempt.totalQuestions}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.pctBadge,
                        background: (attempt.percentage >= 80) ? '#dcfce7' : (attempt.percentage >= 50) ? '#fef9c3' : '#fee2e2',
                        color: (attempt.percentage >= 80) ? '#16a34a' : (attempt.percentage >= 50) ? '#d97706' : '#dc2626',
                      }}>
                        {(attempt.percentage || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td style={s.td}>
                      {attempt.timerEnabled ? '✓ نعم' : '✗ لا'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return null
}

function StatCard({ label, value }) {
  return (
    <div style={s.statCard}>
      <span style={s.statCardValue}>{value}</span>
      <span style={s.statCardLabel}>{label}</span>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid #e5e7eb', borderTopColor: '#667eea',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

const s = {
  page: {
    minHeight: '100vh', background: '#f4f6f9',
    padding: '1.5rem',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
  },
  center: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12,
  },
  headerTitle: {
    fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', margin: 0,
  },
  headerSub: {
    color: '#6b7280', margin: '4px 0 0', fontSize: '0.95rem',
  },
  createBtn: {
    padding: '0.65rem 1.4rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: 600,
  },
  backBtn: {
    background: 'none', border: 'none', color: '#667eea', cursor: 'pointer',
    fontSize: '0.95rem', padding: 0, fontWeight: 600,
  },
  filtersRow: {
    display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center',
  },
  filterSelect: {
    padding: '0.5rem 0.8rem', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.9rem', color: '#1f2937', background: '#fff', cursor: 'pointer',
  },
  resetBtn: {
    padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600,
  },
  successMsg: {
    color: '#16a34a', background: '#f0fdf4', padding: '0.75rem 1rem',
    borderRadius: '8px', textAlign: 'right', margin: '0 0 1rem',
  },
  errorMsg: {
    color: '#dc2626', background: '#fef2f2', padding: '0.75rem 1rem',
    borderRadius: '8px', textAlign: 'right', margin: '0 0 1rem',
  },
  empty: {
    textAlign: 'center', padding: '4rem 0', color: '#6b7280',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: 12 },

  // Table
  tableWrap: {
    background: '#fff', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'auto',
  },
  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem',
  },
  thead: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  th: {
    padding: '0.85rem 1rem', color: '#fff', fontWeight: 600,
    textAlign: 'right', whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.8rem 1rem', color: '#374151', borderBottom: '1px solid #f3f4f6',
  },
  subjectChip: {
    background: '#eef2ff', color: '#4338ca', padding: '3px 10px',
    borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
  },
  levelChip: {
    background: '#f0fdf4', color: '#16a34a', padding: '3px 10px',
    borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
  },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  editBtn: {
    padding: '4px 12px', background: '#eef2ff', color: '#4338ca',
    border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 600,
  },
  attemptsBtn: {
    padding: '4px 12px', background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 600,
  },
  deleteBtn: {
    padding: '4px 12px', background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 600,
  },

  // Form
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  metaGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem', background: '#fff', borderRadius: '12px',
    padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', fontWeight: 600, color: '#374151' },
  input: {
    padding: '0.65rem 0.9rem', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.95rem', color: '#1f2937', outline: 'none', boxSizing: 'border-box',
    width: '100%',
  },
  select: {
    padding: '0.65rem 0.9rem', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.95rem', color: '#1f2937', cursor: 'pointer', background: '#fff',
  },
  textarea: {
    padding: '0.65rem 0.9rem', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.95rem', color: '#1f2937', outline: 'none', resize: 'vertical',
    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
  },

  questionsSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  questionsSectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  sectionTitle: { fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', margin: 0 },
  addQBtn: {
    padding: '0.5rem 1.1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer',
    fontSize: '0.88rem', fontWeight: 600,
  },

  questionBlock: {
    background: '#fff', borderRadius: '12px', padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  questionBlockHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  questionNum: {
    fontWeight: 700, color: '#667eea', fontSize: '0.95rem',
  },
  removeQBtn: {
    background: 'none', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.82rem',
  },

  answersSection: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  answersHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  answersTitle: { fontSize: '0.88rem', fontWeight: 600, color: '#6b7280' },
  addABtn: {
    background: 'none', border: '1px solid #d1d5db', color: '#374151',
    borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.8rem',
  },

  answerRow: {
    display: 'flex', gap: 10, alignItems: 'center',
  },
  correctLabel: {
    fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap',
    background: '#dcfce7', padding: '2px 8px', borderRadius: '10px',
  },
  wrongLabel: {
    fontSize: '0.78rem', color: '#6b7280', whiteSpace: 'nowrap',
    background: '#f3f4f6', padding: '2px 8px', borderRadius: '10px',
  },
  removeABtn: {
    background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
    fontSize: '1rem', padding: '0 4px', flexShrink: 0,
  },

  saveBtn: {
    padding: '0.9rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
  },

  // Fields multi-select
  fieldsCheckboxGroup: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4,
  },
  fieldCheckboxLabel: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
    border: '1.5px solid #d1d5db', background: '#fff',
    fontSize: '0.88rem', fontWeight: 600, color: '#374151',
    userSelect: 'none',
  },
  fieldCheckboxLabelActive: {
    borderColor: '#667eea', background: '#eef2ff', color: '#4338ca',
  },

  // Attempts
  attemptsStats: {
    display: 'flex', gap: 16, padding: '1.25rem', flexWrap: 'wrap',
  },
  statCard: {
    flex: 1, minWidth: 140, background: '#f9fafb', borderRadius: '10px',
    padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  statCardValue: { fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e' },
  statCardLabel: { fontSize: '0.82rem', color: '#6b7280' },
  pctBadge: {
    padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700,
  },
}
