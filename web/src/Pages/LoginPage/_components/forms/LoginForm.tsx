import { LoginAPI } from '@/actions/postData'
import { Button } from '@/Components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/Components/ui/form'
import { Input } from '@/Components/ui/input'
import { loginInfoSchema } from '@/schemas/login'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function LoginForm() {
	const { setAuthToken } = useGlobalState()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const form = useForm<z.infer<typeof loginInfoSchema>>({
		resolver: zodResolver(loginInfoSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	})

	const onSubmit = async (values: z.infer<typeof loginInfoSchema>) => {
		try {
			setIsLoading(true)
			setError('')

			const response = await LoginAPI({
				unsafeData: values,
				token: '',
				setAuthToken,
			})

			if (response.error) {
				setError(typeof response.message === 'string' ? response.message : 'Login failed. Please try again.')
				setAuthToken('')
				localStorage.removeItem('auth_token')
			} else {
				// Successful login
				if (response.message.role === 'staff') {
					navigate('/staff')
				} else if (response.message.id) {
					navigate(`/dashboard/${response.message.id}`)
				} else {
					setError('Login successful, but user ID is missing. Please contact support.')
				}
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.')
			console.error('Login error:', err)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full max-w-md">
			{error && (
				<div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
					{error}
				</div>
			)}
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input
										{...field}
										disabled={isLoading}
										placeholder="Enter your username"
										className="h-12"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											{...field}
											type={showPassword ? 'text' : 'password'}
											disabled={isLoading}
											placeholder="Enter your password"
											className="h-12 pr-20"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
										>
											{showPassword ? 'Hide' : 'Show'}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="h-12 bg-gradient-to-r from-purple-500 to-blue-700 text-white font-medium"
						disabled={isLoading}
					>
						{isLoading ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</Form>
		</div>
	)
}

export default LoginForm
