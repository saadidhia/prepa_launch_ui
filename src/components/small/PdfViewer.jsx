import { useState, useEffect } from 'react';
import { bearerAuth } from '../../apis/AuthApi';
import { useAuth } from '../context/AuthContext';
import { filesApi } from '../../apis/filesApi';

export function PdfViewer({ pdf, expiryMinutes = 10 }) {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileName = pdf.split('/').pop();

  useEffect(() => {

    const fetchPresignedUrl = async () => {
      setLoading(true);
      try {
        const response = await filesApi.presignedUrl(user, pdf, expiryMinutes);
        console.log("Presigned URL response:", response);

        if (response.status !== 200) {
          throw new Error(`Failed to get presigned URL (${response.status})`);
        }

        const url = await response.data; 
        setPresignedUrl(url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPresignedUrl();
  }, [pdf, expiryMinutes]); // only depend on stable token

  const toggleModal = () => setShowModal(!showModal);

  if (loading) return <p>Loading PDF...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!presignedUrl) return null;

  return (
    <>
      <div className="pdf-item" onClick={toggleModal}>
        <iframe
          src={`${presignedUrl}#toolbar=0`}
          title={fileName}
          width="100%"
          height="700"
          style={{ cursor: 'pointer' }}
        />
        <p
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            fontWeight: 'bold',
            margin: '0',
            textAlign: 'center',
            color: isHovered ? 'blue' : 'black',
            transition: 'color 0.2s',
          }}
        >
          {fileName}
        </p>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`${presignedUrl}#toolbar=0`}
              title="PDF Viewer"
              width="100%"
              height="700"
              style={{ border: 'none' }}
            />
            <button onClick={toggleModal} className="close-button">Close</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          position: relative;
          width: 80%;
          height: 80%;
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: red;
          color: white;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
        }
        .pdf-item {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
