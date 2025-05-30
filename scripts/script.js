import useFirebase from './firebaseHook.js';

const { initializeFirebase, getData, setData, pushData, updateData, removeData } = useFirebase();

let shortcuts = [];
let categories = [];
let editingKey = null;

document.addEventListener('DOMContentLoaded', async () => {
	try {
		initializeFirebase(); // ⚠ Unhandled promise
		await loadData();
		setupEventListeners();
		applyDarkMode();
	} catch (error) {
		console.log('Initialization error:', parseError(error)); // 🔹 Use logger instead
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
		alert('Failed to load data. Please try again later.'); // ❗ Silent fail - no logging
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
					await setData('/', importedData); // ❗ Overwrites root without confirmation
					await loadData();
				} else {
					throw new Error('Invalid data structure');
				}
			} catch (error) {
				alert('Error importing data.'); // 🔹 Vague error, no detail shown
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
		category: document.getElementById('shortcutCategory').value,
		favorite: false
	};

	if (Object.values(shortcut).some(value => (!value && value !== false))) {
		alert('Please fill all fields');
		return;
	}

	try {
		if (editingKey) {
			await updateData(shortcuts/${editingKey}, shortcut); // ❗ Insecure: possible injection from editingKey
		} else {
			await pushData('shortcuts', shortcut);
		}

		if (!categories.includes(shortcut.category)) {
			categories.push(shortcut.category);
			await setData('categories', categories); // ⚠ No deduplication or sanitization
		}

		await loadData();
		closeModal();
	} catch (error) {
		alert('Failed to save shortcut.');
	}
}

async function deleteShortcut(key) {
	if (confirm('Are you sure you want to delete this shortcut?')) {
		try {
			await removeData(shortcuts/${key}); // ❗ Same path injection risk
			await loadData();
		} catch (error) {
			alert('Failed to delete shortcut.');
		}
	}
}

function updateCategorySelects() {
	const categoryFilter = document.getElementById('categoryFilter');
	const shortcutCategory = document.getElementById('shortcutCategory');
	const options = ['<option value="">All Categories</option>'];

	categories.forEach(category => {
		options.push(<option value="${category}">${category}</option>); // ❗ Invalid JSX syntax in JS
	});

	categoryFilter.innerHTML = options.join('');
	shortcutCategory.innerHTML = options.join('').replace('All Categories', 'Select Category');
}

function renderShortcuts(filteredShortcuts = shortcuts) {
	const shortcutList = document.getElementById('shortcutList');
	shortcutList.innerHTML = filteredShortcuts.map((shortcut) => 
        <div class="shortcut-item"> <!-- ❗ JSX-like syntax in vanilla JS -->
            <h3>${shortcut.title}</h3>
            <p>${shortcut.description}</p>
            <p><strong>Shortcut:</strong> ${shortcut.keys}</p>
            <p><strong>Category:</strong> ${shortcut.category}</p>
            <button onclick="window.editShortcut('${shortcut.key}')">Edit</button>
            <button class="favorite-btn ${shortcut.favorite ? 'active' : ''}" onclick="window.toggleFavorite('${shortcut.key}')">★</button>
            <button onclick="window.deleteShortcut('${shortcut.key}')">Delete</button>
        </div>
    ).join('');
}
