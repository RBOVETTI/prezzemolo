// Variabili globali
let allArticles = [];
let filteredArticles = [];

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    setupEventListeners();
});

// Caricamento degli articoli dal file JSON
async function loadArticles() {
    try {
        const response = await fetch('articles.json');
        const data = await response.json();
        allArticles = data.articles;
        filteredArticles = [...allArticles];

        populateTopicFilter();
        displayArticles();
    } catch (error) {
        console.error('Errore nel caricamento degli articoli:', error);
        showError();
    }
}

// Popola il filtro dei topic con i valori unici
function populateTopicFilter() {
    const topicFilter = document.getElementById('topic-filter');
    const topics = [...new Set(allArticles.map(article => article.topic))];

    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        topicFilter.appendChild(option);
    });
}

// Setup degli event listeners per i filtri
function setupEventListeners() {
    const topicFilter = document.getElementById('topic-filter');
    const languageFilter = document.getElementById('language-filter');

    topicFilter.addEventListener('change', applyFilters);
    languageFilter.addEventListener('change', applyFilters);
}

// Applica i filtri selezionati
function applyFilters() {
    const selectedTopic = document.getElementById('topic-filter').value;
    const selectedLanguage = document.getElementById('language-filter').value;

    filteredArticles = allArticles.filter(article => {
        const topicMatch = selectedTopic === 'all' || article.topic === selectedTopic;
        const languageMatch = selectedLanguage === 'all' || article.language === selectedLanguage;

        return topicMatch && languageMatch;
    });

    displayArticles();
}

// Visualizza gli articoli filtrati
function displayArticles() {
    const articlesList = document.getElementById('articles-list');
    const noResults = document.getElementById('no-results');

    articlesList.innerHTML = '';

    if (filteredArticles.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    filteredArticles.forEach(article => {
        const articleCard = createArticleCard(article);
        articlesList.appendChild(articleCard);
    });
}

// Crea una card per un articolo
function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';

    const languageLabel = article.language === 'it' ? 'Italiano' : 'English';

    card.innerHTML = `
        <div class="article-header">
            <h2 class="article-title">${article.title}</h2>
            <div class="article-meta">
                <span class="tag topic">${article.topic}</span>
                <span class="tag language">${languageLabel}</span>
            </div>
        </div>
        <p class="article-description">${article.description}</p>
        <a href="${article.file}" class="download-link" download>
            Download
        </a>
    `;

    return card;
}

// Mostra un messaggio di errore
function showError() {
    const articlesList = document.getElementById('articles-list');
    articlesList.innerHTML = `
        <div class="no-results">
            <p>Si è verificato un errore nel caricamento degli articoli.</p>
        </div>
    `;
}
