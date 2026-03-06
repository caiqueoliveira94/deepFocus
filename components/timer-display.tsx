"use client"

interface TimerDisplayProps {
  timeLeft: number
}

export function TimerDisplay({ timeLeft }: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex items-center justify-center">
      <span className="font-mono text-8xl md:text-9xl font-light tracking-tighter text-foreground tabular-nums">
        {String(minutes).padStart(2, "0")}
        <span className="text-muted-foreground">:</span>
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  )
}
