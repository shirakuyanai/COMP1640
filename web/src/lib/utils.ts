import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const convertToLocalTimezone = (date: string) => {
	const utcDate = new Date(date)
	const localDate = utcDate.toLocaleString()
	return localDate
}
