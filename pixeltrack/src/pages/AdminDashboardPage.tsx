import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Users, FileText, Plus, Loader2, CheckCircle, Building2, AlertCircle, ArrowRight, Search, Bell, MessageSquare, Upload, List, Eye, Folder } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TaskStatus, UserRole } from '@/types'

export function AdminDashboardPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: tasks, isLoading: tasksLoading } = useTasks()
    const { data: clients } = useClients()
    const { data: users } = useUsers()

    // Stats calculation
    const totalTasks = tasks?.length || 0
    const inProgressTasks = tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length || 0
    const overdueTasks = tasks?.filter((t) => {
        const due = new Date(t.dueDate)
        return due < new Date() && t.status !== TaskStatus.COMPLETE
    }).length || 0

    const totalClients = clients?.length || 0
    const totalEmployees = users?.filter((u) => u.role === UserRole.EMPLOYEE).length || 0
    const activeProjects = tasks?.slice(0, 3) || []

    const todoTasks = tasks?.filter((t) => t.status === TaskStatus.NOT_STARTED) || []
    const inProgressTasksList = tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS) || []
    const reviewTasksList = tasks?.filter((t) => t.status === TaskStatus.IN_REVIEW) || []

    const activities = [
        { icon: MessageSquare, bg: 'bg-[#0048ad]/10', color: 'text-[#0048ad]', user: 'Sarah Chen', action: 'commented on', target: 'Logo Concept V2', time: '2 hours ago', preview: '"The colors are much better now..."' },
        { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600', user: 'Jordan Smith', action: 'completed', target: 'API Documentation', time: '5 hours ago' },
        { icon: Upload, bg: 'bg-slate-100', color: 'text-slate-500', user: user?.displayName || 'Admin', action: 'uploaded', target: 'Brand_Guide_Final.pdf', time: 'Yesterday' },
    ]

    const quickActions = [
        { icon: Plus, label: 'New Task', href: '/admin/tasks', color: 'bg-[#0048ad]' },
        { icon: Building2, label: 'Add Client', href: '/admin/clients', color: 'bg-emerald-600' },
        { icon: Users, label: 'Add Team Member', href: '/admin/users', color: 'bg-violet-600' },
    ]

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f5f7f8]">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search projects, tasks, or files..."
                            className="w-full bg-slate-100 border-none pl-10 focus:ring-2 focus:ring-[#0048ad]/50"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
                        <Bell className="w-5 h-5" />
                        {overdueTasks > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                {overdueTasks}
                            </span>
                        )}
                    </button>
                    <Button className="bg-[#0048ad] text-white hover:bg-[#003d8f]" onClick={() => navigate('/admin/tasks')}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </div>
            </header>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Welcome Section */}
                    <section>
                        <h2 className="text-3xl font-black tracking-tight">Agency Dashboard</h2>
                        <p className="text-slate-500 mt-1">
                            Welcome back, {user?.displayName?.split(' ')[0] || 'Admin'}. Here's what's happening today.
                        </p>
                    </section>

                    {/* Stats Cards */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Tasks</p>
                                        <p className="text-2xl font-bold">{totalTasks}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-[#0048ad]/10 rounded-lg flex items-center justify-center">
                                        <CheckSquare className="w-5 h-5 text-[#0048ad]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">In Progress</p>
                                        <p className="text-2xl font-bold">{inProgressTasks}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Clients</p>
                                        <p className="text-2xl font-bold">{totalClients}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Team Members</p>
                                        <p className="text-2xl font-bold">{totalEmployees}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-violet-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {quickActions.map((action) => (
                                <Button
                                    key={action.label}
                                    onClick={() => navigate(action.href)}
                                    className={`${action.color} text-white hover:opacity-90`}
                                >
                                    <action.icon className="w-4 h-4 mr-2" />
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </section>

                    {/* Overdue Tasks Alert */}
                    {overdueTasks > 0 && (
                        <section>
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-red-900">{overdueTasks} Overdue Task{overdueTasks > 1 ? 's' : ''}</p>
                                        <p className="text-sm text-red-700">Some tasks need immediate attention</p>
                                    </div>
                                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => navigate('/admin/tasks')}>
                                        View Tasks
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    {/* Active Projects */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Active Projects</h3>
                            <button onClick={() => navigate('/admin/tasks')} className="text-[#0048ad] text-sm font-semibold hover:underline">
                                View all
                            </button>
                        </div>

                        {tasksLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : activeProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeProjects.map((task) => {
                                    const iconStyles = [
                                        { bg: 'bg-indigo-100', color: 'text-indigo-600' },
                                        { bg: 'bg-emerald-100', color: 'text-emerald-600' },
                                        { bg: 'bg-sky-100', color: 'text-sky-600' },
                                    ]
                                    const iconStyle = iconStyles[task.title.length % 3]
                                    const progress = Math.floor(Math.random() * 40) + 60
                                    const isOnTrack = progress > 60

                                    return (
                                        <div
                                            key={task.id}
                                            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0048ad]/50 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`h-12 w-12 rounded-lg ${iconStyle.bg} flex items-center justify-center ${iconStyle.color}`}>
                                                    <Folder className="w-6 h-6" />
                                                </div>
                                                <Badge className={isOnTrack ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-amber-500'} mr-1`} />
                                                    {isOnTrack ? 'On Track' : 'At Risk'}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-lg mb-1 group-hover:text-[#0048ad] transition-colors">{task.title}</h4>
                                            <p className="text-sm text-slate-500 mb-6">
                                                Client: {clients?.find((c) => c.id === task.clientId)?.name || 'Unknown'}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span>Progress</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#0048ad] rounded-full" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <Card className="bg-white">
                                <CardContent className="p-8 text-center">
                                    <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No active projects</h3>
                                    <p className="text-slate-500 mb-4">Create your first task to get started</p>
                                    <Button onClick={() => navigate('/admin/tasks')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Task
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </section>

                    {/* Task Overview & Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Task Overview */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-bold">Task Overview</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* To Do Column */}
                                <div className="bg-slate-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <List className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">To Do</span>
                                        <Badge variant="secondary" className="ml-auto">{todoTasks.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {todoTasks.slice(0, 3).map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <p className="text-sm font-medium truncate">{task.title}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                        {todoTasks.length === 0 && <p className="text-sm text-slate-400 italic">No tasks</p>}
                                    </div>
                                </div>

                                {/* In Progress Column */}
                                <div className="bg-slate-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Loader2 className="w-5 h-5 text-[#0048ad]" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">In Progress</span>
                                        <Badge variant="secondary" className="ml-auto">{inProgressTasksList.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {inProgressTasksList.slice(0, 3).map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-l-[#0048ad] cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <p className="text-sm font-medium truncate">{task.title}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="h-5 w-5 rounded-full bg-[#0048ad]/20 flex items-center justify-center text-[10px] text-[#0048ad] font-medium">
                                                        {task.assignees?.[0]?.charAt(0) || 'A'}
                                                    </div>
                                                    <span className="text-xs text-slate-400 italic">In progress</span>
                                                </div>
                                            </div>
                                        ))}
                                        {inProgressTasksList.length === 0 && <p className="text-sm text-slate-400 italic">No tasks</p>}
                                    </div>
                                </div>

                                {/* Review Column */}
                                <div className="bg-slate-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Eye className="w-5 h-5 text-indigo-500" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Review</span>
                                        <Badge variant="secondary" className="ml-auto">{reviewTasksList.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {reviewTasksList.slice(0, 3).map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <p className="text-sm font-medium truncate">{task.title}</p>
                                                <p className="text-xs text-indigo-500 mt-1 font-bold">Needs Approval</p>
                                            </div>
                                        ))}
                                        {reviewTasksList.length === 0 && <p className="text-sm text-slate-400 italic">No tasks</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold">Recent Activity</h3>
                            <Card className="border border-slate-200 overflow-hidden">
                                <CardContent className="p-5 space-y-6">
                                    {activities.map((activity, index) => (
                                        <div key={index} className={`flex gap-4 ${index > 0 ? 'border-t border-slate-100 pt-6' : ''}`}>
                                            <div className="flex-shrink-0">
                                                <div className={`h-10 w-10 rounded-full ${activity.bg} flex items-center justify-center ${activity.color}`}>
                                                    <activity.icon className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-bold">{activity.user}</span>{' '}
                                                    {activity.action}{' '}
                                                    <span className="text-[#0048ad] font-medium">{activity.target}</span>
                                                </p>
                                                {activity.preview && (
                                                    <p className="text-xs text-slate-500 mt-1 italic">{activity.preview}</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-2">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <button className="w-full py-3 text-sm font-semibold bg-slate-50 border-t border-slate-200 hover:bg-slate-100 transition-colors">
                                    View All Activity
                                </button>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
     
    )
}
