"use client"

import { useEffect, useState } from "react"
import ReactPlayer from "react-player"

export default function Player({ id }: { id: string }) {
  const [r2Url, setR2Url] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/sw/${id}`)
        const data = await res.json()
        setR2Url(data.url)
      } catch (error) {
        console.error("Failed to fetch video URL:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (isLoading || !r2Url)
    return (
      <div className="h-[60vh] bg-muted w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading video...</p>
        </div>
      </div>
    )

  return (
    <ReactPlayer
      src={r2Url}
      playing={false}
      controls
      width="100%"
      height="60vh"
      className="rounded-xl overflow-hidden bg-black"
    />
  )
}
