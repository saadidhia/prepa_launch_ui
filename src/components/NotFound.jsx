import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/notFound.css';

export default function NotFound() {
  const location = useLocation();

  return (
    <section className="not-found-page" aria-live="polite">
      <div className="not-found-grid-overlay" aria-hidden="true" />
      <div className="not-found-shell">
        <span className="not-found-badge">خطأ تنقل</span>
        <p className="not-found-code">
          4<span>0</span>4
        </p>
        <h1 className="not-found-title">الصفحة غير موجودة</h1>
        <p className="not-found-message">
          يبدو ان الرابط الذي طلبته غير متاح حاليا. قد يكون تم تغيير المسار او حذفه اثناء تحديث المنصة.
        </p>
        <p className="not-found-path" dir="ltr">
          {location.pathname}
        </p>
        <div className="not-found-actions">
          <Link className="not-found-btn" to="/">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
