import { useState, useEffect } from "react";
import { newsApi } from '../../apis/newsApi';
import { useAuth } from '../context/AuthContext';


function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={filled ? "#e8445a" : "none"} stroke={filled ? "#e8445a" : "currentColor"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BookmarkIcon({ saved }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function NewsCard({ item }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [expanded, setExpanded] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const isLong = item.description.length > 120;
  const displayText =
    !expanded && isLong
      ? item.description.slice(0, 120) + "…"
      : item.description;

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 16px hsla(0, 0%, 0%, 0.07)",
        marginBottom: "28px",
        maxWidth: "480px",
        width: "100%",
        fontFamily: "'Outfit', sans-serif",
        border: "1px solid #f0f0f0",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.13)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)")}
    >
      {/* Header — RTL */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: "10px", direction: "rtl" }}>
        {/* Avatar on the right */}
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "700",
            fontSize: "15px",
            flexShrink: 0,
            boxShadow: "0 0 0 2px #fff, 0 0 0 3px #1a73e8",
          }}
        >
          G
        </div>
        {/* Author info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "13.5px", color: "#1a1a1a" }}>{item.author}</div>
          <div style={{ fontSize: "11.5px", color: "#999" }}>Grintta Academy</div>
        </div>
        {/* Date on the left */}
        <div style={{ fontSize: "11px", color: "#bbb", flexShrink: 0 }}>
          {(() => {
            const created = new Date(item.createdAt);
            const today = new Date();
            const isToday =
              created.getDate() === today.getDate() &&
              created.getMonth() === today.getMonth() &&
              created.getFullYear() === today.getFullYear();
            return isToday
              ? "اليوم"
              : created.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
          })()}
        </div>
      </div>

      {/* Image — full height, no crop */}
      <div style={{ width: "100%", overflow: "hidden", background: "#eee" }}>
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{ width: "100%", height: "auto", objectFit: "contain", display: "block", transition: "transform 0.4s" }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />
      </div>

      {/* Caption — RTL */}
      <div style={{ padding: "10px 14px 8px", fontSize: "13.5px", color: "#333", lineHeight: "1.55", direction: "rtl", textAlign: "right" }}>
        <span style={{ fontWeight: "700", marginLeft: "6px" }}>{item.author}</span>
        <span style={{ fontWeight: "700", color: "#1a73e8", marginLeft: "6px" }}>{item.title}</span>
        {displayText}
        {isLong && (
          <span
            onClick={() => setExpanded(!expanded)}
            style={{ color: "#888", cursor: "pointer", marginRight: "4px", fontWeight: "500" }}
          >
            {expanded ? " voir moins" : " voir plus"}
          </span>
        )}
      </div>
    </article>
  );
}

export function NewsRead() {

  const Auth = useAuth();
  const user = Auth.getUser();

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsApi.getNews(user);
        console.log("Fetched news:", response.data);
        setNewsList(response.data);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل الأخبار.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const centerStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '1rem', padding: '5rem',
    fontSize: '1rem', color: '#6b7280', direction: 'rtl',
    fontFamily: "'Outfit', sans-serif",
  };

  if (loading) return <div style={centerStyle}>⏳ جاري التحميل...</div>;
  if (error)   return <div style={{ ...centerStyle, color: '#dc2626' }}>⚠️ {error}</div>;
  if (!newsList.length) return <div style={centerStyle}>لا توجد أخبار حالياً.</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #efefef",
          padding: "13px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "800",
              fontSize: "14px",
            }}
          >
            G
          </div>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "#1a1a1a", letterSpacing: "-0.5px" }}>
            Grintta<span style={{ color: "#1a73e8" }}>News</span>
          </span>
        </div>
      </div>

      {/* Feed */}
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "20px 16px 40px",
        }}
      >
        {newsList.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default NewsRead;