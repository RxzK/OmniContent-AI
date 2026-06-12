const Parser = require('rss-parser');
const axios = require('axios');
const parser = new Parser();

const FEEDS = [
    { name: 'Technology', url: 'https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Finance', url: 'https://news.google.com/rss/search?q=finance&hl=en-US&gl=US&ceid=US:en' },
    { name: 'Health', url: 'https://news.google.com/rss/search?q=health&hl=en-US&gl=US&ceid=US:en' },
    { name: 'AI', url: 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en' }
];

async function fetchAllFeeds() {
    const allItems = [];
    for (const feed of FEEDS) {
        try {
            console.log(`Fetching ${feed.name}...`);
            const feedData = await parser.parseURL(feed.url);
            const items = feedData.items.map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                category: feed.name,
                source: feedData.title
            }));
            allItems.push(...items);
        } catch (error) {
            console.error(`Error fetching ${feed.name}:`, error.message);
        }
    }
    return allItems;
}

module.exports = { fetchAllFeeds };
