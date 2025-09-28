'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Tables } from '@/lib/database.types'
import { Plus, BookOpen, Trash2 } from 'lucide-react'
import { useAddRule, useBotSystemRules } from '@/queries/queries'
import { useQueryClient } from '@tanstack/react-query'
import { supabaseClient } from '@/lib/supabase-client'
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

interface RulesManagerProps {
  botsystemId: string
  isOwner: boolean
}

export default function RulesManager({ botsystemId, isOwner }: RulesManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ruleTitle, setRuleTitle] = useState('')
  const [defaultUnits, setDefaultUnits] = useState(1)

  const queryClient = useQueryClient()
  const { data: rules = [], isLoading } = useBotSystemRules(botsystemId)
  const addRule = useAddRule()

  const resetForm = () => {
    setShowCreateForm(false)
    setRuleTitle('')
    setDefaultUnits(1)
  }

  async function createRule() {
    if (!ruleTitle.trim()) {
      toast.error('Please enter a rule title')
      return
    }

    if (defaultUnits < 1 || defaultUnits > 100) {
      toast.error('Default units must be between 1 and 100')
      return
    }

    setLoading(true)

    try {
      await addRule.mutateAsync({
        botsystem_id: botsystemId,
        title: ruleTitle.trim(),
        default_units: defaultUnits,
        is_active: true,
      } as Tables<'rules'>)

      toast.success('Rule created successfully! 📋')
      resetForm()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      toast.error('Failed to create rule: ' + message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteRule(ruleId: string) {
    try {
      const { error } = await supabaseClient
          .from('rules')
          .delete()
          .eq('id', ruleId)

      if (error) {
        toast.error('Klarte ikke fjerne regel: ' + error.message)
      } else {
        toast.success('Rule deleted')
        queryClient.invalidateQueries({ queryKey: ['botsystems', botsystemId, 'rules'] })
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              📋 Regler
            </h2>
          </div>

          {isOwner && !showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Legg til Regel
              </Button>
          )}
        </div>

        {/* Create Form */}
        {isOwner && showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Ny Regel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ruleTitle">Regel</Label>
                    <Input
                        id="ruleTitle"
                        type="text"
                        value={ruleTitle}
                        onChange={(e) => setRuleTitle(e.target.value)}
                        maxLength={100}
                        placeholder="f. eks. For sein til møte"
                        disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultUnits">Antall Kryss</Label>
                    <Input
                        id="defaultUnits"
                        type="number"
                        min="1"
                        max="100"
                        value={defaultUnits}
                        onChange={(e) => setDefaultUnits(parseInt(e.target.value) || 1)}
                        disabled={loading}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                        onClick={createRule}
                        disabled={loading || !ruleTitle.trim()}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? 'Oppretter regel...' : 'Opprett Regel'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={resetForm}
                        disabled={loading}
                    >
                      Avbryt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Rules List */}
        {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Laster regler…
              </CardContent>
            </Card>
        ) : rules.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                {rules.map((rule, index) => (
                    <div key={rule.id}>
                      <div className={`p-6 ${!rule.is_active ? 'bg-muted/30' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold ${rule.is_active ? '' : 'text-muted-foreground'}`}>
                                {rule.title}
                              </h3>
                              {!rule.is_active && (
                                  <Badge variant="secondary">
                                    Inaktiv
                                  </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          <strong>{rule.default_units}</strong> {rule.default_units === 1 ? 'enhet' : 'enheter'}
                        </span>
                              <span>
                          Laga {new Date(rule.created_at || '').toLocaleDateString()}
                        </span>
                            </div>
                          </div>

                          {isOwner && (
                              <div className="flex items-center space-x-2">
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
                                      <AlertDialogTitle>Fjerne Regel</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Er du sikker på at du vil fjerne regelen &quot;{rule.title}&quot;? Dette kan ikke angres.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                          onClick={() => deleteRule(rule.id)}
                                          className="bg-destructive text-white hover:bg-destructive/90"
                                      >
                                        Slett
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                          )}
                        </div>
                      </div>
                      {index < rules.length - 1 && <Separator />}
                    </div>
                ))}
              </CardContent>
            </Card>
        ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ingen regler enda!</h3>
                  <p className="text-muted-foreground">
                    {isOwner ? 'Legg til den første regelen for å komme i gang.' : 'Ingen regler har blitt lagt til enda.'}
                  </p>
                </div>
              </CardContent>
            </Card>
        )}
      </div>
  )
}
