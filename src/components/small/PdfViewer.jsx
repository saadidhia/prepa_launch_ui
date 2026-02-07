import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { filesApi } from '../../apis/filesApi';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export function PdfViewer({ pdf, expiryMinutes = 10 }) {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileName = pdf.split('/').pop();

  const addWatermarkToPdf = async (pdfUrl, userEmail, userPhone) => {
    console.log('Adding watermark with email:', userEmail, 'and phone:', userPhone);
    
    const response = await fetch(pdfUrl, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    
    const pdfBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      // Big center watermark - USER EMAIL (rotated)
      page.drawText(userEmail, {
        x: width / 2 - 100,
        y: height / 2,
        size: 40,
        font: font,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.4,
        rotate: degrees(-45),
      });
      
      // Big center watermark - USER PHONE (rotated)
      page.drawText(String(userPhone), {
        x: width / 2 - 100,
        y: height / 2 - 50,
        size: 40,
        font: font,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.4,
        rotate: degrees(-45),
      });

      page.drawText("grinttaacademy.com", {
        x: width / 2 - 100,
        y: height / 2 - 100,
        size: 40,
        font: font,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.4,
        rotate: degrees(-45),
      });
    }

    const watermarkedPdfBytes = await pdfDoc.save();
    const blob = new Blob([watermarkedPdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAndWatermarkPdf = async () => {
      setLoading(true);
      setError(null);

      try {
        const userEmail = user.data.email;
        const numberPhone = user.data.phone;
   
        console.log("phone ", numberPhone, userEmail);
        const response = await filesApi.presignedUrl(user, pdf, expiryMinutes);
        
        if (response.status !== 200) {
          throw new Error(`Failed to get presigned URL (${response.status})`);
        }

        const originalUrl = response.data;
        console.log('✅ Got presigned URL');

        const watermarkedUrl = await addWatermarkToPdf(originalUrl, userEmail, numberPhone);
        
        if (isMounted) {
          console.log('✅ Watermarked PDF with email:', userEmail);
          setPresignedUrl(watermarkedUrl);
        }
        
      } catch (err) {
        console.error('❌ Error:', err);
        if (isMounted) {
          setError(`Erreur: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAndWatermarkPdf();

    return () => {
      isMounted = false;
    };
  }, [pdf, expiryMinutes]);

  const toggleModal = () => setShowModal(!showModal);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          borderRadius: '20px',
          border: '2px dashed rgba(102, 126, 234, 0.3)',
        }}
      >
        <CircularProgress
          sx={{
            color: '#667eea',
            marginBottom: '16px',
          }}
        />
        <Typography
          sx={{
            color: '#667eea',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Ajout des watermarks...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          borderRadius: '16px',
          border: '2px solid #fecaca',
        }}
      >
        {error}
      </Alert>
    );
  }

  if (!presignedUrl) return null;

  return (
    <>
      <Box
        onClick={toggleModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => e.preventDefault()}
        sx={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '2px solid #e5e7eb',
          background: 'white',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.2)',
            borderColor: '#667eea',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FullscreenIcon sx={{ fontSize: 32, color: '#667eea' }} />
            </Box>
            <Typography
              sx={{
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
              }}
            >
              Cliquez pour agrandir
            </Typography>
          </Box>
        </Box>

        <Box
          component="embed"
          src={presignedUrl}
          type="application/pdf"
          title={fileName}
          onContextMenu={(e) => e.preventDefault()}
          sx={{
            width: '100%',
            height: '700px',
            border: 'none',
            display: 'block',
          }}
        />
        
        {/* Fallback object for browsers that don't support embed */}
        <Box
          component="object"
          data={presignedUrl}
          type="application/pdf"
          onContextMenu={(e) => e.preventDefault()}
          sx={{
            width: '100%',
            height: '700px',
            border: 'none',
            display: 'none',
          }}
        />

        <Box
          sx={{
            padding: '16px 20px',
            background: isHovered
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#f8f9fa',
            borderTop: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.3s ease',
          }}
        >
          <PdfIcon
            sx={{
              color: isHovered ? 'white' : '#667eea',
              fontSize: 24,
            }}
          />
          <Typography
            sx={{
              fontWeight: '700',
              fontSize: '15px',
              color: isHovered ? 'white' : '#1a1a1a',
              flex: 1,
            }}
          >
            {fileName}
          </Typography>
          <Chip
            label="PROTÉGÉ"
            size="small"
            sx={{
              backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.1)',
              color: isHovered ? 'white' : '#667eea',
              fontWeight: '700',
              fontSize: '11px',
            }}
          />
        </Box>
      </Box>

      <Dialog
        open={showModal}
        onClose={toggleModal}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '90vw',
            height: '90vh',
            maxWidth: 'none',
            borderRadius: '24px',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <PdfIcon sx={{ color: 'white', fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fileName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Tooltip title="Fermer">
              <IconButton
                onClick={toggleModal}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <DialogContent
          sx={{
            padding: 0,
            height: 'calc(100% - 64px)',
            background: '#f8f9fa',
            overflow: 'hidden',
          }}
        >
          <Box
            component="embed"
            src={`${presignedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            title="PDF Viewer"
            onContextMenu={(e) => e.preventDefault()}
            sx={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}