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

export function PdfViewer({ pdf, expiryMinutes = 10 }) {
  const Auth = useAuth();
  const user = Auth.getUser();
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileName = pdf.split('/').pop();
  const storageKey = `pdfUrl_${pdf}`;

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      setLoading(true);

      try {
        // Check sessionStorage for cached URL
        const cachedData = sessionStorage.getItem(storageKey);
        if (cachedData) {
          const { url, expiry } = JSON.parse(cachedData);
          if (Date.now() < expiry) {
            setPresignedUrl(url);
            setLoading(false);
            return; // still valid, no need to fetch
          }
        }

        // Fetch new pre-signed URL
        const response = await filesApi.presignedUrl(user, pdf, expiryMinutes);
        if (response.status !== 200) {
          throw new Error(`Failed to get presigned URL (${response.status})`);
        }

        const url = await response.data;

        // Save to sessionStorage with expiry timestamp
        const expiryTime = Date.now() + expiryMinutes * 60 * 1000; // in ms
        sessionStorage.setItem(storageKey, JSON.stringify({ url, expiry: expiryTime }));

        setPresignedUrl(url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPresignedUrl();
  }, [pdf, expiryMinutes, storageKey, user]);

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
          Chargement du PDF...
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
      {/* PDF Preview Card */}
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
        {/* Hover Overlay */}
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
              transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
              transition: 'transform 0.3s ease',
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

        {/* PDF Preview */}
        <Box
          component="iframe"
          src={`${presignedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          title={fileName}
          onContextMenu={(e) => e.preventDefault()}
          sx={{
            width: '100%',
            height: '700px',
            border: 'none',
            display: 'block',
          }}
        />

        {/* File Name Bar */}
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
              transition: 'color 0.3s ease',
            }}
          />
          <Typography
            sx={{
              fontWeight: '700',
              fontSize: '15px',
              color: isHovered ? 'white' : '#1a1a1a',
              flex: 1,
              transition: 'color 0.3s ease',
            }}
          >
            {fileName}
          </Typography>
          <Chip
            label="PDF"
            size="small"
            sx={{
              backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.1)',
              color: isHovered ? 'white' : '#667eea',
              fontWeight: '700',
              fontSize: '11px',
              transition: 'all 0.3s ease',
            }}
          />
        </Box>
      </Box>

      {/* Full Screen Modal */}
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
        {/* Modal Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PdfIcon sx={{ color: 'white', fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
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

        {/* Modal Content */}
        <DialogContent
          sx={{
            padding: 0,
            height: 'calc(100% - 64px)',
            background: '#f8f9fa',
            position: 'relative',
          }}
        >
          {/* Multiple Watermark Overlays for Better Visibility */}
          
          {/* Center Watermark - Large */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              fontSize: '120px',
              fontWeight: '900',
              color: 'rgba(102, 126, 234, 0.15)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
              whiteSpace: 'nowrap',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
              letterSpacing: '8px',
            }}
          >
            CONFIDENTIEL
          </Box>

          {/* Top Watermark */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              fontSize: '80px',
              fontWeight: '900',
              color: 'rgba(102, 126, 234, 0.12)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
              whiteSpace: 'nowrap',
              letterSpacing: '6px',
            }}
          >
            CONFIDENTIEL
          </Box>

          {/* Bottom Watermark */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '20%',
              left: '50%',
              transform: 'translate(-50%, 50%) rotate(-45deg)',
              fontSize: '80px',
              fontWeight: '900',
              color: 'rgba(102, 126, 234, 0.12)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
              whiteSpace: 'nowrap',
              letterSpacing: '6px',
            }}
          >
            CONFIDENTIEL
          </Box>

          {/* User Email Watermark - Bottom Right */}
          {user?.email && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(102, 126, 234, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: '8px',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1,
                border: '2px solid rgba(102, 126, 234, 0.3)',
              }}
            >
              {user.email}
            </Box>
          )}

          <Box
            component="iframe"
            src={`${presignedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
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