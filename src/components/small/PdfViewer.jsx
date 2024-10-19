import { config } from '../../constants';

export function PdfViewer({ pdf }) {
  // Extract the file name from the full path
  const fileName = pdf.split('/').pop(); 

  return (
    <div className="pdf-item">
      <iframe
        src={`${config.s3_storage_url}/${pdf}#toolbar=0`}
        title="PDF Viewer"
        width="100%"
        height="700"
        // sandbox="allow-scripts allow-same-origin" // Restrict the iframe
      />
      <p style={{
        fontWeight: 'bold',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        {fileName}
      </p>
    </div>
  );
}
