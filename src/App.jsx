import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Filters from './components/Filters';
import ArticleCard from './components/ArticleCard';
import Modal from './components/Modal';
import PDFCarousel from './components/PDFCarousel';

function App() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [carouselModal, setCarouselModal] = useState({ isOpen: false, title: '', file: '' });

  // Load articles
  useEffect(() => {
    fetch('/articles.json')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles);
        setFilteredArticles(data.articles);

        // Extract unique topics
        const uniqueTopics = [...new Set(data.articles.map((article) => article.topic))];
        setTopics(uniqueTopics);
      })
      .catch((error) => console.error('Error loading articles:', error));
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = articles.filter((article) => {
      const topicMatch = selectedTopic === 'all' || article.topic === selectedTopic;
      const languageMatch = selectedLanguage === 'all' || article.language === selectedLanguage;
      return topicMatch && languageMatch;
    });
    setFilteredArticles(filtered);
  }, [selectedTopic, selectedLanguage, articles]);

  const handleOpenCarousel = ({ title, file }) => {
    setCarouselModal({ isOpen: true, title, file });
  };

  const handleCloseCarousel = () => {
    setCarouselModal({ isOpen: false, title: '', file: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto px-5 max-w-6xl flex-grow">
        <Filters
          topics={topics}
          selectedTopic={selectedTopic}
          selectedLanguage={selectedLanguage}
          onTopicChange={setSelectedTopic}
          onLanguageChange={setSelectedLanguage}
        />

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">
              Nessun articolo trovato con i filtri selezionati.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onOpenCarousel={handleOpenCarousel}
              />
            ))}
          </section>
        )}
      </main>

      <Footer />

      {/* Carousel Modal */}
      <Modal isOpen={carouselModal.isOpen} onClose={handleCloseCarousel}>
        <PDFCarousel pdfUrl={carouselModal.file} title={carouselModal.title} />
      </Modal>
    </div>
  );
}

export default App;
