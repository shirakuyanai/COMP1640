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
import { redirect, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function LoginForm() {
	const { authToken, setAuthToken } = useGlobalState()
	const [showPassword, setShowPassword] = useState(false)
	const navigate = useNavigate()
	let form = useForm<z.infer<typeof loginInfoSchema>>({
		resolver: zodResolver(loginInfoSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	})

	const onSubmit = async (values: z.infer<typeof loginInfoSchema>) => {
		const response = await LoginAPI({
			unsafeData: values,
			token: authToken,
			setAuthToken,
		})
		if (response.error) {
			alert(response.message)
			setAuthToken()
			localStorage.setItem('auth_token', '')
		} else {
			if (response.message.role === 'staff') {
				navigate('/staff')
			} else {
				navigate('/')
			}
		}
	}

	return (
		<div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='flex flex-col gap-4'
				>
					<FormField
						control={form.control}
						name='username'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input
										{...field}
										className='h-12 w-100'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<div className='relative w-full flex items-center'>
										<Input
											{...field}
											type={!showPassword ? 'password' : 'text'}
											className='h-12 w-100'
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='absolute right-3 text-gray-500 cursor-pointer'
										>
											{showPassword ? 'Hide' : 'Show'}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button className='h-12 cursor-pointer'>Login</Button>
				</form>
			</Form>
		</div>
	)
}

export default LoginForm
