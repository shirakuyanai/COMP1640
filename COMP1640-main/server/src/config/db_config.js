import { drizzle } from 'drizzle-orm/postgres-js'
import { config } from 'dotenv'
config()

import postgres from 'postgres'

const queryClient = postgres(process.env.DB_URL)

export const db = drizzle(queryClient)

export async function connectToDatabase() {
	try {
		await queryClient`SELECT 1`
		console.log('Connected to PostgreSQL')
	} catch (error) {
		console.error('Failed to connect to the database:', error)
	}
}
