import { useEffect, useState } from "react";
import { filesApi } from '../../../apis/filesApi';
import { PdfViewer } from '../../small/PdfViewer';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from "react-router-dom";

export function Content(props) {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [filterQuery, setFilterQuery] = useState("");
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
        fetchPdfs();
    }, []);

    const getFileName = (path) => path.split('/').pop();

    const isVisible = (pdf) =>
        !filterQuery || getFileName(pdf).toLowerCase().includes(filterQuery.toLowerCase());

    const anyVisible = pdfFiles.some(isVisible);

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

            <div className="pdf-container">
                {pdfFiles.length > 0 ? (
                    <>
                        {pdfFiles.map((pdf) => (
                            <div
                                className="pdf-item"
                                key={pdf}
                                style={{ display: isVisible(pdf) ? undefined : 'none' }}
                            >
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