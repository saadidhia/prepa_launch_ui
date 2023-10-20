import { config } from '../../constants';

export function PdfViewer({ pdf }) {
  return (
    <div className="pdf-item">
      <iframe
        src={`${config.google_drive_url}/file/d/${pdf.id}/preview`}
        title="PDF Viewer"
        width="100%"
        height="300"
      />
      <p style={{
        fontWeight: 'bold', 
        margin: '0', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center the content vertically
        textAlign: 'center',
      }}>{pdf.name}</p>
    </div>
  );
}
