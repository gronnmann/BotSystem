'use client'

import {useState} from 'react'
import {useAuth} from '@/contexts/auth-context'
import {toast} from 'sonner'
import {Tables} from '@/lib/database.types'
import {AlertTriangleIcon, BeerIcon, CalendarIcon, Plus} from 'lucide-react'
import {useAddPenalty, useBotSystemPenalties, useBotSystemRules, useBotsystemMembers} from '@/queries/queries'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {Separator} from '@/components/ui/separator'
import ProfileDisplay from "@/components/profile-display";

interface InfractionsManagerProps {
    botsystemId: string
}

export default function InfractionsManager({botsystemId}: InfractionsManagerProps) {
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState('')
    const [selectedRuleId, setSelectedRuleId] = useState('')
    const [customUnits, setCustomUnits] = useState('')
    const [note, setNote] = useState('')

    const {user} = useAuth()
    const {data: penalties = [], isLoading: penaltiesLoading} = useBotSystemPenalties(botsystemId)
    const {data: rules = [], isLoading: rulesLoading} = useBotSystemRules(botsystemId)
    const {data: members = [], isLoading: membersLoading} = useBotsystemMembers(botsystemId)
    const addPenalty = useAddPenalty()

    const resetForm = () => {
        setSelectedUserId('')
        setSelectedRuleId('')
        setCustomUnits('')
        setNote('')
        setShowCreateForm(false)
    }

    async function createPenalty() {
        if (!selectedUserId) {
            toast.error('Please select a user')
            return
        }

        if (!selectedRuleId) {
            toast.error('Please select a rule')
            return
        }

        const selectedRule = rules.find(r => r.id === selectedRuleId)
        const units = customUnits ? parseInt(customUnits) : selectedRule?.default_units || 1

        if (units < 1 || units > 100) {
            toast.error('Units must be between 1 and 100')
            return
        }

        setLoading(true)

        try {
            if (!user) {
                toast.error('No authenticated user found')
                return
            }

            await addPenalty.mutateAsync({
                botsystem_id: botsystemId,
                user_id: selectedUserId,
                rule_id: selectedRuleId,
                units: units,
                note: note.trim() || null,
                created_by: user.id,
            } as Tables<'penalties'>)

            toast.success('Penalty added successfully! ⚠️')
            resetForm()
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Unknown error'
            toast.error('Failed to create penalty: ' + message)
        } finally {
            setLoading(false)
        }
    }

    const selectedRule = rules.find(r => r.id === selectedRuleId)

    // Helper function to get rule for a penalty
    function getRuleForPenalty(ruleId: string) {
        return rules.find(r => r.id === ruleId)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2">
                        ⚠️ Bøter
                    </h2>
                </div>

                {!showCreateForm && (
                    <Button onClick={() => setShowCreateForm(true)} className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2"/>
                        Legg til Bot
                    </Button>
                )}
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Meld Bot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="userId">Person</Label>
                                    <Select
                                        value={selectedUserId}
                                        onValueChange={setSelectedUserId}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Velg en person..."/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map((m) => (
                                                <SelectItem key={m.user_id} value={m.user_id}>
                                                    {m.profiles?.display_name || 'Ukjent Bruker'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ruleId">Brutt Regel</Label>
                                    <Select
                                        value={selectedRuleId}
                                        onValueChange={setSelectedRuleId}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Velg en regel..."/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rules.map((rule) => (
                                                <SelectItem key={rule.id} value={rule.id}>
                                                    {rule.title} ({rule.default_units} units)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customUnits">
                                    Antall Enheter
                                    {selectedRule && (
                                        <span className="text-muted-foreground ml-2">
                      Default: {selectedRule.default_units} units
                    </span>
                                    )}
                                </Label>
                                <Input
                                    id="customUnits"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={customUnits}
                                    onChange={(e) => setCustomUnits(e.target.value)}
                                    placeholder={selectedRule ? selectedRule.default_units.toString() : '1'}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Notat (valgfritt)</Label>
                                <Textarea
                                    id="note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Any additional details about this penalty..."
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    onClick={createPenalty}
                                    disabled={loading || !selectedUserId || !selectedRuleId}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {loading ? 'Adding...' : 'Add Penalty'}
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

            {/* Penalties List */}
            {penaltiesLoading || rulesLoading || membersLoading ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Laster bøter…
                    </CardContent>
                </Card>
            ) : penalties.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        {penalties.map((penalty, index) => {
                            return (
                                <div key={penalty.id}>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <ProfileDisplay profile={penalty.profiles} />
                                            </div>
                                            <div className="text-amber-600">
                                                <div className="text-lg flex items-center">
                                                    {penalty.units}
                                                    <BeerIcon/>
                                                </div>
                                                <div className="text-sm mt-1">
                                                    {penalty.units === 1 ? 'enhet' : 'enheter'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3 flex items-center space-x-2">
                                            <AlertTriangleIcon className="w-4 h-4 text-red-500" />
                                            <span className="font-semibold">Regel:</span>
                                            <span className="text-muted-foreground">
                                                {getRuleForPenalty(penalty.rule_id)?.title || 'Ukjent regel'}
                                            </span>
                                        </div>

                                        {penalty.note && (
                                            <p className="mb-3 text-muted-foreground">
                                                <span className="font-semibold">Kommentar: </span> {penalty.note}
                                            </p>
                                        )}

                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                            <CalendarIcon className="w-4 h-4"/>
                                            <span>
                        {new Date(penalty.created_at || '').toLocaleDateString()} kl.{' '}
                                                {new Date(penalty.created_at || '').toLocaleTimeString()}
                      </span>
                                        </div>
                                    </div>
                                    {index < penalties.length - 1 && <Separator/>}
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-8">
                        <div className="text-center">
                            <AlertTriangleIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Ingen bøter enda!</h3>
                            <p className="text-muted-foreground mb-4">
                                Ingen regelbrudd har blitt registrert enda. For en flink gruppe :)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
