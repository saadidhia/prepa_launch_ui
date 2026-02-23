import { useState, useEffect, useRef } from 'react';
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
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

// react-pdf-viewer
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode';
import '@react-pdf-viewer/core/lib/styles/index.css';

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar — no download, no print
// ─────────────────────────────────────────────────────────────────────────────
function Toolbar({ pageNav, zoom }) {
  const { GoToPreviousPage, GoToNextPage, CurrentPageLabel, NumberOfPages } = pageNav;
  const { ZoomIn, ZoomOut, CurrentScale } = zoom;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <GoToPreviousPage>
        {({ isDisabled, onClick }) => (
          <IconButton size="small" disabled={isDisabled} onClick={onClick}
            sx={{ color: 'white', '&:disabled': { color: 'rgba(255,255,255,0.3)' } }}>
            <PrevIcon fontSize="small" />
          </IconButton>
        )}
      </GoToPreviousPage>

      <Typography sx={{ color: 'white', fontSize: '13px', whiteSpace: 'nowrap' }}>
        <CurrentPageLabel /> / <NumberOfPages />
      </Typography>

      <GoToNextPage>
        {({ isDisabled, onClick }) => (
          <IconButton size="small" disabled={isDisabled} onClick={onClick}
            sx={{ color: 'white', '&:disabled': { color: 'rgba(255,255,255,0.3)' } }}>
            <NextIcon fontSize="small" />
          </IconButton>
        )}
      </GoToNextPage>

      <Box sx={{ flex: 1 }} />

      <ZoomOut>
        {({ onClick }) => (
          <IconButton size="small" onClick={onClick} sx={{ color: 'white' }}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        )}
      </ZoomOut>

      <CurrentScale>
        {({ scale }) => (
          <Typography sx={{ color: 'white', fontSize: '13px', minWidth: '44px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
        )}
      </CurrentScale>

      <ZoomIn>
        {({ onClick }) => (
          <IconButton size="small" onClick={onClick} sx={{ color: 'white' }}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        )}
      </ZoomIn>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SecurePdfViewer — page-by-page mode, arrow keys to navigate
// ─────────────────────────────────────────────────────────────────────────────
function SecurePdfViewer({ url, height = '680px', showToolbar = true }) {
  const pageNavPlugin  = pageNavigationPlugin();
  const zoomPlug       = zoomPlugin();

  // scrollModePlugin initialized with Page mode (value 2 = Page)
  // 0 = Vertical, 1 = Horizontal, 2 = Wrapped, 3 = Page
  const scrollModePlug = scrollModePlugin({ scrollMode: 3 });

  const containerRef = useRef(null);
  const { jumpToNextPage, jumpToPreviousPage } = pageNavPlugin;

  // Block Ctrl+S / Ctrl+P globally
  useEffect(() => {
    const blockKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', blockKeys);
    return () => window.removeEventListener('keydown', blockKeys);
  }, []);

  // Auto-focus container after PDF loads so arrow keys work immediately
  useEffect(() => {
    const t = setTimeout(() => containerRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  // ArrowRight / ArrowDown → next page
  // ArrowLeft  / ArrowUp   → previous page
  const handleKeyDown = (e) => {
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      jumpToNextPage();
    } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      jumpToPreviousPage();
    }
  };

  return (
    <Box
      onContextMenu={(e) => e.preventDefault()}
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        '& .rpv-toolbar__item--download': { display: 'none !important' },
        '& .rpv-toolbar__item--print':    { display: 'none !important' },
        '& [data-testid="get-file__download-button"]': { display: 'none !important' },
      }}
    >
      {showToolbar && <Toolbar pageNav={pageNavPlugin} zoom={zoomPlug} />}

      <Box
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => containerRef.current?.focus()}
        sx={{
          flex: 1,
          overflow: 'hidden',
          background: '#e5e7eb',
          outline: 'none',
          '&:focus': { outline: 'none' },
          '& canvas': {
            pointerEvents: 'none',
            userSelect: 'none',
          },
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={url}
            plugins={[pageNavPlugin, zoomPlug, scrollModePlug]}
            defaultScale={SpecialZoomLevel.PageFit}
          />
        </Worker>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PdfViewer
// ─────────────────────────────────────────────────────────────────────────────
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
    const response = await fetch(pdfUrl, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);

    const pdfBuffer = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const page of pages) {
      const { width, height } = page.getSize();
      const opts = (yOffset = 0) => ({
        x: width / 2 - 100,
        y: height / 2 + yOffset,
        size: 40,
        font,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.4,
        rotate: degrees(-45),
      });
      page.drawText(userEmail,            opts(50));
      page.drawText(String(userPhone),    opts(0));
      page.drawText('grinttaacademy.com', opts(-50));
    }

    const bytes = await pdfDoc.save();
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const userEmail = user.data.email;
        const userPhone = user.data.phone;
        const res = await filesApi.presignedUrl(user, pdf, expiryMinutes);
        if (res.status !== 200) throw new Error(`Presigned URL error (${res.status})`);
        const watermarkedUrl = await addWatermarkToPdf(res.data, userEmail, userPhone);
        if (isMounted) setPresignedUrl(watermarkedUrl);
      } catch (err) {
        console.error('❌', err);
        if (isMounted) setError(`Erreur: ${err.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [pdf, expiryMinutes]);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 20px',
        background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
        borderRadius: '20px', border: '2px dashed rgba(102,126,234,0.3)',
      }}>
        <CircularProgress sx={{ color: '#667eea', marginBottom: '16px' }} />
        <Typography sx={{ color: '#667eea', fontWeight: 600, fontSize: '14px' }}>
          Ajout des watermarks...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '16px', border: '2px solid #fecaca' }}>
        {error}
      </Alert>
    );
  }

  if (!presignedUrl) return null;

  return (
    <>
      {/* ── Inline card ─────────────────────────────────────────────────── */}
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '2px solid #e5e7eb',
          background: 'white',
          boxShadow: '0 4px 20px rgba(102,126,234,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 32px rgba(102,126,234,0.2)',
            borderColor: '#667eea',
          },
        }}
      >
        <Tooltip title="Agrandir">
          <Box
            onClick={() => setShowModal(true)}
            sx={{
              position: 'absolute', top: 12, right: 12, zIndex: 10,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              '&:hover': { background: 'white', transform: 'scale(1.1)' },
            }}
          >
            <FullscreenIcon sx={{ fontSize: 24, color: '#667eea' }} />
          </Box>
        </Tooltip>

        <SecurePdfViewer url={presignedUrl} height="680px" showToolbar />

        <Box sx={{
          padding: '14px 20px',
          background: isHovered ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa',
          borderTop: '2px solid #e5e7eb',
          display: 'flex', alignItems: 'center', gap: '12px',
          transition: 'background 0.3s ease',
        }}>
          <PdfIcon sx={{ color: isHovered ? 'white' : '#667eea', fontSize: 24 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: isHovered ? 'white' : '#1a1a1a', flex: 1 }}>
            {fileName}
          </Typography>
          <Chip label="PROTÉGÉ" size="small" sx={{
            backgroundColor: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(102,126,234,0.1)',
            color: isHovered ? 'white' : '#667eea',
            fontWeight: 700, fontSize: '11px',
          }} />
        </Box>
      </Box>

      {/* ── Full-screen modal ──────────────────────────────────────────── */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '90vw', height: '90vh', maxWidth: 'none',
            borderRadius: '24px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          },
        }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
            <PdfIcon sx={{ color: 'white', fontSize: 26, flexShrink: 0 }} />
            <Typography sx={{
              color: 'white', fontWeight: 700, fontSize: '15px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {fileName}
            </Typography>
          </Box>
          <Tooltip title="Fermer">
            <IconButton onClick={() => setShowModal(false)}
              sx={{ color: 'white', ml: 1, '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <DialogContent sx={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <SecurePdfViewer url={presignedUrl} height="100%" showToolbar={false} />
        </DialogContent>
      </Dialog>
    </>
  );
}