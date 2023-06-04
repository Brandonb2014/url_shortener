const express = require('express');
const path = require('path');
const urls = require('./Urls');

const app = express();

const PORT = process.env.PORT || 3000;

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/shortUrls', (req, res) => res.json(urls));

app.get('/:id', (req, res) => {
    const { id } = req.params;

    if (!!id && id === 'easteregg') return res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    const shortenedUrl = urls.find(url => url.id === id);
    
    if (!!shortenedUrl) return res.redirect(shortenedUrl.url);
    return res.sendFile(path.join(__dirname, 'public', '404.html'));
});

app.post('/shorten', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ msg: 'Please provide a URL' });

    try {
        new URL(url);
    } catch (err) {
        return res.status(400).json({ msg: 'Please provide a valid URL' });
    }

    // While it is EXTREMELY unlikely that a duplicate ID would be created,
    // it is still possible so let's make sure it doesn't happen.
    let newId = '';
    let existingId = '';
    do {
        newId = (Math.random() + 1).toString(36).substring(7);
        existingId = urls.find(url => url.id === newId);
    } while (existingId);

    const newShortUrl = {
        id: newId,
        url: url
    };

    urls.push(newShortUrl);

    return res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${newId}`})
});

app.listen(PORT, () => console.log(`Server started on port:${PORT}`));
