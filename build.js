const esbuild = require('esbuild');
const dotenv = require('dotenv');

dotenv.config();

esbuild.build({
	entryPoints: ['scripts/script.js'],
	bundle: true,
	outfile: 'dist/bundle.js',
	define: {
		'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
		'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
		'process.env.FIREBASE_DATABASE_URL': JSON.stringify(process.env.FIREBASE_DATABASE_URL),
		'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID),
		'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
		'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
		'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID),
	},
}).catch(() => process.exit(1));