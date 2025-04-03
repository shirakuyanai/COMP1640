import React from 'react'
import { Link } from 'react-router-dom'

export default function MenuButton({
	children,
	href,
}: {
	children: any
	href: string
}) {
	return (
		<div>
			<Link
				className='flex flex-row items-center gap-4 p-2 hover:bg-pink-50 rounded-md text-gray-500 hover:text-purple-700 h-fit'
				to={href}
			>
				{children}
			</Link>
		</div>
	)
}
