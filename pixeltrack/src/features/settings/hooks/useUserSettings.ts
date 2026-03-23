import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/useAuth'
import { getUserProfile, updateUserProfile } from '@/lib/supabase/users'
import {
    getNotificationPreferences,
    upsertNotificationPreferences,
    type NotificationPreferencesUpdate,
} from '@/lib/supabase/notificationPreferences'
import type { NotificationPreferences, NotificationChannelPreferenceMap, UserProfile } from '@/types'

const PROFILE_SETTINGS_QUERY_KEY = ['user', 'profile-settings'] as const
const NOTIFICATION_PREFS_QUERY_KEY = ['user', 'notification-preferences'] as const

export function useProfileSettings() {
    const { user } = useAuth()

    return useQuery<UserProfile | null>({
        queryKey: [...PROFILE_SETTINGS_QUERY_KEY, user?.uid],
        queryFn: () => (user?.uid ? getUserProfile(user.uid) : null),
        enabled: !!user?.uid,
        staleTime: 1000 * 60 * 5,
    })
}

export interface ProfileSettingsInput {
    displayName: string
    email: string
    jobTitle?: string | null
    location?: string | null
    bio?: string | null
}

export function useUpdateProfileSettings() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: async (input: ProfileSettingsInput) => {
            if (!user?.uid) {
                throw new Error('You must be signed in to update your profile.')
            }

            await updateUserProfile(user.uid, input)
        },
        onSuccess: async () => {
            if (user?.uid) {
                await queryClient.invalidateQueries({ queryKey: [...PROFILE_SETTINGS_QUERY_KEY, user.uid] })
            }
            toast.success('Profile saved successfully')
        },
        onError: (error: Error) => {
            toast.error(`Failed to save profile: ${error.message}`)
        },
    })
}

export function useNotificationPreferencesSettings() {
    const { user } = useAuth()

    return useQuery<NotificationPreferences>({
        queryKey: [...NOTIFICATION_PREFS_QUERY_KEY, user?.uid],
        queryFn: async () => {
            if (!user?.uid) {
                throw new Error('You must be signed in to load notification preferences.')
            }
            return getNotificationPreferences(user.uid)
        },
        enabled: !!user?.uid,
        staleTime: 1000 * 60 * 5,
        retry: false, // Don't retry on failure - defaults are returned
    })
}

export interface NotificationPreferencesInput extends NotificationPreferencesUpdate {
    channelPreferences: NotificationChannelPreferenceMap
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    return useMutation({
        mutationFn: async (input: NotificationPreferencesInput) => {
            if (!user?.uid) {
                throw new Error('You must be signed in to update notification preferences.')
            }

            await upsertNotificationPreferences(user.uid, input)
        },
        onSuccess: async () => {
            if (user?.uid) {
                await queryClient.invalidateQueries({ queryKey: [...NOTIFICATION_PREFS_QUERY_KEY, user.uid] })
            }
            toast.success('Notification preferences saved')
        },
        onError: (error: Error) => {
            toast.error(`Failed to update notification preferences: ${error.message}`)
        },
    })
}
