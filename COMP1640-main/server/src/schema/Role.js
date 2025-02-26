import { uuid, text, pgTable, primaryKey } from 'drizzle-orm/pg-core'

const Role = pgTable('role', {
	roleId: uuid('roleId').defaultRandom().primaryKey(),
	roleName: text('roleName').notNull(),
	description: text('description'),
})

export default Role
