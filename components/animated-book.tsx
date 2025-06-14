"use client"

import { useEffect, useRef } from "react"

interface AnimatedBookProps {
  className?: string
  color?: string
}

export default function AnimatedBook({ className = "", color = "#1d4ed8" }: AnimatedBookProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const draw = () => {
      time += 0.02

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Book dimensions
      const bookWidth = canvas.width * 0.6
      const bookHeight = canvas.height * 0.7
      const bookX = (canvas.width - bookWidth) / 2
      const bookY = (canvas.height - bookHeight) / 2

      // Draw book cover
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(bookX, bookY)
      ctx.lineTo(bookX + bookWidth, bookY)
      ctx.lineTo(bookX + bookWidth, bookY + bookHeight)
      ctx.lineTo(bookX, bookY + bookHeight)
      ctx.closePath()
      ctx.fill()

      // Draw book spine
      ctx.fillStyle = "#0f3b8d"
      ctx.beginPath()
      ctx.moveTo(bookX, bookY)
      ctx.lineTo(bookX - 10, bookY + 10)
      ctx.lineTo(bookX - 10, bookY + bookHeight + 10)
      ctx.lineTo(bookX, bookY + bookHeight)
      ctx.closePath()
      ctx.fill()

      // Draw book top
      ctx.fillStyle = "#2563eb"
      ctx.beginPath()
      ctx.moveTo(bookX, bookY)
      ctx.lineTo(bookX + bookWidth, bookY)
      ctx.lineTo(bookX + bookWidth - 10, bookY + 10)
      ctx.lineTo(bookX - 10, bookY + 10)
      ctx.closePath()
      ctx.fill()

      // Draw pages (animated)
      const pageCount = 5
      const pageWidth = bookWidth * 0.9
      const pageHeight = bookHeight * 0.9
      const pageStartX = bookX + (bookWidth - pageWidth) / 2
      const pageStartY = bookY + (bookHeight - pageHeight) / 2

      for (let i = 0; i < pageCount; i++) {
        const offset = Math.sin(time + i * 0.5) * 5

        ctx.fillStyle = "#f8fafc"
        ctx.beginPath()
        ctx.moveTo(pageStartX + offset, pageStartY + offset)
        ctx.lineTo(pageStartX + pageWidth + offset, pageStartY + offset)
        ctx.lineTo(pageStartX + pageWidth + offset, pageStartY + pageHeight + offset)
        ctx.lineTo(pageStartX + offset, pageStartY + pageHeight + offset)
        ctx.closePath()
        ctx.fill()

        // Draw lines on pages
        ctx.strokeStyle = "#e2e8f0"
        ctx.beginPath()
        for (let j = 1; j <= 5; j++) {
          const lineY = pageStartY + offset + (pageHeight / 6) * j
          ctx.moveTo(pageStartX + offset + 20, lineY)
          ctx.lineTo(pageStartX + pageWidth + offset - 20, lineY)
        }
        ctx.stroke()
      }

      animationFrameId = window.requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [color])

  return <canvas ref={canvasRef} width={300} height={300} className={className} />
}
