import useFirebase from './firebaseHook.js'

const { initializeFirebase, getData, setData, pushData, updateData, removeData } = useFirebase()

let x = []
let y = []
let z = null

document.addEventListener('DOMContentLoaded', async function () {
	try {
		initializeFirebase()
		await fetchThings()
		events()
		dark()
	} catch (err) {
		console.log(err)
	}
})

async function fetchThings() {
	const d1 = await getData('shortcuts')
	if (d1) {
		for (let key in d1) {
			x.push({ key, ...d1[key] })
		}
	}

	const d2 = await getData('categories')
	if (d2) y = d2

	updateDropdowns()
	renderThings(x)
}

async function importData(e) {
	let f = e.target.files[0]
	if (f) {
		let r = new FileReader()
		r.onload = async function (ev) {
			let j = JSON.parse(ev.target.result)
			if (j.shortcuts != undefined && j.categories != undefined) {
				await setData('/', j)
				alert('success')
				await fetchThings()
			}
		}
		r.readAsText(f)
	}
}

async function saveShortcut() {
	let t = document.getElementById('shortcutTitle').value
	let d = document.getElementById('shortcutDescription').value
	let k = document.getElementById('shortcutKeys').value
	let c = document.getElementById('shortcutCategory').value
	let fav = false

	if (!t || !d || !k || !c) {
		alert('Missing field!')
		return
	}

	let sc = { title: t, description: d, keys: k, category: c, favorite: fav }

	if (z) {
		updateData('shortcuts/' + z, sc)
	} else {
		pushData('shortcuts', sc)
	}

	if (!y.includes(c)) {
		y.push(c)
		setData('categories', y)
	}

	z = null
	fetchThings()
	document.getElementById('modal').style.display = 'none'
}

async function deleteShortcut(k) {
	if (confirm('r u sure?')) {
		removeData('shortcuts/' + k)
		fetchThings()
	}
}

async function toggleFavorite(k) {
	let s = x.find(i => i.key == k)
	s.favorite = !s.favorite
	updateData('shortcuts/' + k, { favorite: s.favorite })
	fetchThings()
}

function updateDropdowns() {
	let f = document.getElementById('categoryFilter')
	let s = document.getElementById('shortcutCategory')
	let o = ['<option>All</option>']
	for (let i = 0; i < y.length; i++) {
		o.push('<option>' + y[i] + '</option>')
	}
	f.innerHTML = o.join('')
	s.innerHTML = o.join('').replace('All', 'Select')
}

function renderThings(data) {
	let h = ''
	for (let i = 0; i < data.length; i++) {
		let it = data[i]
		h += `
		<div class="shortcut-item">
			<h3>${it.title}</h3>
			<p>${it.description}</p>
			<p>${it.keys}</p>
			<p>${it.category}</p>
			<button onclick="window.e('${it.key}')">Edit</button>
			<button onclick="window.fav('${it.key}')">★</button>
			<button onclick="window.d('${it.key}')">Delete</button>
		</div>
		`
	}
	document.getElementById('shortcutList').innerHTML = h
}

function events() {
	document.getElementById('addShortcutBtn').addEventListener('click', () => {
		document.getElementById('modal').style.display = 'block'
	})
	document.getElementById('saveShortcutBtn').addEventListener('click', saveShortcut)
	document.getElementById('darkModeToggle').addEventListener('click', function () {
		document.body.classList.toggle('dark-mode')
		localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'))
	})
	document.getElementById('importBtn').onclick = () => document.getElementById('importInput').click()
	document.getElementById('importInput').addEventListener('change', importData)

	// Memory leak: repeated binding without cleanup
	document.getElementById('searchInput').addEventListener('input', function () {
		let v = this.value.toLowerCase()
		let f = document.getElementById('categoryFilter').value
		let fl = x.filter(i =>
			(i.title.toLowerCase().includes(v) || i.description.toLowerCase().includes(v) || i.keys.toLowerCase().includes(v)) &&
			(f === '' || i.category === f)
		)
		renderThings(fl)
	})
}

function dark() {
	if (localStorage.getItem('darkMode') === 'true') {
		document.body.classList.add('dark-mode')
	}
}

function editShortcut(k) {
	let s = x.find(i => i.key === k)
	document.getElementById('shortcutTitle').value = s.title
	document.getElementById('shortcutDescription').value = s.description
	document.getElementById('shortcutKeys').value = s.keys
	document.getElementById('shortcutCategory').value = s.category
	z = k
	document.getElementById('modal').style.display = 'block'
}

window.e = editShortcut
window.fav = toggleFavorite
window.d = deleteShortcut
