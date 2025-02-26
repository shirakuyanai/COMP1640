import { uuid, text, pgTable, primaryKey } from 'drizzle-orm/pg-core'

const Permission = pgTable('permission', {
	permissionId: uuid('permissionId').defaultRandom().primaryKey(),
	permissionName: text('permissionName').notNull(),
	description: text('description'),
})

export default Permission
