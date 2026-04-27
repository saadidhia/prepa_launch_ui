import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { quizzesApi } from '../../apis/quizzesApi'
import { handleLogError } from '../../misc/Helpers'

const SUBJECT_LABELS = {
  MATH: 'رياضيات', PHYSIQUE: 'فيزياء', SCIENCE: 'علوم', TECHNIQUE: 'تقنية',
  INFORMATIQUE: 'إعلامية', ARABE: 'عربي', PHILOSOPHIE: 'فلسفة',
  FRANCAIS: 'فرنسية', ANGLAIS: 'إنجليزية', OPTION: 'اختيار',
  HISTORY: 'تاريخ', BASES_DE_DONNEES: 'قواعد البيانات', ALGORITHMES: 'خوارزميات',
  SPORT: 'رياضة', HISTOIRE_GEOGRAPHIE: 'التاريخ والجغرافيا',
  PENSEE_ISLAMIQUE: 'فكر إسلامي', ECONOMIE: 'اقتصاد', GESTION: 'تصرف', STI: 'STI',
}

const SUBJECT_COLORS = {
  MATH: '#6366f1', PHYSIQUE: '#3b82f6', SCIENCE: '#22c55e', TECHNIQUE: '#f97316',
  INFORMATIQUE: '#8b5cf6', ARABE: '#f59e0b', PHILOSOPHIE: '#ec4899',
  FRANCAIS: '#0ea5e9', ANGLAIS: '#14b8a6', OPTION: '#a855f7',
  HISTORY: '#ef4444', BASES_DE_DONNEES: '#06b6d4', ALGORITHMES: '#84cc16',
  SPORT: '#f43f5e', HISTOIRE_GEOGRAPHIE: '#78716c', PENSEE_ISLAMIQUE: '#10b981',
  ECONOMIE: '#eab308', GESTION: '#64748b', STI: '#d946ef',
}

function scoreColor(pct) {
  if (pct >= 80) return '#16a34a'
  if (pct >= 50) return '#d97706'
  return '#dc2626'
}

export function Quizzes() {
  const Auth = useAuth()
  const user = Auth.getUser()

  // Views: 'list' | 'start' | 'taking' | 'results' | 'history'
  const [view, setView] = useState('list')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filters
  const [filterSubject, setFilterSubject] = useState('')
  const [filterCourse, setFilterCourse] = useState('')

  // Quiz taking state
  const [selectedQuiz, setSelectedQuiz] = useState(null) // full quiz with questions
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: uuid[] }
  const [selectedAnswers, setSelectedAnswers] = useState([]) // current question selections
  const [timeLeft, setTimeLeft] = useState(15)
  const [submitting, setSubmitting] = useState(false)

  // Results
  const [result, setResult] = useState(null)

  // History
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const timerRef = useRef(null)
  const handleTimeOutRef = useRef(null)

  // ── Fetch quiz list ──────────────────────────────────────────
  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filterSubject) params.subject = filterSubject
      if (filterCourse) params.courseName = filterCourse
      const res = await quizzesApi.getQuizzes(user, params)
      setQuizzes(res.status === 204 ? [] : res.data || [])
    } catch (err) {
      if (err.response?.status === 204) setQuizzes([])
      else setError('تعذّر تحميل الاختبارات.')
    } finally {
      setLoading(false)
    }
  }, [filterSubject, filterCourse])

  useEffect(() => {
    if (view === 'list') fetchQuizzes()
  }, [view, fetchQuizzes])

  // ── Open quiz ────────────────────────────────────────────────
  // hasAttempt = quiz.attemptCount > 0 from the list; forceStart skips to start screen
  const openQuiz = async (quizId, forceStart = false, hasAttempt = false) => {
    setLoading(true)
    setError('')
    try {
      const res = await quizzesApi.getQuizById(user, quizId)
      setSelectedQuiz(res.data)

      if (!forceStart && hasAttempt) {
        const lastRes = await quizzesApi.getLastAttempt(user, quizId)
        setResult(lastRes.data)
        setView('results')
      } else {
        setView('start')
      }
    } catch (err) {
      handleLogError(err)
      if (err.response?.status === 403) {
        setError('هذا الاختبار غير متاح لفئتك أو مستواك الدراسي.')
      } else {
        setError('تعذّر تحميل الاختبار.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Start quiz ───────────────────────────────────────────────
  const startQuiz = () => {
    setCurrentIndex(0)
    setAnswers({})
    setSelectedAnswers([])
    setTimeLeft(15)
    setSelectedQuiz(prev => ({
      ...prev,
      questions: [...prev.questions].sort(() => Math.random() - 0.5),
    }))
    setView('taking')
  }

  // ── Timer logic ──────────────────────────────────────────────
  const advanceOrSubmit = useCallback((currentAnswers, idx) => {
    const questions = selectedQuiz?.questions || []
    if (idx < questions.length - 1) {
      setCurrentIndex(idx + 1)
      setSelectedAnswers([])
      setTimeLeft(15)
    } else {
      doSubmit(currentAnswers)
    }
  }, [selectedQuiz])

  handleTimeOutRef.current = () => {
    const questions = selectedQuiz?.questions || []
    const question = questions[currentIndex]
    if (!question) return
    const updated = { ...answers }
    if (!(question.id in updated)) updated[question.id] = []
    setAnswers(updated)
    advanceOrSubmit(updated, currentIndex)
  }

  useEffect(() => {
    if (view !== 'taking' || !timerEnabled) return
    setTimeLeft(15)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeOutRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [view, currentIndex, timerEnabled])

  // ── Handle answer selection (toggle for multiple) ─────────────
  const selectAnswer = (answerId) => {
    setSelectedAnswers(prev =>
      prev.includes(answerId) ? prev.filter(id => id !== answerId) : [...prev, answerId]
    )
  }

  const handleNext = () => {
    clearInterval(timerRef.current)
    const questions = selectedQuiz?.questions || []
    const question = questions[currentIndex]
    const updated = { ...answers, [question.id]: selectedAnswers }
    setAnswers(updated)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswers([])
      setTimeLeft(15)
    } else {
      doSubmit(updated)
    }
  }

  // ── Submit attempt ───────────────────────────────────────────
  const doSubmit = async (finalAnswers) => {
    clearInterval(timerRef.current)
    setSubmitting(true)
    const questions = selectedQuiz?.questions || []
    const answersPayload = questions.map(q => ({
      questionId: q.id,
      selectedAnswerIds: finalAnswers[q.id] ?? [],
    }))
    try {
      const res = await quizzesApi.submitAttempt(user, selectedQuiz.id, {
        timerEnabled,
        answers: answersPayload,
      })
      const attempt = res.data
      setResult(attempt)
      setQuizzes(prev => prev.map(q =>
        q.id === attempt.quizId
          ? { ...q, attemptCount: (q.attemptCount || 0) + 1, lastScore: attempt.score, lastPercentage: attempt.percentage }
          : q
      ))
      setView('results')
    } catch (err) {
      handleLogError(err)
      if (err.response?.status === 403) {
        setError('هذا الاختبار غير متاح لفئتك أو مستواك الدراسي.')
      } else {
        setError('حدث خطأ أثناء إرسال الإجاباتك.')
      }
      setView('list')
    } finally {
      setSubmitting(false)
    }
  }

  // ── History ──────────────────────────────────────────────────
  const openHistory = async () => {
    setHistoryLoading(true)
    setHistory([])
    try {
      const res = await quizzesApi.getMyAttempts(user)
      setHistory(res.status === 204 ? [] : res.data || [])
    } catch (err) {
      handleLogError(err)
      if (err.response?.status === 204) setHistory([])
    } finally {
      setHistoryLoading(false)
    }
    setView('history')
  }

  // ── Render helpers ───────────────────────────────────────────
  const questions = selectedQuiz?.questions || []
  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  // ════════════════════════════════════════════════════════════
  // LIST VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div style={s.page} dir="rtl">
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>الاختبارات القصيرة</h1>
            <p style={s.headerSub}>اختبر معلوماتك وتابع تقدمك</p>
          </div>
          <button style={s.historyBtn} onClick={openHistory}>
            سجل محاولاتي
          </button>
        </div>

        {/* Filters */}
        <div style={s.filtersRow}>
          <select
            style={s.select}
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
          >
            <option value="">All subjects</option>
            {Object.keys(SUBJECT_LABELS).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input
            style={s.input}
            placeholder="بحث بالدرس..."
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
          />
          <button style={s.searchBtn} onClick={fetchQuizzes}>بحث</button>
        </div>

        {error && <p style={s.errorMsg}>{error}</p>}

        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : quizzes.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📝</div>
            <p>لا توجد اختبارات متاحة حالياً</p>
          </div>
        ) : (
          <div style={s.grid}>
            {quizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} onStart={() => openQuiz(quiz.id, true, quiz.attemptCount > 0)} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // START VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'start') {
    const color = SUBJECT_COLORS[selectedQuiz?.subject] || '#667eea'
    return (
      <div style={s.page} dir="rtl">
        <button style={s.backBtn} onClick={() => setView('list')}>← رجوع</button>
        <div style={{ ...s.startCard, borderTop: `4px solid ${color}` }}>
          <div style={{ ...s.subjectBadge, background: color }}>
            {SUBJECT_LABELS[selectedQuiz?.subject] || selectedQuiz?.subject}
          </div>
          <h2 style={s.startTitle}>{selectedQuiz?.title}</h2>
          {selectedQuiz?.courseName && (
            <p style={s.startCourse}>{selectedQuiz.courseName}</p>
          )}
          <div style={s.statsRow}>
            <div style={s.stat}>
              <span style={s.statNum}>{questions.length}</span>
              <span style={s.statLabel}>سؤال</span>
            </div>
            <div style={s.stat}>
              <span style={s.statNum}>{timerEnabled ? '15ث' : '∞'}</span>
              <span style={s.statLabel}>لكل سؤال</span>
            </div>
          </div>

          <div style={s.timerToggleRow}>
            <label style={s.toggleLabel}>
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={e => setTimerEnabled(e.target.checked)}
                style={{ marginLeft: '8px' }}
              />
              تفعيل العدّاد (15 ثانية لكل سؤال)
            </label>
          </div>

          <button style={{ ...s.startBtn, background: color }} onClick={startQuiz}>
            ابدأ الاختبار
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // TAKING VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'taking') {
    if (submitting) {
      return (
        <div style={{ ...s.takingPage, ...s.center }} dir="rtl">
          <Spinner />
          <p style={{ marginTop: 16, color: '#6b7280' }}>جارٍ إرسال الإجابات...</p>
        </div>
      )
    }
    const timerPct = (timeLeft / 15) * 100
    const timerColor = timeLeft > 8 ? '#22c55e' : timeLeft > 4 ? '#f59e0b' : '#ef4444'

    return (
      <div style={s.takingPage} dir="rtl">
        {/* Progress bar */}
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>

        <div style={s.takingWrap}>
          {/* Header: counter + timer */}
          <div style={s.takingHeader}>
            <div style={s.questionCounterBox}>
              <span style={s.questionCounterNum}>{currentIndex + 1}</span>
              <span style={s.questionCounterSep}>/</span>
              <span style={s.questionCounterTotal}>{questions.length}</span>
              <span style={s.questionCounterLabel}>سؤال</span>
            </div>
            {timerEnabled && (
              <div style={s.timerCircle}>
                <svg width="68" height="68" viewBox="0 0 68 68">
                  <circle cx="34" cy="34" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  <circle
                    cx="34" cy="34" r="28" fill="none"
                    stroke={timerColor} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
                  />
                  <text x="34" y="40" textAnchor="middle" fontSize="18" fontWeight="800" fill={timerColor}>
                    {timeLeft}
                  </text>
                </svg>
              </div>
            )}
          </div>

          {/* Question */}
          <div style={s.questionCard}>
            <p style={s.questionText}>{currentQuestion?.text}</p>
          </div>

          {/* Hint */}
          <p style={s.multiHint}>يمكنك اختيار أكثر من إجابة</p>

          {/* Answers */}
          <div style={s.answersGrid}>
            {currentQuestion?.answers?.map((ans, i) => {
              const isSelected = selectedAnswers.includes(ans.id)
              return (
                <button
                  key={ans.id}
                  style={{ ...s.answerBtn, ...(isSelected ? s.answerBtnSelected : {}) }}
                  onClick={() => selectAnswer(ans.id)}
                >
                  <span style={{ ...s.answerLabel, ...(isSelected ? s.answerLabelSelected : {}) }}>
                    {isSelected ? '✓' : ['أ', 'ب', 'ج', 'د'][i]}
                  </span>
                  <span style={s.answerText}>{ans.text}</span>
                </button>
              )
            })}
          </div>

          <button style={s.nextBtn} onClick={handleNext}>
            {currentIndex < questions.length - 1 ? 'السؤال التالي ←' : 'إنهاء الاختبار ✓'}
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // RESULTS VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'results' && result) {
    const pct = result.percentage || 0
    const color = scoreColor(pct)
    const subjectColor = SUBJECT_COLORS[result.quizSubject] || '#667eea'
    return (
      <div style={s.page} dir="rtl">
        <div style={s.resultCard}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ ...s.subjectBadge, background: subjectColor, display: 'inline-block' }}>
              {SUBJECT_LABELS[result.quizSubject] || result.quizSubject}
            </span>
          </div>
          <h2 style={s.resultTitle}>{result.quizCourseName}</h2>

          <div style={s.scoreCircle}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="70" cy="70" r="60" fill="none"
                stroke={color} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
              <text x="70" y="65" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color}>
                {result.score}/{result.totalQuestions}
              </text>
              <text x="70" y="87" textAnchor="middle" fontSize="13" fill="#6b7280">
                {pct.toFixed(0)}%
              </text>
            </svg>
          </div>

          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 24 }}>
            {result.timerEnabled ? 'مع العدّاد' : 'بدون عدّاد'} •{' '}
            {new Date(result.createdAt).toLocaleDateString('ar-TN')}
          </p>

          {/* Per-question breakdown */}
          <div style={s.breakdown}>
            {result.questionResults?.map((qr, i) => (
              <div
                key={qr.questionId}
                style={{
                  ...s.qrRow,
                  borderRight: `4px solid ${qr.correct ? '#22c55e' : '#ef4444'}`,
                }}
              >
                <div style={s.qrTop}>
                  <span style={s.qrNum}>{i + 1}</span>
                  <span style={{ ...s.qrStatus, color: qr.correct ? '#16a34a' : '#dc2626' }}>
                    {qr.correct ? '✓ صحيح' : '✗ خطأ'}
                  </span>
                </div>
                <p style={s.qrText}>{qr.questionText}</p>
                {(() => {
                  const selected = qr.selectedAnswerTexts?.length > 0
                    ? qr.selectedAnswerTexts.join('، ')
                    : qr.selectedAnswerText || null
                  return selected ? (
                    <p style={{ ...s.qrAnswer, color: qr.correct ? '#16a34a' : '#dc2626' }}>
                      إجابتك: {selected}
                    </p>
                  ) : (
                    <p style={{ ...s.qrAnswer, color: '#9ca3af' }}>لم تُجب (انتهى الوقت)</p>
                  )
                })()}
                {!qr.correct && qr.correctAnswerTexts?.length > 0 && (
                  <p style={{ ...s.qrAnswer, color: '#16a34a' }}>
                    الإجابة الصحيحة: {qr.correctAnswerTexts.join('، ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={s.resultActions}>
            <button style={s.retryBtn} onClick={() => openQuiz(result.quizId, true, true)}>
              أعد المحاولة
            </button>
            <button style={s.backToListBtn} onClick={() => setView('list')}>
              الاختبارات
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // HISTORY VIEW
  // ════════════════════════════════════════════════════════════
  if (view === 'history') {
    return (
      <div style={s.page} dir="rtl">
        <div style={s.header}>
          <h2 style={s.headerTitle}>سجل محاولاتي</h2>
          <button style={s.backBtn} onClick={() => setView('list')}>← رجوع</button>
        </div>

        {historyLoading ? (
          <div style={s.center}><Spinner /></div>
        ) : history.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📊</div>
            <p>لا توجد محاولات سابقة</p>
          </div>
        ) : (
          <div style={s.historyList}>
            {history.map(attempt => {
              const pct = attempt.percentage || 0
              const color = scoreColor(pct)
              return (
                <div key={attempt.id} style={s.historyCard}>
                  <div style={s.historyLeft}>
                    <p style={s.historyTitle}>{attempt.quizCourseName}</p>
                    <p style={s.historyDate}>
                      <span style={{
                        display: 'inline-block',
                        background: SUBJECT_COLORS[attempt.quizSubject] || '#667eea',
                        color: '#fff', borderRadius: 10,
                        padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700,
                        marginLeft: 6,
                      }}>
                        {SUBJECT_LABELS[attempt.quizSubject] || attempt.quizSubject}
                      </span>
                      {new Date(attempt.createdAt).toLocaleDateString('ar-TN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                      {attempt.timerEnabled && ' • مع العدّاد'}
                    </p>
                  </div>
                  <div style={{ ...s.historyScore, color }}>
                    {attempt.score}/{attempt.totalQuestions}
                    <span style={s.historyPct}>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return null
}

// ── Sub-components ───────────────────────────────────────────

function QuizCard({ quiz, onStart }) {
  const color = SUBJECT_COLORS[quiz.subject] || '#667eea'
  const attempted = quiz.attemptCount > 0
  const pct = quiz.lastPercentage || 0
  const pctColor = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
  const pctBg   = pct >= 80 ? '#dcfce7' : pct >= 50 ? '#fef9c3' : '#fee2e2'
  return (
    <div style={s.quizCard} dir="rtl">
      <div style={{ ...s.quizCardTop, background: color, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={s.quizSubject}>{SUBJECT_LABELS[quiz.subject] || quiz.subject}</span>
        {attempted ? (
          <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
            ✓ جربته
          </span>
        ) : (
          <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderRadius: 10, padding: '2px 8px', fontSize: '0.75rem' }}>
            لم تجربه
          </span>
        )}
      </div>
      <div style={s.quizCardBody}>
        <h3 style={s.quizTitle}>{quiz.courseName || quiz.title}</h3>
        <div style={s.quizMeta}>
          <span>{quiz.questionCount || 0} سؤال</span>
          <span style={s.quizLevel}>{quiz.level}</span>
        </div>
        {attempted && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>آخر نتيجة</span>
            <span style={{ background: pctBg, color: pctColor, borderRadius: 10, padding: '2px 10px', fontSize: '0.82rem', fontWeight: 700 }}>
              {quiz.lastScore}/{quiz.questionCount} — {pct.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      <button style={{ ...s.startQuizBtn, background: color }} onClick={onStart}>
        {attempted ? 'أعد المحاولة' : 'ابدأ الاختبار'}
      </button>
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

// ── Styles ───────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    background: '#f4f6f9',
    padding: '1.5rem',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
  },
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16,
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
  historyBtn: {
    padding: '0.6rem 1.2rem', background: '#1a1a2e', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
  },
  filtersRow: {
    display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
  },
  select: {
    padding: '0.6rem 0.9rem', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.95rem', color: '#1f2937', background: '#fff', cursor: 'pointer',
  },
  input: {
    padding: '0.6rem 0.9rem', border: '1.5px solid #d1d5db', borderRadius: '8px',
    fontSize: '0.95rem', color: '#1f2937', flex: 1, minWidth: 160,
    outline: 'none',
  },
  searchBtn: {
    padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
  },
  errorMsg: {
    color: '#dc2626', background: '#fef2f2', padding: '0.75rem 1rem',
    borderRadius: '8px', textAlign: 'right', margin: '0 0 1rem',
  },
  profileAlert: {
    display: 'flex', alignItems: 'center', gap: 10, direction: 'rtl',
    background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: '10px',
    padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
    color: '#92400e', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5,
  },
  empty: {
    textAlign: 'center', padding: '4rem 0', color: '#6b7280',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: 12 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  // Quiz card
  quizCard: {
    background: '#fff', borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },
  quizCardTop: {
    padding: '0.75rem 1rem',
  },
  quizSubject: {
    color: '#fff', fontWeight: 700, fontSize: '0.85rem',
  },
  quizCardBody: {
    padding: '1rem', flex: 1,
  },
  quizTitle: {
    fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px',
  },
  quizCourse: {
    fontSize: '0.85rem', color: '#6b7280', margin: '0 0 10px',
  },
  quizMeta: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '0.85rem', color: '#9ca3af',
  },
  quizLevel: {
    background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px',
    fontSize: '0.8rem', color: '#4b5563',
  },
  startQuizBtn: {
    margin: '0 1rem 1rem', padding: '0.6rem', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.9rem', fontWeight: 600,
  },
  // Start screen
  backBtn: {
    background: 'none', border: 'none', color: '#667eea', cursor: 'pointer',
    fontSize: '0.95rem', padding: '0 0 1rem', fontWeight: 600,
  },
  startCard: {
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '2rem', maxWidth: 480, margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  subjectBadge: {
    color: '#fff', padding: '4px 14px', borderRadius: '20px',
    fontSize: '0.85rem', fontWeight: 700,
  },
  startTitle: {
    fontSize: '1.4rem', fontWeight: 700, color: '#1a1a2e',
    textAlign: 'center', margin: 0,
  },
  startCourse: {
    color: '#6b7280', fontSize: '0.95rem', margin: 0, textAlign: 'center',
  },
  statsRow: {
    display: 'flex', gap: 32,
  },
  stat: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  statNum: {
    fontSize: '1.8rem', fontWeight: 800, color: '#1a1a2e',
  },
  statLabel: {
    fontSize: '0.8rem', color: '#9ca3af',
  },
  timerToggleRow: {
    background: '#f9fafb', borderRadius: '8px', padding: '0.75rem 1rem', width: '100%',
    boxSizing: 'border-box',
  },
  toggleLabel: {
    display: 'flex', alignItems: 'center', cursor: 'pointer',
    fontSize: '0.95rem', color: '#374151', flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  startBtn: {
    padding: '0.9rem 2.5rem', color: '#fff', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, width: '100%',
  },
  // Taking screen
  takingPage: {
    minHeight: '100vh', background: 'linear-gradient(160deg, #f0f4ff 0%, #f8f9fa 100%)',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
  },
  takingWrap: {
    maxWidth: 780, margin: '0 auto', padding: '1.5rem 1.25rem 3rem',
  },
  progressBar: {
    height: 8, background: '#e5e7eb', overflow: 'hidden',
    position: 'sticky', top: 0, zIndex: 10,
  },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.4s ease',
  },
  takingHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.75rem', paddingTop: '0.5rem',
  },
  questionCounterBox: {
    display: 'flex', alignItems: 'baseline', gap: 5,
  },
  questionCounterNum: {
    fontSize: '2.2rem', fontWeight: 800, color: '#667eea', lineHeight: 1,
  },
  questionCounterSep: {
    fontSize: '1.2rem', color: '#d1d5db', fontWeight: 400,
  },
  questionCounterTotal: {
    fontSize: '1.1rem', color: '#9ca3af', fontWeight: 600,
  },
  questionCounterLabel: {
    fontSize: '0.9rem', color: '#9ca3af', fontWeight: 500, marginRight: 4,
  },
  timerCircle: { flexShrink: 0 },
  questionCard: {
    background: '#fff', borderRadius: '20px', padding: '2rem 2.25rem',
    boxShadow: '0 4px 24px rgba(102,126,234,0.10)',
    borderRight: '5px solid #667eea',
    marginBottom: '1.5rem',
  },
  questionText: {
    fontSize: '1.45rem', color: '#1a1a2e', lineHeight: 1.75, margin: 0,
    fontWeight: 700, letterSpacing: '0.01em',
  },
  multiHint: {
    fontSize: '0.88rem', color: '#a0aec0', textAlign: 'center',
    margin: '0 0 1.25rem', fontWeight: 500,
  },
  answersGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '2rem',
  },
  answerBtn: {
    background: '#fff', border: '2.5px solid #e5e7eb', borderRadius: '16px',
    padding: '1.1rem 1.25rem', cursor: 'pointer', textAlign: 'right',
    display: 'flex', gap: 14, alignItems: 'center', minHeight: 72,
    transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
    fontSize: '1.05rem', color: '#1f2937', fontWeight: 500,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  answerBtnSelected: {
    borderColor: '#667eea', background: '#eef2ff',
    boxShadow: '0 4px 16px rgba(102,126,234,0.15)',
  },
  answerLabel: {
    flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
    background: '#f3f4f6', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#6b7280',
    transition: 'background 0.15s, color 0.15s',
  },
  answerLabelSelected: {
    background: '#667eea', color: '#fff',
  },
  answerText: { flex: 1, lineHeight: 1.5 },
  nextBtn: {
    width: '100%', padding: '1.1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '14px',
    cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
    boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
    letterSpacing: '0.02em',
  },
  // Results
  resultCard: {
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '2rem', maxWidth: 600, margin: '0 auto',
    overflow: 'hidden', wordBreak: 'break-word',
  },
  resultTitle: {
    fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e',
    textAlign: 'center', marginBottom: 24,
  },
  scoreCircle: {
    display: 'flex', justifyContent: 'center', marginBottom: 16,
  },
  breakdown: {
    display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24,
  },
  qrRow: {
    background: '#f9fafb', borderRadius: '8px', padding: '0.85rem 1rem',
    paddingRight: '1rem', paddingLeft: '0.5rem',
    overflow: 'hidden', wordBreak: 'break-word',
  },
  qrTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
  },
  qrNum: {
    background: '#e5e7eb', borderRadius: '50%', width: 24, height: 24,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, color: '#4b5563',
  },
  qrStatus: { fontSize: '0.85rem', fontWeight: 700 },
  qrText: { fontSize: '0.95rem', color: '#1f2937', margin: '0 0 4px', fontWeight: 500 },
  qrAnswer: { fontSize: '0.85rem', margin: 0 },
  resultActions: {
    display: 'flex', gap: 12,
  },
  retryBtn: {
    flex: 1, padding: '0.8rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
  },
  backToListBtn: {
    flex: 1, padding: '0.8rem',
    background: '#f3f4f6', color: '#374151',
    border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
  },
  // History
  historyList: {
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  historyCard: {
    background: '#fff', borderRadius: '10px', padding: '1rem 1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  historyLeft: { flex: 1 },
  historyTitle: {
    fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px',
  },
  historyDate: { fontSize: '0.82rem', color: '#9ca3af', margin: 0 },
  historyScore: {
    fontSize: '1.3rem', fontWeight: 800, display: 'flex',
    flexDirection: 'column', alignItems: 'flex-end',
  },
  historyPct: { fontSize: '0.8rem', fontWeight: 600 },
}
