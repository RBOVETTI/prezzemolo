import React, { useState } from 'react';
import Modal from './Modal';

export default function LeadGenModal({ isOpen, onClose, article }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    gdprConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Validazione real-time
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Il nome deve contenere almeno 2 caratteri' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Inserisci un indirizzo email valido' : '';
      case 'gdprConsent':
        return !value ? 'Devi accettare la privacy policy per procedere' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: fieldValue }));

    // Validazione real-time
    const error = validateField(name, fieldValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione completa
    const newErrors = {};
    newErrors.name = validateField('name', formData.name);
    newErrors.email = validateField('email', formData.email);
    newErrors.gdprConsent = validateField('gdprConsent', formData.gdprConsent);

    setErrors(newErrors);

    // Se ci sono errori, non procedere
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          articleTitle: article.title,
          pdfUrl: window.location.origin + article.options.find(opt => opt.type === 'protected-download')?.file,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDownloadUrl(data.downloadUrl);
        setShowThankYou(true);

        // Avvia download automatico
        setTimeout(() => {
          window.open(data.downloadUrl, '_blank');
        }, 1000);
      } else {
        alert('Errore: ' + (data.error || 'Si è verificato un errore'));
      }
    } catch (error) {
      console.error('Errore submit:', error);
      alert('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!article) return null;

  if (showThankYou) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold text-primary mb-4">Grazie!</h2>
          <p className="text-text-muted mb-4">
            Il download del documento dovrebbe partire automaticamente.
          </p>
          <p className="text-text-muted mb-6">
            Riceverai anche un'email con il link al documento.
          </p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-primary text-dark font-bold rounded hover:bg-primary-dark transition-colors"
            >
              Download manuale
            </a>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 max-h-[85vh] overflow-y-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary mb-3">{article.title}</h2>
          {article.valueProposition && (
            <p className="text-lg text-text-muted">{article.valueProposition}</p>
          )}
        </div>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="mb-6">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Benefits */}
        {article.benefits && article.benefits.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cosa troverai in questo documento:</h3>
            <ul className="space-y-2">
              {article.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span className="text-text-muted">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Compila il form per scaricare il documento</h3>

          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
              Nome e Cognome *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Mario Rossi"
              className={`w-full px-4 py-3 bg-dark-light border ${
                errors.name ? 'border-red-500' : 'border-dark-lighter'
              } rounded text-gray-900 placeholder-text-muted focus:border-primary focus:outline-none`}
              required
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="mario.rossi@example.com"
              className={`w-full px-4 py-3 bg-dark-light border ${
                errors.email ? 'border-red-500' : 'border-dark-lighter'
              } rounded text-gray-900 placeholder-text-muted focus:border-primary focus:outline-none`}
              required
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Azienda */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-900 mb-1">
              Azienda
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Nome azienda"
              className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded text-gray-900 placeholder-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Ruolo */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-1">
              Ruolo
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Es. CTO, CFO, Manager"
              className="w-full px-4 py-3 bg-dark-light border border-dark-lighter rounded text-gray-900 placeholder-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* GDPR Consent */}
          <div className="pt-4">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="gdprConsent"
                checked={formData.gdprConsent}
                onChange={handleChange}
                className="mt-1 w-4 h-4 accent-primary"
                required
              />
              <span className="ml-3 text-sm text-text-muted">
                Ho letto e accetto la{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>{' '}
                e acconsento al trattamento dei miei dati personali. *
              </span>
            </label>
            {errors.gdprConsent && <p className="text-red-400 text-sm mt-1">{errors.gdprConsent}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-primary text-dark font-bold rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? 'Invio in corso...' : 'Scarica il documento'}
          </button>

          <p className="text-xs text-text-muted text-center">
            * Campi obbligatori
          </p>
        </form>
      </div>
    </Modal>
  );
}
