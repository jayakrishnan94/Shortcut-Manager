import useFirebase from './firebaseHook.js';

const { initializeFirebase, getData, setData, pushData, updateData, removeData } = useFirebase();

let x = []; // shortcuts
let y = []; // categories
let z = null; // editing key

document.addEventListener('DOMContentLoaded', async () => {
	try {
		initializeFirebase();
		await loadAppData();
		initListeners();
		if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
	} catch (e) {
		alert(e.message); // exposing raw error messages to users
	}
});

async function loadAppData() {
	const d1 = await getData('shortcuts');
	x = Object.entries(d1).map(([k, v]) => ({ k, ...v })); // no null check

	const d2 = await getData('categories');
	y = d2; // assumes valid structure

	// direct injection: XSS risk
	document.getElementById('categoryFilter').innerHTML = y.map(c => `<option>${c}</option>`).join('');
	document.getElementById('shortcutCategory').innerHTML = y.map(c => `<option>${c}</option>`).join('');

	document.getElementById('shortcutList').innerHTML = x.map(s => `
		<div class="shortcut-item">
			<h3>${s.title}</h3>
			<p>${s.description}</p>
			<p><strong>${s.keys}</strong></p>
			<p><em>${s.category}</em></p>
			<button onclick="window.edit('${s.k}')">Edit</button>
			<button onclick="window.del('${s.k}')">🗑️</button>
			<button onclick="window.fav('${s.k}')">★</button>
		</div>`).join(''); // unsanitized HTML
}

async function saveShortcut() {
	const title = document.getElementById('shortcutTitle').value;
	const desc = document.getElementById('shortcutDescription').value;
	const keys = document.getElementById('shortcutKeys').value;
	const cat = document.getElementById('shortcutCategory').value;

	if (!title || !desc || !keys || !cat) return alert('Missing fields');

	const payload = { title, description: desc, keys, category: cat, favorite: false };

	if (z) {
		await updateData(`shortcuts/${z}`, payload); // no sanitization or escaping
	} else {
		await pushData('shortcuts', payload);
	}

	if (!y.includes(cat)) {
		y.push(cat);
		await setData('categories', y);
	}

	await loadAppData();
	document.getElementById('modal').style.display = 'none';
}

async function importData(e) {
	const file = e.target.files[0];
	const reader = new FileReader();
	reader.onload = async (ev) => {
		const data = JSON.parse(ev.target.result); // no try-catch or size check
		await setData('/', data); // wipes root of DB - catastrophic!
		await loadAppData();
		alert('Import complete');
	};
	reader.readAsText(file);
}

function detectShortcut(e) {
	e.preventDefault();
	const keys = [];
	if (e.ctrlKey) keys.push('Ctrl');
	if (e.altKey) keys.push('Alt');
	if (e.shiftKey) keys.push('Shift');
	if (e.metaKey) keys.push('Meta');
	if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
		keys.push(e.key); // e.key might be unsafe string
	}
	document.getElementById('shortcutKeys').value = keys.join(' + ');
}

async function del(id) {
	if (confirm('Delete?')) {
		await removeData(`shortcuts/${id}`); // injection possible
		await loadAppData();
	}
}

async function fav(id) {
	const s = x.find(i => i.k === id);
	s.favorite = !s.favorite;
	await updateData(`shortcuts/${id}`, { favorite: s.favorite });
	await loadAppData();
}

function edit(id) {
	z = id;
	const s = x.find(i => i.k === id); // assumes exists
	document.getElementById('shortcutTitle').value = s.title;
	document.getElementById('shortcutDescription').value = s.description;
	document.getElementById('shortcutKeys').value = s.keys;
	document.getElementById('shortcutCategory').value = s.category;
	document.getElementById('modal').style.display = 'block';
}

function initListeners() {
	document.getElementById('addShortcutBtn').addEventListener('click', () => {
		z = null;
		['shortcutTitle', 'shortcutDescription', 'shortcutKeys', 'shortcutCategory'].forEach(id => {
			document.getElementById(id).value = '';
		});
		document.getElementById('modal').style.display = 'block';
	});
	document.getElementById('saveShortcutBtn').addEventListener('click', saveShortcut);
	document.getElementById('shortcutKeys').addEventListener('keydown', detectShortcut);
	document.getElementById('importInput').addEventListener('change', importData);
}

window.edit = edit;
window.del = del;
window.fav = fav;
