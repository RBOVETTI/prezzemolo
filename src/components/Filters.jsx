export default function Filters({ topics, selectedTopic, selectedLanguage, onTopicChange, onLanguageChange }) {
  return (
    <section className="bg-white p-8 rounded-lg shadow-md border border-accent-cold/10 mb-8">
      <div className="flex flex-wrap gap-8">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label htmlFor="topic-filter" className="font-medium text-accent-cold text-sm uppercase tracking-wide">
            Topic:
          </label>
          <select
            id="topic-filter"
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="px-3 py-2 border border-accent-cold/20 rounded bg-white text-text-primary cursor-pointer transition-colors hover:border-accent-cold focus:border-accent-cold focus:outline-none"
          >
            <option value="all">Tutti</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <label htmlFor="language-filter" className="font-medium text-accent-cold text-sm uppercase tracking-wide">
            Lingua:
          </label>
          <select
            id="language-filter"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-2 border border-accent-cold/20 rounded bg-white text-text-primary cursor-pointer transition-colors hover:border-accent-cold focus:border-accent-cold focus:outline-none"
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
