import Image from "next/image"

interface BookIconProps {
  className?: string
  width?: number
  height?: number
}

export default function BookIcon({ className = "", width = 300, height = 300 }: BookIconProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image src="/images/book-icon.png" alt="Book icon" width={width} height={height} className="object-contain" />
    </div>
  )
}
