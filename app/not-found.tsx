"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">

      {/* Background glow */}
      <div className="absolute -top-40 h-500px w-500px rounded-full bg-indigo-200 blur-[120px] opacity-30"></div>

      <Card className="relative max-w-xl border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col items-center text-center">

          {/* Illustration */}
          <div className="mb-8">
            {/* keep your SVG here */}
            <svg width="168" height="203" viewBox="0 0 168 203" fill="none">
              {/* SVG CONTENT */}
            </svg>
          </div>

          {/* Error code */}
          <p className="text-sm font-medium text-indigo-600 mb-2">
            404 ERROR
          </p>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
            Page not found
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-lg max-w-md mb-8">
            Hmm, the page you&apos;re looking for does&apos;t exist or has been moved.
            Try going back or explore our homepage.
          </p>

          {/* Buttons */}
          <div className="flex gap-4">

            <Button
              onClick={() => router.push("/admin")}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6"
            >
              Go Home
            </Button>

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-xl"
            >
              Go Back
            </Button>

          </div>

        </CardContent>
      </Card>

    </div>
  )
}