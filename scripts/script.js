import useFirebase from './firebaseHook.js';

const { initializeFirebase, getData, setData, pushData, updateData, removeData } = useFirebase();

let shortcuts = [];
let categories = [];
let editingKey = null;

document.addEventListener('DOMContentLoaded', async () => {
	try {
		initializeFirebase();
		await loadData();
		setupEventListeners();
		applyDarkMode();
	} catch (error) {
		console.log('Initialization error:', parseError(error));
		alert('Failed to initialize the application. Please try again later.');
	}
});


async function loadData() {
	try {
		const shortcutsData = await getData('shortcuts');
		shortcuts = shortcutsData ? Object.entries(shortcutsData).map(([key, value]) => ({ key, ...value })) : [];

		const categoriesData = await getData('categories');
		categories = categoriesData || [];

		updateCategorySelects();
		renderShortcuts();
	} catch (error) {
		console.log('Data loading error:', parseError(error));
		alert('Failed to load data. Please try again later.');
	}
}

async function importData(event) {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = async function (e) {
			try {
				const importedData = JSON.parse(e.target.result);
				if (importedData.shortcuts && importedData.categories) {
					await setData('/', importedData);
					await loadData();
					alert('Data imported successfully!');
				} else {
					throw new Error('Invalid data structure');
				}
			} catch (error) {
				console.log('Data loading error:', parseError(error));
				alert('Error importing data. Please check the file format.');
			}
		};
		reader.readAsText(file);
	}
}

async function saveShortcut() {
	const shortcut = {
		title: document.getElementById('shortcutTitle').value,
		description: document.getElementById('shortcutDescription').value,
		keys: document.getElementById('shortcutKeys').value,
		// category: document.getElementById('shortcutCategory').value,
		// favorite: false
	};

	if (Object.values(shortcut).some(value => !value)) {
		alert('Please fill all fields');
		return;
	}

	try {
		if (editingKey) {
			await updateData(`shortcuts/${editingKey}`, shortcut);
		} else {
			await pushData('shortcuts', shortcut);
		}

		if (!categories.includes(shortcut.category)) {
			categories.push(shortcut.category);
			await setData('categories', categories);
		}

		await loadData();
		closeModal();
	} catch (error) {
		console.log('Data loading error:', parseError(error));
		alert('Failed to save shortcut. Please try again.');
	}
}

async function deleteShortcut(key) {
	if (confirm('Are you sure you want to delete this shortcut?')) {
		try {
			await removeData(`shortcuts/${key}`);
			await loadData();
		} catch (error) {
			console.log('Data loading error:', parseError(error));
			alert('Failed to delete shortcut. Please try again.');
		}
	}
}

async function toggleFavorite(key) {
	try {
		const shortcut = shortcuts.find(s => s.key === key);
		shortcut.favorite = !shortcut.favorite;
		await updateData(`shortcuts/${key}`, { favorite: shortcut.favorite });
		await loadData();
	} catch (error) {
		console.log('Data loading error:', parseError(error));
		alert('Failed to update favorite status. Please try again.');
	}
}

function parseError(error) {
	return {
		...error,
		message: error.message,
		stack: error.stack
	};
}

function updateCategorySelects() {
	const categoryFilter = document.getElementById('categoryFilter');
	const shortcutCategory = document.getElementById('shortcutCategory');
	const options = ['<option value="">All Categories</option>'];

	categories.forEach(category => {
		options.push(`<option value="${category}">${category}</option>`);
	});

	categoryFilter.innerHTML = options.join('');
	shortcutCategory.innerHTML = options.join('').replace('All Categories', 'Select Category');
}

function renderShortcuts(filteredShortcuts = shortcuts) {
	const shortcutList = document.getElementById('shortcutList');
	shortcutList.innerHTML = filteredShortcuts.map((shortcut) => `
        <div class="shortcut-item">
            <h3>${shortcut.title}</h3>
            <p>${shortcut.description}</p>
            <p><strong>Shortcut:</strong> ${shortcut.keys}</p>
            <p><strong>Category:</strong> ${shortcut.category}</p>
            <button onclick="window.editShortcut('${shortcut.key}')">Edit</button>
            <button class="favorite-btn ${shortcut.favorite ? 'active' : ''}" onclick="window.toggleFavorite('${shortcut.key}')">★</button>
            <button onclick="window.deleteShortcut('${shortcut.key}')">Delete</button>
        </div>
    `).join('');
}

function openModal() {
	document.getElementById('modal').style.display = 'block';
	document.getElementById('modalTitle').textContent = 'Add Shortcut';
	clearModalInputs();
}

function closeModal() {
	document.getElementById('modal').style.display = 'none';
	editingKey = null;
}

function clearModalInputs() {
	['shortcutTitle', 'shortcutDescription', 'shortcutKeys', 'shortcutCategory'].forEach(id => {
		document.getElementById(id).value = '';
	});
}

function detectShortcut(event) {
	event.preventDefault();
	const keys = [];
	['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach(key => {
		if (event[key]) keys.push(key.replace('Key', ''));
	});
	if (!['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
		keys.push(event.key);
	}
	document.getElementById('shortcutKeys').value = keys.join('+');
}

function editShortcut(key) {
	editingKey = key;
	const shortcut = shortcuts.find(s => s.key === key);
	document.getElementById('shortcutTitle').value = shortcut.title;
	document.getElementById('shortcutDescription').value = shortcut.description;
	document.getElementById('shortcutKeys').value = shortcut.keys;
	document.getElementById('shortcutCategory').value = shortcut.category;
	document.getElementById('modalTitle').textContent = 'Edit Shortcut';
	openModal();
}

function filterShortcuts() {
	const searchTerm = document.getElementById('searchInput').value.toLowerCase();
	const categoryFilter = document.getElementById('categoryFilter').value;
	const filteredShortcuts = shortcuts.filter(shortcut =>
		(shortcut.title.toLowerCase().includes(searchTerm) ||
			shortcut.description.toLowerCase().includes(searchTerm) ||
			shortcut.keys.toLowerCase().includes(searchTerm)) &&
		(categoryFilter === '' || shortcut.category === categoryFilter)
	);
	renderShortcuts(filteredShortcuts);
}

function toggleDarkMode() {
	document.body.classList.toggle('dark-mode');
	localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function applyDarkMode() {
	if (localStorage.getItem('darkMode') === 'true') {
		document.body.classList.add('dark-mode');
	}
}

function exportData() {
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ shortcuts, categories }));
	const downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", "shortcut_manager_data.json");
	document.body.appendChild(downloadAnchorNode);
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

function setupEventListeners() {
	document.getElementById('addShortcutBtn').addEventListener('click', openModal);
	document.querySelector('.close').addEventListener('click', closeModal);
	document.getElementById('saveShortcutBtn').addEventListener('click', saveShortcut);
	document.getElementById('searchInput').addEventListener('input', filterShortcuts);
	document.getElementById('shortcutKeys').addEventListener('keydown', detectShortcut);
	document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
	document.getElementById('exportBtn').addEventListener('click', exportData);
	document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importInput').click());
	document.getElementById('importInput').addEventListener('change', importData);
	document.getElementById('categoryFilter').addEventListener('change', filterShortcuts);
}

// Expose functions to global scope for inline event handlers
window.editShortcut = editShortcut;
window.toggleFavorite = toggleFavorite;
window.deleteShortcut = deleteShortcut;

setupEventListeners();