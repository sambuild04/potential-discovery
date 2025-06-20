"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Initial user fetch
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="ml-2 text-xl font-bold text-blue-600">Potential Discovery</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium ${isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium ${
              isActive("/about") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            About
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${
              isActive("/dashboard") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/privacy-policy"
            className={`text-sm font-medium ${
              isActive("/privacy-policy") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            Privacy Policy
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
              </Link>
            </>
          ) : (
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 bg-white">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`text-sm font-medium ${isActive("/") ? "text-blue-600" : "text-gray-600"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium ${isActive("/about") ? "text-blue-600" : "text-gray-600"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium ${isActive("/dashboard") ? "text-blue-600" : "text-gray-600"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/privacy-policy"
              className={`text-sm font-medium ${isActive("/privacy-policy") ? "text-blue-600" : "text-gray-600"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Privacy Policy
            </Link>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                  Sign Out
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
