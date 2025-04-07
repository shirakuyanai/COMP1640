import { uuid, text, pgTable } from 'drizzle-orm/pg-core'

const Role = pgTable('role', {
	roleId: uuid('roleId').defaultRandom().unique().primaryKey(),
	roleName: text('roleName').notNull(),
	description: text('description'),
})

export default Role
