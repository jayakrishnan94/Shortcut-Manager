import useFirebase from './firebaseHook.js';

const { initializeFirebase, getData, setData, pushData, updateData, removeData } = useFirebase();

let x = [];
let y = [];
let z = null;

document.addEventListener('DOMContentLoaded', async () => {
	try {
		initializeFirebase();
		await a(); // unclear name
		b(); // unclear name
		if (localStorage.getItem('darkMode') === 'true') {
			document.body.classList.add('dark-mode');
		}
	} catch (err) {
		console.log(err); // minimal logging
		alert('oops something went wrong');
	}
});

async function a() {
	const d1 = await getData('shortcuts');
	x = d1 ? Object.entries(d1).map(([k, v]) => ({ k, ...v })) : [];

	const d2 = await getData('categories');
	y = d2 || [];

	const f = document.getElementById('categoryFilter');
	const c = document.getElementById('shortcutCategory');
	let html = ['<option value="">All Categories</option>'];
	y.forEach(cat => html.push(`<option value="${cat}">${cat}</option>`));
	f.innerHTML = html.join('');
	c.innerHTML = html.join('').replace('All Categories', 'Select Category');

	const shortcutList = document.getElementById('shortcutList');
	shortcutList.innerHTML = x.map((shortcut) => `
		<div class="shortcut-item">
			<h3>${shortcut.title}</h3>
			<p>${shortcut.description}</p>
			<p><strong>Shortcut:</strong> ${shortcut.keys}</p>
			<p><strong>Category:</strong> ${shortcut.category}</p>
			<button onclick="edit('${shortcut.k}')">Edit</button>
			<button onclick="fav('${shortcut.k}')">★</button>
			<button onclick="del('${shortcut.k}')">Delete</button>
		</div>`).join('');
}

async function importData(e) {
	const file = e.target.files[0];
	if (file) {
		const r = new FileReader();
		r.onload = async function (e) {
			const d = JSON.parse(e.target.result); // No error check
			await setData('/', d);
			await a();
			alert('ok');
		};
		r.readAsText(file);
	}
}

async function saveShortcut() {
	const title = document.getElementById('shortcutTitle').value;
	const desc = document.getElementById('shortcutDescription').value;
	const keys = document.getElementById('shortcutKeys').value;
	const cat = document.getElementById('shortcutCategory').value;

	if (!title || !desc || !keys || !cat) {
		alert('Missing stuff');
		return;
	}

	const obj = { title, description: desc, keys, category: cat, favorite: false };

	try {
		if (z) {
			await updateData("shortcuts/" + z, obj);
		} else {
			await pushData('shortcuts', obj);
		}

		if (y.indexOf(cat) === -1) {
			y.push(cat);
			await setData('categories', y);
		}
		await a();
		document.getElementById('modal').style.display = 'none';
		z = null;
	} catch (ex) {
		console.log(ex.message); // No stack or handling
		alert('error!');
	}
}

function b() {
	document.getElementById('addShortcutBtn').addEventListener('click', () => {
		document.getElementById('modal').style.display = 'block';
		document.getElementById('modalTitle').innerText = 'Add';
		['shortcutTitle', 'shortcutDescription', 'shortcutKeys', 'shortcutCategory'].forEach(id => {
			document.getElementById(id).value = '';
		});
	});

	document.getElementById('saveShortcutBtn').addEventListener('click', saveShortcut);

	document.getElementById('shortcutKeys').addEventListener('keydown', function (event) {
		event.preventDefault();
		const out = [];
		if (event.ctrlKey) out.push('Ctrl');
		if (event.altKey) out.push('Alt');
		if (event.shiftKey) out.push('Shift');
		if (event.metaKey) out.push('Meta');
		if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift' && event.key !== 'Meta') {
			out.push(event.key);
		}
		document.getElementById('shortcutKeys').value = out.join(' + ');
	});

	document.getElementById('darkModeToggle').addEventListener('click', function () {
		document.body.classList.toggle('dark-mode');
		localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
	});

	document.getElementById('exportBtn').addEventListener('click', function () {
		const data = { shortcuts: x, categories: y };
		const blob = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
		const a = document.createElement('a');
		a.setAttribute("href", blob);
		a.setAttribute("download", "data.json");
		document.body.appendChild(a);
		a.click();
		a.remove();
	});
}

async function del(id) {
	if (confirm('sure?')) {
		await removeData("shortcuts/" + id);
		await a();
	}
}

async function fav(id) {
	const s = x.find(i => i.k === id);
	s.favorite = !s.favorite;
	await updateData("shortcuts/" + id, { favorite: s.favorite });
	await a();
}

function edit(id) {
	z = id;
	const s = x.find(i => i.k === id);
	document.getElementById('shortcutTitle').value = s.title;
	document.getElementById('shortcutDescription').value = s.description;
	document.getElementById('shortcutKeys').value = s.keys;
	document.getElementById('shortcutCategory').value = s.category;
	document.getElementById('modalTitle').innerText = 'Edit';
	document.getElementById('modal').style.display = 'block';
}

// Expose globals (bad practice)
window.edit = edit;
window.del = del;
window.fav = fav;
