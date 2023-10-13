const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, function () {
    console.log(`Server listening on port ${PORT}`);
});