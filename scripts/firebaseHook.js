import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get, set, push, update, remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

/**
 * Custom hook for Firebase management.
 * @returns {Object} An object containing Firebase-related functions.
 */

function useFirebase() {
	let app;
	let db;

	/**
	 * Initializes Firebase with the provided configuration.
	 * @throws {Error} If initialization fails.
	 */
	function initializeFirebase() {
		try {
			const firebaseConfig = {
				apiKey: "AIzaSyB8vVt9Y2m3-2vbtM_0C75GtyraZJQRVAo",
				authDomain: "shortcut-manager-e9f6f.firebaseapp.com",
				databaseURL: "https://shortcut-manager-e9f6f-default-rtdb.asia-southeast1.firebasedatabase.app",
				projectId: "shortcut-manager-e9f6f",
				storageBucket: "shortcut-manager-e9f6f.appspot.com",
				messagingSenderId: "672812523336",
				appId: "1:672812523336:web:48c7740efd05849d755d7d",
				measurementId: "G-RF3P0NG4XH"
			};

			app = initializeApp(firebaseConfig);
			db = getDatabase(app);
		} catch (error) {
			throw new Error(`Failed to initialize Firebase: ${error.message}`);
		}
	}

	/**
	 * Fetches data from a specified path in the database.
	 * @param {string} path - The database path to fetch from.
	 * @returns {Promise<Object>} The data at the specified path.
	 * @throws {Error} If data fetching fails.
	 */
	async function getData(path) {
		try {
			const snapshot = await get(ref(db, path));
			if (snapshot.exists()) {
				return snapshot.val();
			} else {
				return null;
			}
		} catch (error) {
			throw new Error(`Failed to fetch data from ${path}: ${error.message}`);
		}
	}

	/**
	 * Sets data at a specified path in the database.
	 * @param {string} path - The database path to set data at.
	 * @param {Object} data - The data to set.
	 * @throws {Error} If data setting fails.
	 */
	async function setData(path, data) {
		try {
			await set(ref(db, path), data);
		} catch (error) {
			throw new Error(`Failed to set data at ${path}: ${error.message}`);
		}
	}

	/**
	 * Pushes new data to a specified path in the database.
	 * @param {string} path - The database path to push data to.
	 * @param {Object} data - The data to push.
	 * @returns {string} The key of the newly pushed data.
	 * @throws {Error} If data pushing fails.
	 */
	async function pushData(path, data) {
		console.log('pushData', { path, data, ref, r: ref(db, path) })
		try {
			const newRef = await push(ref(db, path), data);
			console.log('newRef', newRef)
			return newRef.key;
		} catch (error) {
			throw new Error(`Failed to push data to ${path}: ${error.message}`);
		}
	}

	/**
	 * Updates data at a specified path in the database.
	 * @param {string} path - The database path to update data at.
	 * @param {Object} data - The data to update.
	 * @throws {Error} If data updating fails.
	 */
	async function updateData(path, data) {
		console.log('updateData', { path, data })
		try {
			await update(ref(db, path), data);
		} catch (error) {
			throw new Error(`Failed to update data at ${path}: ${error.message}`);
		}
	}

	/**
	 * Removes data at a specified path in the database.
	 * @param {string} path - The database path to remove data from.
	 * @throws {Error} If data removal fails.
	 */
	async function removeData(path) {
		try {
			await remove(ref(db, path));
		} catch (error) {
			throw new Error(`Failed to remove data at ${path}: ${error.message}`);
		}
	}

	return {
		initializeFirebase,
		getData,
		setData,
		pushData,
		updateData,
		removeData
	};
}

export default useFirebase;
