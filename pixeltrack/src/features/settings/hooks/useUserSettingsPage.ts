import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES } from '@/lib/supabase/notificationPreferences'
import type { NotificationChannelId, NotificationChannelPreferenceMap } from '@/types'
import {
    useNotificationPreferencesSettings,
    useProfileSettings,
    useUpdateNotificationPreferences,
    useUpdateProfileSettings,
} from './useUserSettings'

export interface ProfileFormState {
    fullName: string
    email: string
    jobTitle: string
    location: string
    bio: string
}

interface UseUserSettingsPageResult {
    profile: {
        form: ProfileFormState
        initials: string
        photoUrl?: string | null
        error: boolean
        isDisabled: boolean
        isSaving: boolean
        onChange: (field: keyof ProfileFormState, value: string) => void
        onSave: () => Promise<void>
    }
    notifications: {
        preferences: NotificationChannelPreferenceMap
        error: boolean
        isDisabled: boolean
        isSaving: boolean
        onToggle: (id: NotificationChannelId, channel: 'email' | 'push', checked: boolean) => void
        onSave: () => Promise<void>
    }
}

export function useUserSettingsPage(): UseUserSettingsPageResult {
    const {
        data: profileData,
        isLoading: profileLoading,
        isError: profileError,
    } = useProfileSettings()
    const {
        mutateAsync: saveProfile,
        isPending: profileSaving,
    } = useUpdateProfileSettings()

    const {
        data: notificationPreferences,
        isLoading: notificationLoading,
        isError: notificationError,
    } = useNotificationPreferencesSettings()
    const {
        mutateAsync: saveNotificationPreferences,
        isPending: notificationSaving,
    } = useUpdateNotificationPreferences()

    const [profileForm, setProfileForm] = useState<ProfileFormState>({
        fullName: '',
        email: '',
        jobTitle: '',
        location: '',
        bio: '',
    })

    const [channelPreferences, setChannelPreferences] = useState<NotificationChannelPreferenceMap>({
        ...DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES,
    })

    useEffect(() => {
        if (!profileData) return
        queueMicrotask(() => {
            setProfileForm({
                fullName: profileData.displayName ?? '',
                email: profileData.email ?? '',
                jobTitle: profileData.jobTitle ?? '',
                location: profileData.location ?? '',
                bio: profileData.bio ?? '',
            })
        })
    }, [profileData])

    useEffect(() => {
        if (!notificationPreferences) return
        queueMicrotask(() => {
            setChannelPreferences({ ...notificationPreferences.channelPreferences })
        })
    }, [notificationPreferences])

    const initials = useMemo(() => {
        const source = profileForm.fullName || 'User'
        return source
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }, [profileForm.fullName])

    const handleProfileFieldChange = useCallback((field: keyof ProfileFormState, value: string) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }))
    }, [])

    const handleNotificationToggle = useCallback(
        (id: NotificationChannelId, channel: 'email' | 'push', checked: boolean) => {
            setChannelPreferences((prev) => ({
                ...prev,
                [id]: {
                    email: channel === 'email' ? checked : prev[id]?.email ?? false,
                    push: channel === 'push' ? checked : prev[id]?.push ?? false,
                },
            }))
        },
        [],
    )

    const handleProfileSave = useCallback(async () => {
        await saveProfile({
            displayName: profileForm.fullName,
            email: profileForm.email,
            jobTitle: profileForm.jobTitle?.trim() || null,
            location: profileForm.location?.trim() || null,
            bio: profileForm.bio?.trim() || null,
        })
    }, [profileForm, saveProfile])

    const handleNotificationSave = useCallback(async () => {
        await saveNotificationPreferences({
            channelPreferences,
        })
    }, [channelPreferences, saveNotificationPreferences])

    return {
        profile: {
            form: profileForm,
            initials,
            photoUrl: profileData?.photoURL ?? null,
            error: profileError,
            isDisabled: profileLoading || profileSaving,
            isSaving: profileSaving,
            onChange: handleProfileFieldChange,
            onSave: handleProfileSave,
        },
        notifications: {
            preferences: channelPreferences,
            error: notificationError,
            isDisabled: notificationLoading || notificationSaving,
            isSaving: notificationSaving,
            onToggle: handleNotificationToggle,
            onSave: handleNotificationSave,
        },
    }
}
