import { useState } from 'react';
import { config } from '../../constants';

export function PdfViewer({ pdf }) {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // State to manage hover color

  // Extract the file name from the full path
  const fileName = pdf.split('/').pop();

  // Function to toggle modal
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      {/* PDF Thumbnail / Preview */}
      <div className="pdf-item" onClick={toggleModal}>
        <iframe
          src={`${config.s3_storage_url}/${pdf}#toolbar=0`}
          title="PDF Viewer"
          width="100%"
          height="700"
          style={{ cursor: 'pointer' }} // Add cursor pointer directly
        />
        <p
          onMouseEnter={() => setIsHovered(true)} // Change color on mouse enter
          onMouseLeave={() => setIsHovered(false)} // Reset color on mouse leave
          style={{
            fontWeight: 'bold',
            margin: '0',
            textAlign: 'center',
            color: isHovered ? 'blue' : 'black', // Change color on hover
            transition: 'color 0.2s', // Smooth transition for color change
          }}
        >
          {fileName}
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`${config.s3_storage_url}/${pdf}#toolbar=0`}
              title="PDF Viewer"
              width="100%"
              height="700"
              style={{ border: 'none' }}
            />
            <button onClick={toggleModal} className="close-button">Close</button>
          </div>
        </div>
      )}

      {/* Inline CSS for modal */}
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
