"use client"

import { useState, useEffect } from "react"
import { Heart, Menu, X, Stethoscope, Sparkles } from "lucide-react"
import { Button } from "../ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../lib/auth-context"
import { ThemeToggle } from "../theme-toggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="group flex items-center transition-transform duration-300 hover:scale-105">
              <div className="relative">
                <Heart className="h-8 w-8 text-primary fill-primary transition-all duration-300 group-hover:scale-110" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse"></div>
              </div>
              <span className="ml-3 text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                SymptaCare
              </span>
              <Sparkles className="h-5 w-5 text-primary ml-1 animate-pulse" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="relative text-foreground hover:text-primary transition-all duration-300 group py-2 text-lg"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/symptom-checker"
                className="relative text-foreground hover:text-primary transition-all duration-300 group flex items-center gap-2 py-2 text-lg"
              >
                <Stethoscope className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                Symptom Checker
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            <a
              href="/#how-it-works"
              className="relative text-muted-foreground hover:text-primary transition-all duration-300 group py-2 text-lg"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Desktop CTA buttons and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <div className="text-base mr-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-full border border-primary/20">
                  <span className="text-muted-foreground">Hello, </span>
                  <span className="font-medium text-primary">{user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="group border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-base px-6 py-2"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  asChild
                  className="group border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-base px-6 py-2"
                >
                  <Link to="/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-base px-6 py-2"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile header right section */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
              className="p-2 rounded-full hover:bg-primary/10 transition-colors duration-300"
            >
              {isMenuOpen ? (
                <X size={28} className="transition-transform duration-300 rotate-90" />
              ) : (
                <Menu size={28} className="transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-6">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/5 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link
                  to="/symptom-checker"
                  className="text-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-primary/5 text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Stethoscope className="h-5 w-5" />
                  Symptom Checker
                </Link>
              )}
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-primary/5 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>

              <div className="border-t border-border/50 pt-4 mt-4">
                <div className="flex flex-col space-y-3">
                  {isAuthenticated ? (
                    <>
                      <div className="text-base py-3 px-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <span className="text-muted-foreground">Logged in as </span>
                        <span className="font-medium text-primary">{user?.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-base py-3"
                      >
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-base py-3"
                      >
                        <Link to="/login">Log In</Link>
                      </Button>
                      <Button
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 text-base py-3"
                      >
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
