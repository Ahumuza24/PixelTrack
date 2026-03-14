import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAllUserProfiles, getUserProfile } from '@/lib/supabase/users'
import { supabase } from '@/lib/supabase/config'
import type { UserProfile, UserRole } from '@/types'

const USERS_QUERY_KEY = 'users'

/**
 * Input type for creating a user.
 */
interface CreateUserInput {
    email: string
    password: string
    displayName: string
    role: UserRole
    clientId?: string | null
}

/**
 * Input type for updating a user.
 */
interface UpdateUserInput {
    uid: string
    displayName?: string
    role?: UserRole
    clientId?: string | null
}

async function invokeAdminFunction<TResponse>(name: string, body: Record<string, unknown>): Promise<TResponse> {
    const { data, error } = await supabase.functions.invoke<TResponse>(name, { body })
    if (error) throw error
    if (!data) {
        throw new Error(`Failed to invoke ${name}`)
    }
    return data
}

/**
 * Fetches all users.
 */
async function getAllUsers(): Promise<UserProfile[]> {
    return getAllUserProfiles()
}

/**
 * Hook to fetch all users.
 * Cached for 5 minutes (staleTime).
 *
 * @example
 * ```ts
 * const { data: users, isLoading } = useUsers()
 * ```
 */
export function useUsers() {
    return useQuery({
        queryKey: [USERS_QUERY_KEY],
        queryFn: getAllUsers,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to fetch a single user by UID.
 *
 * @example
 * ```ts
 * const { data: user } = useUser('user-123')
 * ```
 */
export function useUser(uid: string | null) {
    return useQuery({
        queryKey: [USERS_QUERY_KEY, uid],
        queryFn: () => (uid ? getUserProfile(uid) : null),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Creates a new user via Supabase Auth.
 */
async function createUserViaSupabase(input: CreateUserInput): Promise<UserProfile> {
    const clientId = input.clientId && input.clientId.length > 0 ? input.clientId : null
    return invokeAdminFunction<UserProfile>('create-user', {
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        role: input.role,
        clientId,
    })
}

/**
 * Hook to create a new user.
 * Invalidates users cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: create } = useCreateUser()
 * const newUser = await create({
 *   email: 'john@example.com',
 *   password: 'securePassword123',
 *   displayName: 'John Doe',
 *   role: UserRole.EMPLOYEE,
 * })
 * ```
 */
export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createUserViaSupabase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
            toast.success('User created successfully')
        },
        onError: (error) => {
            toast.error(`Failed to create user: ${error.message}`)
        },
    })
}

/**
 * Updates an existing user.
 */
async function updateUserViaSupabase(input: UpdateUserInput): Promise<void> {
    const clientId = input.clientId && input.clientId.length > 0 ? input.clientId : null
    await invokeAdminFunction('update-user', {
        uid: input.uid,
        displayName: input.displayName,
        role: input.role,
        clientId,
    })
}

/**
 * Hook to update an existing user.
 * Invalidates users cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: update } = useUpdateUser()
 * await update({
 *   uid: 'user-123',
 *   role: UserRole.ADMIN,
 * })
 * ```
 */
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateUserViaSupabase,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
            queryClient.invalidateQueries({
                queryKey: [USERS_QUERY_KEY, variables.uid],
            })
            toast.success('User updated successfully')
        },
        onError: (error) => {
            toast.error(`Failed to update user: ${error.message}`)
        },
    })
}

/**
 * Deletes a user.
 */
async function deleteUserViaSupabase(uid: string): Promise<void> {
    await invokeAdminFunction('delete-user', { uid })
}

/**
 * Hook to delete a user.
 * Invalidates users cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: remove } = useDeleteUser()
 * await remove('user-123')
 * ```
 */
export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteUserViaSupabase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
            toast.success('User deleted successfully')
        },
        onError: (error) => {
            toast.error(`Failed to delete user: ${error.message}`)
        },
    })
}
