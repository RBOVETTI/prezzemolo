import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFCarousel({ pdfUrl, title }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setLoading(false);
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

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">{title}</h2>

      <div
        className="relative flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden"
        onTouchStart={handleTouchStart}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-light">
            <div className="text-primary text-lg">Loading PDF...</div>
          </div>
        )}

        <Document
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
            width={Math.min(window.innerWidth - 40, 800)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto"
          />
        </Document>

        {/* Navigation Arrows */}
        {currentPage > 1 && (
          <button
            onClick={goToPrevPage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-dark w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all shadow-lg"
            aria-label="Previous page"
          >
            ‹
          </button>
        )}

        {currentPage < numPages && (
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
      {numPages && (
        <div className="mt-6 flex items-center gap-4">
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
