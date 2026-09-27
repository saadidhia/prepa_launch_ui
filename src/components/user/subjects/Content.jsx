import { useEffect, useState } from "react";
import { filesApi } from '../../../apis/filesApi';
import { PdfViewer } from '../../small/PdfViewer';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from "react-router-dom";

export function Content(props) {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [filterQuery, setFilterQuery] = useState("");
    const [progress, setProgress] = useState({});
    const [statusFilter, setStatusFilter] = useState("all");
    const Auth = useAuth();
    const user = Auth.getUser();
    const location = useLocation();
    const subFolderName = location.state?.subFolderName ?? 'books';

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await filesApi.getPdfs(user, subFolderName);
                setPdfFiles(response.data);
            } catch (error) {
                console.error("Error fetching PDFs:", error);
            }
        };
        const fetchProgress = async () => {
            try {
                const response = await filesApi.getPdfProgress(user);
                const map = {};
                (response.data || []).forEach(({ pdfKey, inProgress, completed }) => {
                    map[pdfKey] = { inProgress: !!inProgress, completed: !!completed };
                });
                setProgress(map);
            } catch (error) {
                console.error("Error fetching PDF progress:", error);
            }
        };
        fetchPdfs();
        fetchProgress();
    }, []);

    const getStatus = (pdf) => progress[pdf] ?? { inProgress: false, completed: false };

    const toggleStatus = async (pdf, field) => {
        const previous = getStatus(pdf);
        const next = { ...previous, [field]: !previous[field] };
        setProgress((p) => ({ ...p, [pdf]: next }));
        try {
            await filesApi.updatePdfProgress(user, pdf, next.inProgress, next.completed);
        } catch (error) {
            console.error("Error updating PDF progress:", error);
            setProgress((p) => ({ ...p, [pdf]: previous }));
        }
    };

    const getFileName = (path) => path.split('/').pop();

    const matchesStatus = (pdf) => {
        if (statusFilter === "inProgress") return getStatus(pdf).inProgress;
        if (statusFilter === "completed") return getStatus(pdf).completed;
        return true;
    };

    const isVisible = (pdf) =>
        matchesStatus(pdf) &&
        (!filterQuery || getFileName(pdf).toLowerCase().includes(filterQuery.toLowerCase()));

    const anyVisible = pdfFiles.some(isVisible);
    const completedCount = pdfFiles.filter((pdf) => getStatus(pdf).completed).length;
    const inProgressCount = pdfFiles.filter((pdf) => getStatus(pdf).inProgress).length;

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', margin: '20px 0' }}>
                
            </h1>

            <div className="search-wrapper">
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="ابحث عن ملف..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="search-input"
                    />
                    {filterQuery && (
                        <button className="clear-btn" onClick={() => setFilterQuery("")}>
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {pdfFiles.length > 0 && (
                <div className="progress-wrapper">
                    <div className="progress-summary">
                        <span>مكتمل: {completedCount} / {pdfFiles.length}</span>
                        <div className="progress-bar">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${(completedCount / pdfFiles.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="status-filters">
                        {[
                            { value: "all", label: `الكل (${pdfFiles.length})` },
                            { value: "inProgress", label: `قيد الإنجاز (${inProgressCount})` },
                            { value: "completed", label: `مكتمل (${completedCount})` },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                className={`status-filter-btn ${statusFilter === value ? 'active' : ''}`}
                                onClick={() => setStatusFilter(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="pdf-container">
                {pdfFiles.length > 0 ? (
                    <>
                        {pdfFiles.map((pdf) => (
                            <div
                                className="pdf-item"
                                key={pdf}
                                style={{ display: isVisible(pdf) ? undefined : 'none' }}
                            >
                                <div className="pdf-status">
                                    <label className={getStatus(pdf).inProgress ? 'checked in-progress' : ''}>
                                        <input
                                            type="checkbox"
                                            checked={getStatus(pdf).inProgress}
                                            onChange={() => toggleStatus(pdf, 'inProgress')}
                                        />
                                        قيد الإنجاز
                                    </label>
                                    <label className={getStatus(pdf).completed ? 'checked completed' : ''}>
                                        <input
                                            type="checkbox"
                                            checked={getStatus(pdf).completed}
                                            onChange={() => toggleStatus(pdf, 'completed')}
                                        />
                                        مكتمل
                                    </label>
                                </div>
                                <PdfViewer pdf={pdf} />
                            </div>
                        ))}
                        {!anyVisible && (
                            <p>لا توجد نتائج مطابقة.</p>
                        )}
                    </>
                ) : (
                    <p>سيتم إضافة الملفات قريبًا .</p>
                )}
            </div>

            <style jsx>{`
                .search-wrapper {
                    display: flex;
                    justify-content: center;
                    margin: 0 auto 30px auto;
                    width: 100%;
                    max-width: 600px;
                    padding: 0 16px;
                    box-sizing: border-box;
                }

                .search-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    background: #fff;
                    border: 2px solid #e0e0e0;
                    border-radius: 50px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                    transition: border-color 0.2s, box-shadow 0.2s;
                    overflow: hidden;
                }

                .search-container:focus-within {
                    border-color: #4a90e2;
                    box-shadow: 0 4px 20px rgba(74, 144, 226, 0.2);
                }

                .search-icon {
                    padding: 0 12px 0 16px;
                    font-size: 16px;
                    color: #999;
                    pointer-events: none;
                    flex-shrink: 0;
                }

                .search-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    padding: 12px 8px;
                    background: transparent;
                    color: #333;
                    direction: rtl;
                    min-width: 0;
                }

                .search-input::placeholder {
                    color: #aaa;
                }

                .clear-btn {
                    background: #e0e0e0;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    margin-right: 10px;
                    cursor: pointer;
                    font-size: 11px;
                    color: #666;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: background 0.2s;
                }

                .clear-btn:hover {
                    background: #bbb;
                    color: #333;
                }

                .pdf-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 20px;
                }

                .progress-wrapper {
                    max-width: 600px;
                    margin: 0 auto 24px auto;
                    padding: 0 16px;
                    direction: rtl;
                }

                .progress-summary {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .progress-bar {
                    flex: 1;
                    height: 10px;
                    background: #e5e7eb;
                    border-radius: 5px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    transition: width 0.3s ease;
                }

                .status-filters {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .status-filter-btn {
                    border: 2px solid #667eea;
                    background: transparent;
                    color: #667eea;
                    border-radius: 20px;
                    padding: 6px 14px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .status-filter-btn.active {
                    background: #667eea;
                    color: #fff;
                }

                .pdf-status {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    margin-bottom: 8px;
                    direction: rtl;
                }

                .pdf-status label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    padding: 4px 12px;
                    border-radius: 16px;
                    border: 1px solid #e5e7eb;
                    font-weight: 600;
                    user-select: none;
                }

                .pdf-status label.in-progress {
                    background: #fff7ed;
                    border-color: #f59e0b;
                    color: #b45309;
                }

                .pdf-status label.completed {
                    background: #ecfdf5;
                    border-color: #10b981;
                    color: #047857;
                }

                .pdf-item {
                    width: 30%;
                    min-width: 500px;
                    max-width: 800px;
                    margin: 10px 0;
                }

                @media (max-width: 1024px) {
                    .pdf-item {
                        width: 45%;
                    }
                }

                @media (max-width: 600px) {
                    .pdf-item {
                        width: 100%;
                        min-width: unset;
                    }

                    .search-input {
                        font-size: 14px;
                        padding: 10px 6px;
                    }
                }
            `}</style>
        </div>
    );
}