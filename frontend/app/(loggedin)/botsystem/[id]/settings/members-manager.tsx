'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { TablesInsert } from '@/lib/database.types'
import { Plus, Users, Search, Trash2, Loader2 } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'
import { useAuth } from '@/contexts/auth-context'
import { useBotSystem, useBotsystemMembers, useProfileSearch, useAddBotsystemMember } from '@/queries/queries'
import { useQueryClient } from '@tanstack/react-query'
import { COLOR_CLASSES } from '@/lib/profile-colors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface MembersManagerProps {
  botsystemId: string
}

export default function MembersManager({ botsystemId }: MembersManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: botsystem, isLoading: botsystemLoading } = useBotSystem(botsystemId)
  const { data: members = [], isLoading: membersLoading } = useBotsystemMembers(botsystemId)
  const { data: searchResults = [], isLoading: searchLoading } = useProfileSearch(searchQuery)
  const addMember = useAddBotsystemMember()

  const isOwner = botsystem?.owner_id === user?.id

  // Filter out users who are already members or the owner
  const availableUsers = useMemo(() => {
    if (!searchResults.length) return []
    
    const existingUserIds = new Set([
      botsystem?.owner_id,
      ...members.map(m => m.user_id)
    ])

    return searchResults.filter(profile => !existingUserIds.has(profile.user_id))
  }, [searchResults, botsystem?.owner_id, members])

  const resetForm = () => {
    setShowAddForm(false)
    setSearchQuery('')
  }

  async function handleAddMember(userId: string) {
    if (!botsystem) return

    try {
      const memberData: TablesInsert<'botsystem_members'> = {
        botsystem_id: botsystem.id,
        user_id: userId,
        role: 'member',
      }

      await addMember.mutateAsync(memberData)
      toast.success('Member added successfully!')
      resetForm()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      toast.error('Failed to add member: ' + message)
    }
  }

  async function removeMember(userId: string) {
    if (!botsystem) return

    try {
      const { error } = await supabaseClient
        .from('botsystem_members')
        .delete()
        .eq('botsystem_id', botsystem.id)
        .eq('user_id', userId)

      if (error) {
        toast.error('Failed to remove member: ' + error.message)
      } else {
        toast.success('Member removed')
        queryClient.invalidateQueries({ queryKey: ['botsystems', botsystemId, 'members'] })
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span>Medlemmer</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Administrer hvem som kan delta i dette botsystemet
            </p>
          </div>
          
          {isOwner && !showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Legg til medlem
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

      {/* Add Member Form */}
      {isOwner && showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Legg til nytt medlem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Søk etter brukere</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    placeholder="Søk..."
                    disabled={addMember.isPending}
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {availableUsers.length > 0 && (
                <Card className="border-muted">
                  <CardContent className="p-0 max-h-60 overflow-y-auto">
                    {availableUsers.map((profile, index) => {
                      const userColor = profile.color as keyof typeof COLOR_CLASSES || 'blue'
                      
                      return (
                        <div key={profile.user_id}>
                          <Button
                            variant="ghost"
                            onClick={() => handleAddMember(profile.user_id)}
                            disabled={addMember.isPending}
                            className="w-full justify-start p-3 h-auto"
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <div className={`w-3 h-3 rounded-full ${COLOR_CLASSES[userColor]}`} />
                              <div className="flex-1 text-left">
                                <div className="font-medium">
                                  {profile.display_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {profile.email}
                                </div>
                              </div>
                              {addMember.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                            </div>
                          </Button>
                          {index < availableUsers.length - 1 && <Separator />}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {searchQuery.length > 0 && !searchLoading && availableUsers.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Ingen brukere funnet eller alle er allerede medlemmer.
                </p>
              )}

              <Button
                variant="outline"
                onClick={resetForm}
                disabled={addMember.isPending}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardContent className="p-0">
          {/* Members */}
          {members.length > 0 ? (
            members.map((member, index) => {
              const userColor = member.profiles?.color as keyof typeof COLOR_CLASSES || 'blue'
              
              return (
                <div key={member.user_id}>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${COLOR_CLASSES[userColor]}`} />
                        <div>
                          <h3 className="font-semibold">
                            {member.profiles?.display_name || 'Ukjent Bruker'}
                          </h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Medlem
                          </Badge>
                        </div>
                      </div>
                      
                      {isOwner && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this member? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeMember(member.user_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Added {new Date(member.added_at || '').toLocaleDateString()}
                    </div>
                  </div>
                  {index < members.length - 1 && <Separator />}
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isOwner 
                  ? "No members added yet. Add some to get started!" 
                  : "No other members in this botsystem."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {members.length + 1}
            </div>
            <div className="text-muted-foreground text-sm">Total Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Date(botsystem.created_at || '').toLocaleDateString()}
            </div>
            <div className="text-muted-foreground text-sm">Created</div>
          </CardContent>
        </Card>
      </div>
      </CardContent>
    </Card>
  )
}