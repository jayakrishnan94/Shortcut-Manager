let shortcuts = [];
let editingIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
	loadShortcuts();
	setupEventListeners();
});

function setupEventListeners() {
	document.getElementById('addShortcutBtn').addEventListener('click', openModal);
	document.querySelector('.close').addEventListener('click', closeModal);
	document.getElementById('saveShortcutBtn').addEventListener('click', saveShortcut);
	document.getElementById('searchInput').addEventListener('input', filterShortcuts);
	document.getElementById('shortcutKeys').addEventListener('keydown', detectShortcut);
}

function loadShortcuts() {
	fetch('shortcuts.json')
		.then(response => response.json())
		.then(data => {
			shortcuts = data;
			renderShortcuts();
		})
		.catch(error => console.error('Error loading shortcuts:', error));
}

function renderShortcuts() {
	const shortcutList = document.getElementById('shortcutList');
	shortcutList.innerHTML = '';
	shortcuts.forEach((shortcut, index) => {
		const shortcutItem = document.createElement('div');
		shortcutItem.className = 'shortcut-item';
		shortcutItem.innerHTML = `
            <h3>${shortcut.title}</h3>
            <p>${shortcut.description}</p>
            <p><strong>Shortcut:</strong> ${shortcut.keys}</p>
            <button onclick="editShortcut(${index})">Edit</button>
        `;
		shortcutList.appendChild(shortcutItem);
	});
}

function openModal() {
	document.getElementById('modal').style.display = 'block';
	document.getElementById('modalTitle').textContent = 'Add Shortcut';
	clearModalInputs();
}

function closeModal() {
	document.getElementById('modal').style.display = 'none';
	editingIndex = -1;
}

function clearModalInputs() {
	document.getElementById('shortcutTitle').value = '';
	document.getElementById('shortcutDescription').value = '';
	document.getElementById('shortcutKeys').value = '';
}

function detectShortcut(event) {
	event.preventDefault();
	const keys = [];
	if (event.ctrlKey) keys.push('Ctrl');
	if (event.altKey) keys.push('Alt');
	if (event.shiftKey) keys.push('Shift');
	if (event.metaKey) keys.push('Meta');
	if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift' && event.key !== 'Meta') {
		keys.push(event.key);
	}
	document.getElementById('shortcutKeys').value = keys.join('+');
}

function saveShortcut() {
	const title = document.getElementById('shortcutTitle').value;
	const description = document.getElementById('shortcutDescription').value;
	const keys = document.getElementById('shortcutKeys').value;

	if (!title || !description || !keys) {
		alert('Please fill all fields');
		return;
	}

	const shortcut = { title, description, keys };

	if (editingIndex === -1) {
		shortcuts.push(shortcut);
	} else {
		shortcuts[editingIndex] = shortcut;
	}

	saveShortcutsToFile();
	renderShortcuts();
	closeModal();
}

function editShortcut(index) {
	editingIndex = index;
	const shortcut = shortcuts[index];
	document.getElementById('shortcutTitle').value = shortcut.title;
	document.getElementById('shortcutDescription').value = shortcut.description;
	document.getElementById('shortcutKeys').value = shortcut.keys;
	document.getElementById('modalTitle').textContent = 'Edit Shortcut';
	openModal();
}

function filterShortcuts() {
	const searchTerm = document.getElementById('searchInput').value.toLowerCase();
	const filteredShortcuts = shortcuts.filter(shortcut =>
		shortcut.title.toLowerCase().includes(searchTerm) ||
		shortcut.description.toLowerCase().includes(searchTerm) ||
		shortcut.keys.toLowerCase().includes(searchTerm)
	);
	renderFilteredShortcuts(filteredShortcuts);
}

function renderFilteredShortcuts(filteredShortcuts) {
	const shortcutList = document.getElementById('shortcutList');
	shortcutList.innerHTML = '';
	filteredShortcuts.forEach((shortcut, index) => {
		const shortcutItem = document.createElement('div');
		shortcutItem.className = 'shortcut-item';
		shortcutItem.innerHTML = `
            <h3>${shortcut.title}</h3>
            <p>${shortcut.description}</p>
            <p><strong>Shortcut:</strong> ${shortcut.keys}</p>
            <button onclick="editShortcut(${shortcuts.indexOf(shortcut)})">Edit</button>
        `;
		shortcutList.appendChild(shortcutItem);
	});
}

function saveShortcutsToFile() {
	fetch('/save-shortcuts', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(shortcuts),
	})
		.then(response => response.json())
		.then(data => console.log('Shortcuts saved successfully:', data))
		.catch((error) => console.error('Error saving shortcuts:', error));
}