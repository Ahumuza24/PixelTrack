import { Camera, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useUserSettingsPage } from '@/features/settings/hooks/useUserSettingsPage'
import type { NotificationChannelId } from '@/types'

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
    const { profile, notifications } = useUserSettingsPage()

    const {
        form: profileForm,
        initials,
        photoUrl,
        error: profileError,
        isDisabled: isProfileDisabled,
        isSaving: profileSaving,
        onChange: handleProfileChange,
        onSave: handleProfileSave,
    } = profile

    const {
        preferences: channelPreferences,
        isDisabled: isNotificationDisabled,
        isSaving: notificationSaving,
        onToggle: handleNotificationToggle,
        onSave: handleNotificationSave,
    } = notifications

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
                                    <AvatarImage src={photoUrl ?? undefined} alt={profileForm.fullName} />
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
                                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                                    disabled={isProfileDisabled}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <Input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => handleProfileChange('email', e.target.value)}
                                    disabled={isProfileDisabled}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                            <Input
                                value={profileForm.jobTitle}
                                onChange={(e) => handleProfileChange('jobTitle', e.target.value)}
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-xs uppercase text-muted-foreground grid grid-cols-5 gap-3 border-b border-border pb-2">
                            <span className="col-span-3">Channel</span>
                            <span className="text-center">Email</span>
                            <span className="text-center">Push</span>
                        </div>
                        {notificationOptions.map((pref) => {
                            const preferenceId = pref.id as NotificationChannelId
                            return (
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
                                            checked={channelPreferences[preferenceId]?.email ?? false}
                                            onCheckedChange={(checked) =>
                                                handleNotificationToggle(preferenceId, 'email', checked)
                                            }
                                            aria-label={`${pref.label} email preference`}
                                            disabled={isNotificationDisabled}
                                        />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Switch
                                            checked={channelPreferences[preferenceId]?.push ?? false}
                                            onCheckedChange={(checked) =>
                                                handleNotificationToggle(preferenceId, 'push', checked)
                                            }
                                            aria-label={`${pref.label} push preference`}
                                            disabled={isNotificationDisabled}
                                        />
                                    </div>
                                </div>
                            )
                        })}

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
