import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Enums, TablesInsert } from '@/lib/database.types'
import { useUpsertUserProfile } from '@/queries/queries'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface ProfileSetupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

const COLOR_OPTIONS = [
    { value: 'blue' as const, label: 'Blue', bgColor: 'bg-blue-500', textColor: 'text-blue-500' },
    { value: 'green' as const, label: 'Green', bgColor: 'bg-green-500', textColor: 'text-green-500' },
    { value: 'red' as const, label: 'Red', bgColor: 'bg-red-500', textColor: 'text-red-500' },
    { value: 'purple' as const, label: 'Purple', bgColor: 'bg-purple-500', textColor: 'text-purple-500' },
    { value: 'orange' as const, label: 'Orange', bgColor: 'bg-orange-500', textColor: 'text-orange-500' },
    { value: 'teal' as const, label: 'Teal', bgColor: 'bg-teal-500', textColor: 'text-teal-500' },
]

export default function ProfileSetupDialog({ open, onOpenChange }: ProfileSetupDialogProps) {
    const [displayName, setDisplayName] = useState('')
    const [selectedColor, setSelectedColor] = useState<Enums<'profile_color'>>('blue')
    const { user, profile } = useAuth()
    const upsertProfile = useUpsertUserProfile()

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setDisplayName(profile?.display_name || '')
            setSelectedColor(profile?.color || 'blue')
        }
    }, [open, profile])

    const resetForm = () => {
        setDisplayName('')
        setSelectedColor('blue')
    }

    async function handleSubmit() {
        if (!displayName.trim()) {
            toast.error('Please enter a display name')
            return
        }

        const profileData: TablesInsert<'profiles'> = {
            user_id: user!.id,
            email: user!.email!,
            display_name: displayName.trim(),
            color: selectedColor,
        }

        await upsertProfile.mutateAsync(profileData)

        toast.success('Profile saved successfully!')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        🎭 {profile ? 'Update Profile' : 'Setup Your Profile'}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Choose your display name and favorite color!
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={50}
                            placeholder="Enter your display name"
                            disabled={upsertProfile.isPending}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Choose Your Color</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {COLOR_OPTIONS.map((color) => (
                                <Button
                                    key={color.value}
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`relative p-3 h-auto transition-all duration-200 ${
                                        selectedColor === color.value
                                            ? 'border-primary bg-muted'
                                            : 'hover:bg-muted/50'
                                    }`}
                                    disabled={upsertProfile.isPending}
                                >
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className={`w-5 h-5 rounded-full ${color.bgColor}`} />
                                        <span className={`text-xs font-medium ${
                                            selectedColor === color.value ? color.textColor : 'text-muted-foreground'
                                        }`}>
                      {color.label}
                    </span>
                                    </div>
                                    {selectedColor === color.value && (
                                        <div className="absolute top-1 right-1 text-primary">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={upsertProfile.isPending || !displayName.trim()}
                            className="flex-1"
                        >
                            {upsertProfile.isPending ? (
                                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    {profile ? 'Updating...' : 'Creating...'}
                </span>
                            ) : (
                                profile ? 'Update Profile' : 'Complete Setup'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={upsertProfile.isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
