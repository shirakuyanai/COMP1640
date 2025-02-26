import { uuid, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import User from './User.js'
import Role from './Role.js'

const UserRole = pgTable(
	'user_role',
	{
		userId: uuid('userId')
			.references(() => User.userId)
			.notNull(),
		roleId: uuid('roleId')
			.references(() => Role.roleId)
			.notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.roleId, table.userId] }),
	}),
)

export default UserRole
