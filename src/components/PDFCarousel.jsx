import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFCarousel({ pdfUrl, title }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageWidth, setPageWidth] = useState(null);

  // Calcola la dimensione ottimale del PDF in base allo schermo
  const calculatePDFSize = () => {
    const maxWidth = Math.min(window.innerWidth - 80, 800);
    // Usa 70vh per l'altezza massima (lasciando spazio per titolo e indicatori)
    const maxHeight = window.innerHeight * 0.7;

    // Per PDF quadrati/verticali, usa la dimensione più piccola
    return Math.min(maxWidth, maxHeight);
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    setPageWidth(calculatePDFSize());
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setLoading(false);
    setError('Impossibile caricare il PDF. Verifica che il file esista e sia accessibile.');
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleTouchStart = (e) => {
    const touchStartX = e.touches[0].clientX;

    const handleTouchEnd = (endEvent) => {
      const touchEndX = endEvent.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNextPage();
        } else {
          goToPrevPage();
        }
      }

      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };

  // Gestisci resize della finestra
  React.useEffect(() => {
    const handleResize = () => {
      if (numPages) {
        setPageWidth(calculatePDFSize());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [numPages]);

  return (
    <div className="flex flex-col items-center py-4 px-4 max-h-[85vh] overflow-y-auto">
      <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 text-center">{title}</h2>

      <div
        className="relative flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden max-w-full"
        onTouchStart={handleTouchStart}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-light">
            <div className="text-primary text-lg">Loading PDF...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-20 bg-dark-light rounded-lg">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-2">⚠️ Errore</div>
              <div className="text-text-muted">{error}</div>
            </div>
          </div>
        )}

        {!error && <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center p-20">
              <div className="text-primary">Loading...</div>
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            width={pageWidth || calculatePDFSize()}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto"
          />
        </Document>}

        {/* Navigation Arrows */}
        {!error && currentPage > 1 && (
          <button
            onClick={goToPrevPage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-dark w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all shadow-lg"
            aria-label="Previous page"
          >
            ‹
          </button>
        )}

        {!error && currentPage < numPages && (
          <button
            onClick={goToNextPage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-dark w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all shadow-lg"
            aria-label="Next page"
          >
            ›
          </button>
        )}
      </div>

      {/* Page Indicator */}
      {!error && numPages && (
        <div className="mt-4 flex items-center gap-4 flex-wrap justify-center">
          <div className="text-text-muted">
            Page {currentPage} of {numPages}
          </div>

          {/* Page Dots */}
          <div className="flex gap-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-2 h-2 rounded-full transition-all ${
                  page === currentPage
                    ? 'bg-primary w-6'
                    : 'bg-text-muted hover:bg-primary/50'
                }`}
                aria-label={`Go to page ${page}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
