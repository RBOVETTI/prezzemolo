export default function ArticleCard({ article, onOpenCarousel, onOpenLeadGen }) {
  const languageLabel = article.language === 'it' ? 'Italiano' : 'English';

  const handleOptionClick = (option) => {
    if (option.type === 'download') {
      // Direct download
      window.open(option.file, '_blank');
    } else if (option.type === 'carousel') {
      // Open carousel in modal
      onOpenCarousel({ title: article.title, file: option.file });
    } else if (option.type === 'protected-download') {
      // Open lead generation modal
      onOpenLeadGen(article);
    }
  };

  return (
    <div className="bg-dark-light rounded-lg overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col">
      {/* Article Image */}
      {article.image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{article.title}</h2>

        <div className="flex gap-3 mb-4 flex-wrap">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary">
            {article.topic}
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-800/10 text-gray-800 border border-text-muted">
            {languageLabel}
          </span>
          {article.protected && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-500/15 text-red-400 border border-red-400">
              🔒 Protetto
            </span>
          )}
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
                  : option.type === 'protected-download'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary hover:bg-primary-dark text-dark'
              } hover:-translate-y-0.5 hover:shadow-lg`}
            >
              {option.type === 'protected-download' ? '🔒 ' : ''}{option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
