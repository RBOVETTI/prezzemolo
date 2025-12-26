export default function ArticleCard({ article, onOpenCarousel }) {
  const languageLabel = article.language === 'it' ? 'Italiano' : 'English';

  const handleOptionClick = (option) => {
    if (option.type === 'download') {
      // Direct download
      window.open(option.file, '_blank');
    } else if (option.type === 'carousel') {
      // Open carousel in modal
      onOpenCarousel({ title: article.title, file: option.file });
    }
  };

  return (
    <div className="bg-dark-light rounded-lg p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-3">{article.title}</h2>

        <div className="flex gap-3 mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary">
            {article.topic}
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white border border-text-muted">
            {languageLabel}
          </span>
        </div>
      </div>

      <p className="text-text-muted mb-6 flex-grow leading-relaxed">
        {article.description}
      </p>

      {/* Options */}
      <div className="flex flex-wrap gap-3">
        {article.options && article.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`px-6 py-3 rounded font-semibold transition-all ${
              option.type === 'carousel'
                ? 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-dark'
                : 'bg-primary hover:bg-primary-dark text-dark'
            } hover:-translate-y-0.5 hover:shadow-lg`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
