import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'
import { join } from 'path'

// Determine the correct .env file based on NODE_ENV or default to development
const envFile =
	process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'

// Load environment variables from the correct .env file
config({ path: join(__dirname, '../../', envFile) })

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/schema',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DB_URL,
	},
})
