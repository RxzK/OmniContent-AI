const express = require('express');
const cors = require('cors');
const { fetchAllFeeds } = require('./scraper');
const { generateContent } = require('./ai-processor');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_PATH = path.join(__dirname, '../data/content.json');

app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2));
}

app.get('/api/news', async (req, res) => {
    try {
        const news = await fetchAllFeeds();
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate', async (req, res) => {
    const { title, category } = req.body;
    try {
        const content = await generateContent(title, category);

        // Save to data file
        const currentData = JSON.parse(fs.readFileSync(DATA_PATH));
        const newItem = {
            id: Date.now(),
            originalTitle: title,
            category,
            ...content,
            date: new Date()
        };
        currentData.unshift(newItem);
        fs.writeFileSync(DATA_PATH, JSON.stringify(currentData, null, 2));

        res.json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/content', (req, res) => {
    const currentData = JSON.parse(fs.readFileSync(DATA_PATH));
    res.json(currentData);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
