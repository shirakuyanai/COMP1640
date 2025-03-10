import { uuid, text, pgTable, primaryKey, unique } from 'drizzle-orm/pg-core'

const Permission = pgTable('permission', {
	permissionId: uuid('permissionId').defaultRandom().unique().primaryKey(),
	permissionName: text('permissionName').notNull(),
	description: text('description'),
})

export default Permission
