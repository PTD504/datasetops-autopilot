"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function PlanApprovalRedirect() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  useEffect(() => {
    router.replace(`/projects/${id}?reviewPlan=true`)
  }, [id, router])

  return null
}
