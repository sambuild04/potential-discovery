import { Button } from "@/components/ui/button"
import Link from "next/link"
import BookIcon from "@/components/book-icon"

export default function About() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About Potential Discovery</h1>

        <div className="relative h-64 w-full mb-8 rounded-lg overflow-hidden flex items-center justify-center bg-blue-50">
          <BookIcon className="w-full max-w-[400px]" width={400} height={300} />
        </div>

        <div className="prose max-w-none">
          <h2>Our Mission</h2>
          <p>
            At Potential Discovery, we believe that everyone has untapped potential waiting to be discovered. Our
            mission is to help you uncover meaningful paths in your life by learning from your personal experiences,
            interests, and reflections.
          </p>

          <h2>How It Works</h2>
          <p>Potential Discovery uses a unique approach to help you find meaning in your life:</p>

          <ol>
            <li>
              <strong>Upload Your Experiences</strong> - Share videos, images, and diary entries that represent
              important moments, interests, or thoughts in your life.
            </li>
            <li>
              <strong>Build Your Collection</strong> - As you add more content (at least 10 items), our system begins to
              understand your unique interests and values.
            </li>
            <li>
              <strong>Receive Personalized Book Recommendations</strong> - Based on patterns in your uploads, we
              recommend books, articles, activities, and other content that might resonate with you and help you
              discover new meaningful paths. Our focus is on finding the perfect books that align with your interests
              and values.
            </li>
            <li>
              <strong>Understand Why</strong> - Each recommendation comes with a personalized explanation of why we
              think it might be meaningful to you, connecting it to patterns in your uploads.
            </li>
          </ol>

          <h2>The Power of Books</h2>
          <p>
            We believe books are powerful tools for personal growth and discovery. The right book at the right time can
            change your perspective, introduce new ideas, and help you find meaning in your experiences. Our
            recommendation system is designed to connect you with books that speak to your unique journey.
          </p>
          <p>
            Whether you're seeking inspiration, knowledge, or simply a new perspective, our curated book recommendations
            aim to guide you toward content that resonates with your personal experiences and aspirations.
          </p>

          <h2>Our Philosophy</h2>
          <p>
            We believe that meaning comes from connecting your past experiences with future possibilities. By reflecting
            on what matters to you and exploring new directions aligned with your values, you can discover a more
            fulfilling path forward.
          </p>

          <p>
            Potential Discovery isn't about prescribing a one-size-fits-all approach to meaning. Instead, we help you
            uncover your own unique path by learning from your personal journey and suggesting new possibilities that
            align with who you are.
          </p>

          <div className="my-8 text-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Your Discovery Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
