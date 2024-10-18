import { config } from '../../constants';

export function PdfViewer({ pdf }) {
  return (
    <div className="pdf-item">
      <iframe
        src={`${config.s3_storage_url}/${pdf}`}
        title="PDF Viewer"
        width="100%"
        height="700"
      />
      <p style={{
        fontWeight: 'bold', 
        margin: '0', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center the content vertically
        textAlign: 'center',
      }}>pdf</p>
    </div>
  );
}
