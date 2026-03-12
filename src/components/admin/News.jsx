import { useState, useRef, useEffect } from "react";
import { adminApi } from '../../apis/adminApi';
import { handleLogError } from '../../misc/Helpers';
import { useAuth } from '../context/AuthContext';
import { newsApi } from '../../apis/newsApi';

const API_BASE = process.env.REACT_APP_API || '';

function getImageUrl(item) {
  // Try common field names the backend may return
  const raw = item.image || item.imageUrl || item.imagePath || item.imageData;
  if (!raw) return null;
  // If it's already a full URL, use as-is
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  // If it's a data URI (base64)
  if (raw.startsWith('data:')) return raw;
  // Otherwise, treat as a relative path and prepend API base
  return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function NewsCard({ item, onDelete }) {
  const [showImage, setShowImage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const imageSrc = getImageUrl(item);

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  };

  return (
    <div style={styles.newsCard}>
      <div style={styles.newsHeader}>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={styles.deleteBtn}
          title="حذف الخبر"
        >
          {deleting ? '...' : '🗑️'}
        </button>
        <h3 style={styles.newsTitle}>{item.title}</h3>
        {item.createdAt && (
          <span style={styles.newsDate}>
            {new Date(item.createdAt).toLocaleDateString('ar-TN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        )}
      </div>
      <p style={styles.newsDesc}>{item.description}</p>
      {imageSrc && (
        <div style={styles.imageSection}>
          <button
            type="button"
            onClick={() => setShowImage((v) => !v)}
            style={styles.toggleImageBtn}
          >
            {showImage ? '🔽 إخفاء الصورة' : '🖼️ عرض الصورة'}
          </button>
          {showImage && (
            <img
              src={imageSrc}
              alt={item.title}
              style={styles.newsImage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function News() {
  const Auth = useAuth();
  const admin = Auth.getUser();

  // Form state
  const [news, setNews] = useState({ title: '', description: '', image: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  // News list state
  const [newsList, setNewsList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const fetchNews = async () => {
    setListLoading(true);
    setListError('');
    try {
      const res = await newsApi.getNews(admin);
      setNewsList(res.data || []);
    } catch (err) {
      handleLogError(err);
      setListError('تعذّر تحميل الأخبار.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDeleteNews = async (id) => {
    try {
      await adminApi.deleteNews(admin, id);
      setNewsList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      handleLogError(err);
      alert('حدث خطأ أثناء حذف الخبر.');
    }
  };

  const handleChange = (e) => {
    setNews({ ...news, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNews({ ...news, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await adminApi.createNews(admin, news);
      setSuccess(true);
      setNews({ title: '', description: '', image: null });
      setPreview(null);
      fetchNews();
    } catch (err) {
      handleLogError(err);
      setError('حدث خطأ أثناء نشر الخبر. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ── Create Form ── */}
      <div style={styles.card}>
        <h1 style={styles.title}>إنشاء خبر جديد</h1>
        <p style={styles.subtitle}>أضف عنواناً ووصفاً وصورة للخبر</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>العنوان</label>
            <input
              name="title"
              value={news.title}
              onChange={handleChange}
              required
              placeholder="أدخل عنوان الخبر..."
              style={styles.input}
              dir="rtl"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>الوصف</label>
            <textarea
              name="description"
              value={news.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="أدخل وصف الخبر..."
              style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
              dir="rtl"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>الصورة</label>
            <div
              style={styles.dropZone}
              onClick={() => fileRef.current.click()}
            >
              {preview ? (
                <img src={preview} alt="معاينة" style={styles.preview} />
              ) : (
                <div style={styles.dropText}>
                  <span style={styles.uploadIcon}>📷</span>
                  <span>انقر لإضافة صورة</span>
                  <span style={styles.dropHint}>PNG، JPG، WEBP مدعومة</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: 'none' }}
              />
            </div>
            {preview && (
              <button
                type="button"
                onClick={() => { setPreview(null); setNews({ ...news, image: null }); }}
                style={styles.removeBtn}
              >
                إزالة الصورة ✕
              </button>
            )}
          </div>

          {success && <p style={styles.successMsg}>✅ تم نشر الخبر بنجاح!</p>}
          {error && <p style={styles.errorMsg}>⚠️ {error}</p>}

          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? 'جاري النشر...' : 'نشر الخبر'}
          </button>
        </form>
      </div>

      {/* ── News List ── */}
      <div style={styles.listSection}>
        <h2 style={styles.listTitle}>📰 جميع الأخبار</h2>

        {listLoading && (
          <div style={styles.spinner}>
            <div style={styles.spinnerDot} />
            <span>جاري التحميل...</span>
          </div>
        )}

        {listError && <p style={styles.errorMsg}>⚠️ {listError}</p>}

        {!listLoading && !listError && newsList.length === 0 && (
          <p style={styles.emptyMsg}>لا توجد أخبار حالياً.</p>
        )}

        <div style={styles.newsGrid}>
          {newsList.map((item) => (
            <NewsCard key={item.id} item={item} onDelete={handleDeleteNews} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  /* ── Layout ── */
  page: {
    minHeight: '100vh',
    background: '#f4f6f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 1rem',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    gap: '2.5rem',
  },

  /* ── Create Card ── */
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '640px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#1a1a2e',
    textAlign: 'right',
    margin: '0 0 0.25rem',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'right',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#374151',
    textAlign: 'right',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    color: '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'right',
  },
  dropZone: {
    border: '2px dashed #d1d5db',
    borderRadius: '10px',
    padding: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '160px',
    background: '#f9fafb',
    transition: 'border-color 0.2s',
    overflow: 'hidden',
  },
  dropText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  uploadIcon: { fontSize: '2rem' },
  dropHint: { fontSize: '0.8rem', color: '#9ca3af' },
  preview: {
    maxWidth: '100%',
    maxHeight: '280px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  removeBtn: {
    alignSelf: 'flex-end',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: '0.25rem 0',
  },
  submit: {
    padding: '0.85rem',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '0.5rem',
  },
  successMsg: {
    color: '#16a34a',
    background: '#f0fdf4',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textAlign: 'right',
    margin: 0,
  },
  errorMsg: {
    color: '#dc2626',
    background: '#fef2f2',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    textAlign: 'right',
    margin: 0,
  },

  /* ── News List Section ── */
  listSection: {
    width: '100%',
    maxWidth: '900px',
    boxSizing: 'border-box',
  },
  listTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a1a2e',
    textAlign: 'right',
    marginBottom: '1.25rem',
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '1rem',
    padding: '2rem 0',
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '2rem 0',
    color: '#6b7280',
  },
  spinnerDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '2px solid #6b7280',
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  },

  /* ── News Card ── */
  newsCard: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    transition: 'box-shadow 0.2s',
  },
  newsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  newsTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1a1a2e',
    margin: 0,
    textAlign: 'right',
    flex: 1,
  },
  newsDate: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
  },
  newsDesc: {
    fontSize: '0.95rem',
    color: '#374151',
    lineHeight: 1.6,
    margin: 0,
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  toggleImageBtn: {
    alignSelf: 'flex-end',
    background: '#f0f4ff',
    border: '1px solid #c7d2fe',
    borderRadius: '6px',
    padding: '0.35rem 0.75rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#4338ca',
    fontWeight: 500,
    transition: 'background 0.2s',
  },
  newsImage: {
    width: '100%',
    borderRadius: '8px',
    objectFit: 'cover',
    maxHeight: '300px',
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem 0.5rem',
    transition: 'background 0.2s, color 0.2s',
    lineHeight: 1,
    flexShrink: 0,
  },
};