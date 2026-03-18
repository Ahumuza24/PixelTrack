import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/types'
import {
    useTaskComments,
    useCreateTaskComment,
    useDeleteTaskComment,
} from '@/features/tasks/hooks/useTaskComments'

interface TaskCommentsSectionProps {
    taskId: string
    users: UserProfile[]
    currentUser: UserProfile | null
}

export function TaskCommentsSection({ taskId, users, currentUser }: TaskCommentsSectionProps) {
    const [body, setBody] = useState('')
    const { data: comments, isLoading } = useTaskComments(taskId)
    const createComment = useCreateTaskComment()
    const deleteComment = useDeleteTaskComment()

    const userLookup = useMemo(() => {
        const map = new Map<string, UserProfile>()
        users.forEach((user) => map.set(user.uid, user))
        return map
    }, [users])

    const canComment = Boolean(currentUser)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!body.trim() || !currentUser) return

        await createComment.mutateAsync({
            taskId,
            body: body.trim(),
        })
        setBody('')
    }

    const handleDelete = async (commentId: string) => {
        await deleteComment.mutateAsync({ commentId, taskId })
    }

    const isSubmitting = createComment.isPending

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Feedback & Comments</h3>
                    <p className="text-sm text-slate-500">Capture approvals and discussion directly on the task.</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                    {comments?.length ?? 0} comments
                </Button>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="animate-pulse space-y-2 rounded-xl border border-slate-100 p-4">
                                <div className="h-4 w-32 rounded bg-slate-200" />
                                <div className="h-3 w-48 rounded bg-slate-100" />
                                <div className="h-3 w-full rounded bg-slate-100" />
                            </div>
                        ))}
                    </div>
                ) : comments && comments.length > 0 ? (
                    <div className="space-y-4">
                        {comments.map((comment) => {
                            const author = comment.authorId ? userLookup.get(comment.authorId) : null
                            const canDelete = Boolean(
                                currentUser &&
                                    (currentUser.role === 'admin' || comment.authorId === currentUser.uid)
                            )

                            return (
                                <div key={comment.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {author?.displayName || 'Unknown user'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {canDelete && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-500 hover:text-red-600"
                                                onClick={() => handleDelete(comment.id)}
                                                disabled={deleteComment.isPending}
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                                            </Button>
                                        )}
                                    </div>
                                    <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                        <p className="text-sm text-slate-500">No comments yet. Start the conversation below.</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                    placeholder={canComment ? 'Share an update or request approval…' : 'Sign in to leave a comment'}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    disabled={!canComment || isSubmitting}
                    className="min-h-[96px]"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                        {currentUser ? `Commenting as ${currentUser.displayName}` : 'You must be signed in to comment.'}
                    </span>
                    <Button type="submit" className="bg-cobalt hover:bg-cobalt-600" disabled={!canComment || isSubmitting}>
                        {isSubmitting ? 'Posting…' : 'Post Comment'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
