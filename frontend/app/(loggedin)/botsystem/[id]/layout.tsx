"use client"

import { useEffect, useState } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import BotsystemLayout from "./botsystem-layout"
import { supabaseClient } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface BotsystemPageProps {
  params: Promise<{
    id: string
  }>
  children: React.ReactNode
}

export default function BotsystemPageLayout({ params, children }: BotsystemPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [botsystem, setBotsystem] = useState<any | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  const { id } = React.use(params)

  useEffect(() => {
    if (!user) {
      router.replace("/login")
      return
    }

    const fetchBotsystem = async () => {
      const { data: botsystem, error } = await supabaseClient
          .from("botsystems")
          .select("*")
          .eq("id", id)
          .single()

      if (error || !botsystem) {
        router.replace("/404")
        return
      }

      const owner = botsystem.owner_id === user.id

      if (!owner) {
        const { data: membership } = await supabaseClient
            .from("botsystem_members")
            .select("*")
            .eq("botsystem_id", id)
            .eq("user_id", user.id)
            .single()

        if (!membership) {
          router.replace("/404")
          return
        }
      }

      setBotsystem(botsystem)
      setIsOwner(owner)
      setLoading(false)
    }

    fetchBotsystem()
  }, [id, user, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
      <BotsystemLayout botsystem={botsystem} isOwner={isOwner}>
        {children}
      </BotsystemLayout>
  )
}
