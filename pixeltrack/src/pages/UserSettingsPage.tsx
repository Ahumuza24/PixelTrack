import { useEffect, useMemo, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES } from '@/lib/supabase/notificationPreferences'
import {
    useNotificationPreferencesSettings,
    useProfileSettings,
    useUpdateNotificationPreferences,
    useUpdateProfileSettings,
} from '@/features/settings/hooks/useUserSettings'
import type { NotificationChannelId, NotificationChannelPreferenceMap } from '@/types'

interface NotificationPreference {
    id: string
    label: string
    description: string
}

const notificationOptions: NotificationPreference[] = [
    {
        id: 'mentions',
        label: 'Mentions & Replies',
        description: 'Receive alerts when teammates mention you or reply to your comments.',
    },
    {
        id: 'projects',
        label: 'Project Updates',
        description: 'Get notified when briefs change, milestones shift, or files are delivered.',
    },
    {
        id: 'summaries',
        label: 'Weekly Summaries',
        description: 'Digest of activity, blockers, and approvals sent every Monday morning.',
    },
]

export function UserSettingsPage() {
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

    const [profileForm, setProfileForm] = useState({
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
        if (profileData) {
            setProfileForm({
                fullName: profileData.displayName ?? '',
                email: profileData.email ?? '',
                jobTitle: profileData.jobTitle ?? '',
                location: profileData.location ?? '',
                bio: profileData.bio ?? '',
            })
        }
    }, [profileData])

    useEffect(() => {
        if (notificationPreferences) {
            setChannelPreferences({ ...notificationPreferences.channelPreferences })
        }
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

    const handleNotificationToggle = (id: NotificationChannelId, channel: 'email' | 'push') => (checked: boolean) => {
        setChannelPreferences((prev) => ({
            ...prev,
            [id]: {
                email: channel === 'email' ? checked : prev[id]?.email ?? false,
                push: channel === 'push' ? checked : prev[id]?.push ?? false,
            },
        }))
    }

    const handleProfileSave = async () => {
        await saveProfile({
            displayName: profileForm.fullName,
            email: profileForm.email,
            jobTitle: profileForm.jobTitle?.trim() || null,
            location: profileForm.location?.trim() || null,
            bio: profileForm.bio?.trim() || null,
        })
    }

    const handleNotificationSave = async () => {
        await saveNotificationPreferences({
            channelPreferences,
        })
    }

    const isProfileDisabled = profileLoading || profileSaving
    const isNotificationDisabled = notificationLoading || notificationSaving

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
                <header className="space-y-2">
                    <p className="text-sm font-medium text-primary tracking-wide uppercase">Account</p>
                    <h1 className="text-3xl font-semibold text-foreground">User Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your professional profile, notification preferences, and account safety controls.
                    </p>
                </header>

                <Card className="bg-card border border-border">
                    <CardHeader className="border-b border-border/60 pb-4">
                        <CardTitle className="text-lg text-foreground">Personal Profile</CardTitle>
                        <p className="text-sm text-muted-foreground">This information appears on shared deliverables and invoices.</p>
                        {profileError && <p className="text-sm text-destructive">Unable to load profile details.</p>}
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={profileData?.photoURL ?? undefined} alt={profileForm.fullName} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="gap-2" disabled>
                                            <Camera className="h-4 w-4" /> Change Photo
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-2 text-destructive" type="button" disabled>
                                            <Trash2 className="h-4 w-4" /> Remove
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">JPG or PNG. Max size 2 MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <Input
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                    disabled={isProfileDisabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <Input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                                    disabled={isProfileDisabled}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                                <Input
                                    value={profileForm.jobTitle}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                                    disabled={isProfileDisabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Location</label>
                                <Input
                                    value={profileForm.location}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, location: e.target.value }))}
                                    disabled={isProfileDisabled}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Bio</label>
                            <Textarea
                                rows={4}
                                value={profileForm.bio}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                                disabled={isProfileDisabled}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                className="min-w-[160px]"
                                onClick={handleProfileSave}
                                disabled={isProfileDisabled}
                            >
                                {profileSaving ? 'Saving…' : 'Save Profile'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-foreground">Notification Preferences</CardTitle>
                        <p className="text-sm text-muted-foreground">Decide how Pixel Track keeps you in the loop.</p>
                        {notificationError && <p className="text-sm text-destructive">Unable to load notification preferences.</p>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-xs uppercase text-muted-foreground grid grid-cols-5 gap-3 border-b border-border pb-2">
                            <span className="col-span-3">Channel</span>
                            <span className="text-center">Email</span>
                            <span className="text-center">Push</span>
                        </div>
                        {notificationOptions.map((pref) => (
                            <div
                                key={pref.id}
                                className="grid grid-cols-5 gap-3 rounded-xl border border-border/70 bg-muted/40 p-4"
                            >
                                <div className="col-span-3 space-y-1">
                                    <p className="font-medium text-foreground">{pref.label}</p>
                                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <Switch
                                        checked={channelPreferences[pref.id as NotificationChannelId]?.email ?? false}
                                        onCheckedChange={handleNotificationToggle(pref.id as NotificationChannelId, 'email')}
                                        aria-label={`${pref.label} email preference`}
                                        disabled={isNotificationDisabled}
                                    />
                                </div>
                                <div className="flex items-center justify-center">
                                    <Switch
                                        checked={channelPreferences[pref.id as NotificationChannelId]?.push ?? false}
                                        onCheckedChange={handleNotificationToggle(pref.id as NotificationChannelId, 'push')}
                                        aria-label={`${pref.label} push preference`}
                                        disabled={isNotificationDisabled}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                className="min-w-[160px]"
                                onClick={handleNotificationSave}
                                disabled={isNotificationDisabled}
                            >
                                {notificationSaving ? 'Saving…' : 'Save Preferences'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border border-border">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-foreground">Security</CardTitle>
                        <p className="text-sm text-muted-foreground">Protect your workspace with additional safeguards.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-border/70 p-4">
                            <div>
                                <p className="font-medium text-foreground">Multi-factor Authentication</p>
                                <p className="text-sm text-muted-foreground">Add a secondary passcode when signing in from new devices.</p>
                            </div>
                            <Switch checked aria-readonly />
                        </div>
                        <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-destructive">Deactivate Account</p>
                                <p className="text-sm text-muted-foreground">
                                    Temporarily disable access for compliance reasons. You can re-activate anytime.
                                </p>
                            </div>
                            <Button variant="ghost" className="text-destructive hover:bg-destructive/10">Deactivate</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
