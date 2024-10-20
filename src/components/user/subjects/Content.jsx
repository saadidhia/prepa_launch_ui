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
    const subFolderName = location.state?.subFolderName;

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

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', margin: '20px 0' }}>
                {subFolderName.split("/").pop()}
            </h1>
            <div className="pdf-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px'  }}>
                {pdfFiles.length > 0 ? (
                    pdfFiles.map((pdf) => (
                        <div style={{ width: '30%', margin: '10px 0' }} key={pdf.id}>
                            <PdfViewer pdf={pdf} />
                        </div>
                    ))
                ) : (
                    <p>No PDF files available</p>
                )}
            </div>
        </div>
    );
}
