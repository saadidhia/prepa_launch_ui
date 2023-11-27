import { useEffect, useState } from "react"
import { premiereApi } from '../../../apis/premiereApi';
import { PdfViewer} from '../../small/PdfViewer' 
import { useAuth } from '../../context/AuthContext'
import subjects from "../../../subjects";

export function Mp1(props) {

    const {name}=props
    const [pdfFiles, setPdfFiles] = useState([]);
    const Auth = useAuth()
    const user = Auth.getUser() 
    
    useEffect(() => {
        const fetchPdfs = async () => {
          try {

            const response = await premiereApi.getPdfs(user);
            console.log(response.data);
            setPdfFiles(response.data);
            
          } catch (error) {
            console.error("Error fetching PDFs:", error);
          }
        };
        fetchPdfs();
      }, []);
    return (
        <div>
        <h1>PDF Viewer</h1>
        <div className="pdf-container" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {pdfFiles.length > 0 ? (
            pdfFiles.map((pdf) => (
              <div style={{ width: '30%', margin: '10px 0' }}>
  
                <PdfViewer key={pdf.id} pdf={pdf} />
              </div>
            ))
          ) : (
            <p>No PDF files available</p>
          )}
        </div>
      </div>
    )
}