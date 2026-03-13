/**
 * TaskDetailPage - Detailed view of a single task
 *
 * @module pages/TaskDetailPage
 * @description Full task detail view with activity timeline, comments,
 * file attachments, and annotation count. Accessible by all roles
 * with appropriate visibility restrictions.
 *
 * Route: /tasks/:taskId
 */

import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    ArrowLeft,
    Calendar,
    Flag,
    Users,
    Building2,
    Clock,
    Edit2,
    Trash2,
    Paperclip,
    MessageSquare,
    CheckSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTask } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { useAuth } from '@/features/auth/useAuth'
import type { TaskStatus, TaskPriority } from '@/types'
import { TaskStatus as TaskStatusConst, TaskPriority as TaskPriorityConst, UserRole } from '@/types'

const statusLabels: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'Not Started',
    [TaskStatusConst.IN_PROGRESS]: 'In Progress',
    [TaskStatusConst.IN_REVIEW]: 'In Review',
    [TaskStatusConst.COMPLETE]: 'Complete',
    [TaskStatusConst.BLOCKED]: 'Blocked',
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'bg-slate-100 text-slate-700',
    [TaskStatusConst.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TaskStatusConst.IN_REVIEW]: 'bg-yellow-100 text-yellow-700',
    [TaskStatusConst.COMPLETE]: 'bg-green-100 text-green-700',
    [TaskStatusConst.BLOCKED]: 'bg-red-100 text-red-700',
}

const priorityLabels: Record<TaskPriority, string> = {
    [TaskPriorityConst.LOW]: 'Low',
    [TaskPriorityConst.MEDIUM]: 'Medium',
    [TaskPriorityConst.HIGH]: 'High',
    [TaskPriorityConst.URGENT]: 'Urgent',
}

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriorityConst.LOW]: 'bg-slate-100 text-slate-700',
    [TaskPriorityConst.MEDIUM]: 'bg-blue-100 text-blue-700',
    [TaskPriorityConst.HIGH]: 'bg-orange-100 text-orange-700',
    [TaskPriorityConst.URGENT]: 'bg-red-100 text-red-700',
}

export function TaskDetailPage() {
    const { taskId } = useParams<{ taskId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: task, isLoading } = useTask(taskId || null)
    const { data: clients } = useClients()
    const { data: users } = useUsers()

    const [activeTab, setActiveTab] = useState('overview')

    // Get related data
    const client = clients?.find((c) => c.id === task?.clientId)
    const assignees = users?.filter((u) => task?.assignees.includes(u.uid)) || []

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="h-12 w-3/4 bg-slate-200 rounded animate-pulse mb-4" />
                        <div className="h-32 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    // Task not found
    if (!task) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Task Not Found</h1>
                    <p className="text-slate-500 mb-4">The task you are looking for does not exist.</p>
                    <Button onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    const canEdit = user?.role === UserRole.ADMIN ||
        (user?.role === UserRole.EMPLOYEE && task.assignees.includes(user.uid))

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className={statusColors[task.status]}>
                                    {statusLabels[task.status]}
                                </Badge>
                                <Badge className={priorityColors[task.priority]}>
                                    <Flag className="w-3 h-3 mr-1" />
                                    {priorityLabels[task.priority]}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
                        </div>
                        {canEdit && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="files">
                            Files
                            <span className="ml-2 text-xs bg-slate-200 px-1.5 py-0.5 rounded">0</span>
                        </TabsTrigger>
                        <TabsTrigger value="comments">
                            Comments
                            <span className="ml-2 text-xs bg-slate-200 px-1.5 py-0.5 rounded">0</span>
                        </TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
                            <p className="text-slate-700 whitespace-pre-wrap">{task.description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Client */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    Client
                                </div>
                                <p className="font-medium text-slate-900">
                                    {client?.name || 'Unknown Client'}
                                </p>
                            </div>

                            {/* Due Date */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Due Date
                                </div>
                                <p className="font-medium text-slate-900">
                                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            {/* Assignees */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                    <Users className="w-4 h-4" />
                                    Assignees ({assignees.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {assignees.length > 0 ? (
                                        assignees.map((assignee) => (
                                            <div
                                                key={assignee.uid}
                                                className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1"
                                            >
                                                <div className="w-6 h-6 bg-cobalt rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {assignee.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium">{assignee.displayName}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-sm">No assignees</span>
                                    )}
                                </div>
                            </div>

                            {/* Created */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                                    <Clock className="w-4 h-4" />
                                    Created
                                </div>
                                <p className="font-medium text-slate-900">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="files">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                            <Paperclip className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No files yet</h3>
                            <p className="text-slate-500">Files will appear here once uploaded.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="comments">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No comments yet</h3>
                            <p className="text-slate-500">Comments and feedback will appear here.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">Activity Log</h3>
                            <p className="text-slate-500">Task activity will be tracked here.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
