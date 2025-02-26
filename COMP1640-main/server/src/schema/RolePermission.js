import { uuid, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import Role from './Role.js'
import Permission from './Permission.js'

const RolePermission = pgTable(
	'role_permission',
	{
		roleId: uuid('roleId')
			.references(() => Role.roleId)
			.notNull(),
		permissionId: uuid('permissionId')
			.references(() => Permission.permissionId)
			.notNull(),
	},
	// Define a composite primary key using both columns
	(table) => ({
		pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
	}),
)

export default RolePermission
