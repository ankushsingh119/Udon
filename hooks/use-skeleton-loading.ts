"use client"

import { useState, useEffect } from "react"

export function useSkeletonLoading(duration = 2000) {
  const [isLoading, setIsLoading] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => setIsLoading(false), 400)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return { isLoading, isExiting }
}
