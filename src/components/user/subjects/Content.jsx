import { useEffect, useState } from "react";
import { filesApi } from '../../../apis/filesApi';
import { PdfViewer } from '../../small/PdfViewer';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from "react-router-dom";

export function Content(props) {
    const [pdfFiles, setPdfFiles] = useState([]);
    const Auth = useAuth();
    const user = Auth.getUser();
    const location = useLocation();
    const subFolderName = location.state?.subFolderName ?? 'books';

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await filesApi.getPdfs(user, subFolderName);
                console.log("subfolderName:", subFolderName);
                setPdfFiles(response.data);
            } catch (error) {
                console.error("Error fetching PDFs:", error);
            }
        };
        fetchPdfs();
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', margin: '20px 0' }}>
                
            </h1>
            <div className="pdf-container">
                {pdfFiles.length > 0 ? (
                    pdfFiles.map((pdf) => (
                        <div className="pdf-item" key={pdf.id}>
                            <PdfViewer pdf={pdf} />
                        </div>
                    ))
                ) : (
                    <p>No PDF files available</p>
                )}
            </div>
            <style jsx>{`
                .pdf-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 20px;
                }

                .pdf-item {
                    width: 30%; /* Initially show 3 PDFs per row */
                    min-width: 500px; /* Minimum width to ensure PDFs don't get too small */
                    max-width: 800px; /* Maximum width to ensure they don't get too large */
                    margin: 10px 0;
                }

                /* Media query for medium screens (2 items per row) */
                @media (max-width: 1024px) {
                    .pdf-item {
                        width: 45%;
                    }
                }

                /* Media query for small screens (1 item per row) */
                @media (max-width: 600px) {
                    .pdf-item {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
