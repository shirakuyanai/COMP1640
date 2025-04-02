import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import ClassUpdateForm from '../../_components/forms/ClassUpdateForm'
import { Button } from '@/Components/ui/button'
import { FaPlus, FaMinus, FaSave, FaTrash, FaCheck, FaLock, FaLockOpen } from 'react-icons/fa'
import { toast } from '@/Components/ui/use-toast'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { AddNewClass } from '@/actions/postData'
import { useNavigate } from 'react-router-dom'

type ClassData = {
	id: string
	isLocked: boolean
	isExpanded: boolean
	data: any
}

function AddClass() {
	const { authToken } = useGlobalState()
	const [classes, setClasses] = useState<ClassData[]>([
		{ id: '1', isLocked: false, isExpanded: true, data: null }
	])
	const [isSaving, setIsSaving] = useState(false)
	const navigate = useNavigate()

	const addClass = () => {
		const newId = (classes.length + 1).toString()
		setClasses([...classes, { id: newId, isLocked: false, isExpanded: true, data: null }])
	}

	const removeClass = (id: string) => {
		if (classes.length === 1) {
			toast({
				title: "Cannot remove",
				description: "You must have at least one class.",
				variant: "destructive"
			})
			return
		}
		setClasses(classes.filter(c => c.id !== id))
	}

	const toggleExpand = (id: string) => {
		setClasses(classes.map(c => 
			c.id === id ? { ...c, isExpanded: !c.isExpanded } : c
		))
	}

	const handleFormSubmit = (id: string, data: any) => {
		setClasses(classes.map(c => 
			c.id === id ? { ...c, isLocked: true, data } : c
		))
		toast({
			title: "Class data saved",
			description: "The class data has been temporarily saved. Click 'Save All Classes' to commit to database."
		})
	}

	const unlockForm = (id: string) => {
		setClasses(classes.map(c => 
			c.id === id ? { ...c, isLocked: false } : c
		))
	}

	const saveAllClasses = async () => {
		// Check if all forms are filled and locked
		const unlockedClasses = classes.filter(c => !c.isLocked)
		if (unlockedClasses.length > 0) {
			toast({
				title: "Cannot save",
				description: "Please fill and save all class forms before submitting.",
				variant: "destructive"
			})
			return
		}

		setIsSaving(true)
		try {
			const results = await Promise.allSettled(
				classes.map(async (classItem) => {
					try {
						const response = await AddNewClass(classItem.data, authToken)
						return { success: true, data: response }
					} catch (error) {
						console.error('Error saving class:', error)
						return { 
							success: false, 
							error: error instanceof Error ? error.message : 'Failed to save class'
						}
					}
				})
			)

			const successful = results.filter(r => r.status === 'fulfilled' && r.value.success)
			const failed = results.filter(r => r.status === 'rejected' || !r.value.success)

			if (failed.length > 0) {
				toast({
					title: "Partial Success",
					description: `Successfully saved ${successful.length} classes. ${failed.length} classes failed to save.`,
					variant: "destructive"
				})
			} else {
				toast({
					title: "Success",
					description: "All classes saved successfully"
				})
				navigate('/staff')
			}
		} catch (error) {
			console.error('Error saving classes:', error)
			toast({
				title: "Error",
				description: "Failed to save classes",
				variant: "destructive"
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Add New Classes</h1>
				<div className="flex gap-2">
					<Button 
						onClick={addClass}
						className="gap-2"
					>
						<FaPlus className="h-4 w-4" />
						Add Another Class
					</Button>
					<Button 
						onClick={saveAllClasses}
						className="gap-2"
						disabled={isSaving || classes.some(c => !c.isLocked)}
					>
						<FaSave className="h-4 w-4" />
						Save All Classes
					</Button>
				</div>
			</div>

			<div className="space-y-4">
				{classes.map((classItem) => (
					<Card key={classItem.id} className={`relative transition-all duration-200 ${classItem.isLocked ? 'bg-gray-50' : ''}`}>
						<CardHeader className="flex flex-row items-center justify-between py-3">
							<div className="flex items-center gap-4">
								<Button
									variant="ghost"
									size="sm"
									className="p-0 h-8 w-8"
									onClick={() => toggleExpand(classItem.id)}
								>
									{classItem.isExpanded ? (
										<FaMinus className="h-4 w-4" />
									) : (
										<FaPlus className="h-4 w-4" />
									)}
								</Button>
								<div className="flex items-center gap-2">
									<CardTitle className="text-lg">
										Class #{classItem.id}
									</CardTitle>
									{classItem.isLocked && (
										<FaCheck className="h-4 w-4 text-green-500" />
									)}
									{classItem.data && (
										<span className="text-sm text-gray-500">
											({classItem.data.className || 'Unnamed Class'})
										</span>
									)}
								</div>
							</div>
							<div className="flex gap-2">
								{classItem.isLocked ? (
									<Button
										variant="outline"
										size="sm"
										onClick={() => unlockForm(classItem.id)}
										className="gap-2"
									>
										<FaLockOpen className="h-4 w-4" />
										Unlock
									</Button>
								) : (
									<FaLock className="h-4 w-4 text-gray-400" />
								)}
								<Button
									variant="outline"
									size="sm"
									className="text-red-500 hover:text-red-700"
									onClick={() => removeClass(classItem.id)}
								>
									<FaTrash className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						{classItem.isExpanded && (
							<CardContent>
								<ClassUpdateForm 
									onSubmit={(data) => handleFormSubmit(classItem.id, data)}
									isLocked={classItem.isLocked}
									initialData={classItem.data}
								/>
							</CardContent>
						)}
					</Card>
				))}
			</div>
		</div>
	)
}

export default AddClass
