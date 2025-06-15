import BookIcon from "@/components/book-icon"

export default function About() {
  return (
    <div className="container py-12 text-center">
      <h1 className="text-4xl font-bold mb-8">About Potential Discovery</h1>
      <p className="text-lg text-gray-700 dark:text-gray-400">
        We hope to help you find the next reading that could help you.
      </p>
      <div className="relative h-64 w-full mb-8 rounded-lg overflow-hidden flex items-center justify-center bg-blue-50 mt-8">
        <BookIcon className="w-full max-w-[400px]" width={400} height={300} />
      </div>
    </div>
  )
}
