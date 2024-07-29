const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 8080;

app.use(express.static('.'));
app.use(express.json());

app.post('/save-shortcuts', (req, res) => {
	const shortcuts = req.body;
	fs.writeFile('shortcuts.json', JSON.stringify(shortcuts, null, 2), (err) => {
		if (err) {
			res.status(500).json({ error: 'Error saving shortcuts' });
		} else {
			res.json({ message: 'Shortcuts saved successfully' });
		}
	});
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});