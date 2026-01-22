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
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col border border-accent-cold/10">
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
          <h2 className="text-xl font-serif font-medium text-text-primary mb-3">{article.title}</h2>

        <div className="flex gap-3 mb-4 flex-wrap">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent-warm/10 text-accent-warm border border-accent-warm">
            {article.topic}
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent-cold/10 text-accent-cold border border-accent-cold/30">
            {languageLabel}
          </span>
          {article.protected && (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent-warm/10 text-accent-warm border border-accent-warm">
              🔒 Protetto
            </span>
          )}
        </div>
      </div>

        <p className="text-text-secondary mb-6 flex-grow leading-relaxed">
          {article.description}
        </p>

        {/* Options */}
        <div className="flex flex-wrap gap-3">
          {article.options && article.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className={`px-6 py-3 rounded font-medium transition-all ${
                option.type === 'carousel'
                  ? 'bg-transparent border border-accent-cold text-accent-cold hover:bg-accent-cold hover:text-white'
                  : option.type === 'protected-download'
                  ? 'bg-accent-warm hover:bg-accent-warm/90 text-white'
                  : 'bg-accent-warm hover:bg-accent-warm/90 text-white'
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
