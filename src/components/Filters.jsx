export default function Filters({ topics, selectedTopic, selectedLanguage, onTopicChange, onLanguageChange }) {
  return (
    <section className="bg-dark-light p-8 rounded-lg shadow-lg mb-8">
      <div className="flex flex-wrap gap-8">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label htmlFor="topic-filter" className="font-semibold text-primary text-sm uppercase tracking-wide">
            Topic:
          </label>
          <select
            id="topic-filter"
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="px-3 py-2 border border-dark-lighter rounded bg-dark-light text-white cursor-pointer transition-colors hover:border-primary focus:border-primary focus:outline-none"
          >
            <option value="all">Tutti</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <label htmlFor="language-filter" className="font-semibold text-primary text-sm uppercase tracking-wide">
            Lingua:
          </label>
          <select
            id="language-filter"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-2 border border-dark-lighter rounded bg-dark-light text-white cursor-pointer transition-colors hover:border-primary focus:border-primary focus:outline-none"
          >
            <option value="all">Tutte</option>
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </section>
  );
}
