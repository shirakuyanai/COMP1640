import { Outlet } from 'react-router-dom'

function Layout() {
	return (
		<div className='bg-accent/5 min-h-screen'>
			<div className='container py-6'>
				<Outlet />
			</div>
		</div>
	)
}

export default Layout
