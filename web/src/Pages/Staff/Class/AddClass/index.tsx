import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import ClassUpdateForm from '../../_components/forms/ClassUpdateForm'
import { Button } from '@/Components/ui/button'
import { FaPlus, FaMinus, FaSave, FaTrash, FaCheck, FaLock, FaLockOpen } from 'react-icons/fa'
import { toast } from '@/Components/ui/use-toast'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { AddNewClass } from '@/actions/postData'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

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
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div>
							<h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
								Add New Classes
							</h1>
							<p className="text-gray-600 mt-1">Create multiple class assignments at once</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
							<Button 
								onClick={addClass}
								className="gap-2 bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
								variant="outline"
							>
								<FaPlus className="h-4 w-4" />
								Add Class
							</Button>
							<Button 
								onClick={saveAllClasses}
								className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-md"
								disabled={isSaving || classes.some(c => !c.isLocked)}
							>
								{isSaving ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Saving...
									</>
								) : (
									<>
										<FaSave className="h-4 w-4" />
										Save All Classes
									</>
								)}
							</Button>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					{classes.map((classItem, index) => (
						<Card 
							key={classItem.id} 
							className={`relative transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md border ${classItem.isLocked ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}
						>
							<div className={`h-1 absolute top-0 left-0 right-0 ${classItem.isLocked ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-purple-500 to-indigo-600'}`} />
							<CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
								<div className="flex items-center gap-4">
									<Button
										variant="ghost"
										size="sm"
										className="p-0 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200"
										onClick={() => toggleExpand(classItem.id)}
									>
										{classItem.isExpanded ? (
											<FaMinus className="h-3 w-3" />
										) : (
											<FaPlus className="h-3 w-3" />
										)}
									</Button>
									<div className="flex items-center gap-2">
										<CardTitle className="text-lg font-semibold">
											Class #{index + 1}
										</CardTitle>
										{classItem.isLocked && (
											<div className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
												<FaCheck className="h-3 w-3 mr-1" />
												Complete
											</div>
										)}
										{classItem.data && classItem.data.className && (
											<span className="text-sm text-gray-600 ml-2">
												{classItem.data.className}
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
											className="gap-1 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
										>
											<FaLockOpen className="h-3 w-3" />
											Edit
										</Button>
									) : (
										<span className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
											<FaLock className="h-3 w-3 mr-1" />
											Unsaved
										</span>
									)}
									<Button
										variant="outline"
										size="sm"
										className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
										onClick={() => removeClass(classItem.id)}
									>
										<FaTrash className="h-3 w-3" />
									</Button>
								</div>
							</CardHeader>
							{classItem.isExpanded && (
								<CardContent className="pt-4">
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

				{classes.length > 1 && (
					<div className="flex justify-center mt-4">
						<div className="bg-purple-50 text-purple-800 rounded-lg p-3 text-sm border border-purple-200 max-w-lg text-center">
							<p>
								Remember to save each class individually by clicking the "Save Class" button, then click "Save All Classes" to commit all changes.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default AddClass
