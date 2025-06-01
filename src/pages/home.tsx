"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import {
  Heart,
  Stethoscope,
  Home,
  Hospital,
  AlertCircle,
  ArrowRight,
  Map,
  Book,
  Sparkles,
  Users,
  Shield,
  Clock,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { useAuth } from "../lib/auth-context"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/symptom-checker")
    } else {
      navigate("/signup")
    }
  }

  const stats = [
    { number: "80%", label: "Accuracy Rate", icon: Shield },
    { number: "24/7", label: "Available", icon: Clock },
    { number: "50+", label: "Conditions", icon: Stethoscope },
  ]

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: "10%",
            left: "10%",
          }}
        />
        <div
          className="absolute w-80 h-80 bg-primary/3 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
            bottom: "10%",
            right: "10%",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-primary/5 py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div
              className={`space-y-8 transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium border border-primary/20 animate-pulse">
                  <Sparkles className="h-5 w-5" />
                  AI-Powered Health Assistant
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Your Personal Medical Symptom Assistant
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Describe your symptoms and SymptaCare will recommend home remedies or direct you to the nearest
                  hospital based on the severity.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="group gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-4"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group gap-2 border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-lg px-8 py-4"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Learn More
                  <Book className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.number}</div>
                    <div className="text-base text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`flex justify-center transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 shadow-2xl">
                  <div className="absolute -top-6 -left-6 bg-primary/10 rounded-full p-4 animate-bounce">
                    <Stethoscope className="h-10 w-10 text-primary" />
                  </div>
                  <div
                    className="absolute -bottom-6 -right-6 bg-primary/10 rounded-full p-4 animate-bounce"
                    style={{ animationDelay: "1s" }}
                  >
                    <Heart className="h-10 w-10 text-primary" />
                  </div>
                  <img
                    src="/AI-doctor-2-e1739480755336.avif"
                    alt="Medical Consultation"
                    className="rounded-xl shadow-xl w-full max-w-lg transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium border border-primary/20 mb-6">
              <Map className="h-5 w-5" />
              Simple Process
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              How SymptaCare Works
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system analyzes your symptoms and provides tailored recommendations in just a few steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Book,
                title: "1. Describe Symptoms",
                description:
                  "Tell us about the symptoms you're experiencing, how long you've had them, and provide some basic information about yourself.",
                color: "from-blue-500/20 to-blue-600/20",
                delay: "0ms",
              },
              {
                icon: Stethoscope,
                title: "2. Intelligent Analysis",
                description:
                  "Our AI-powered system evaluates your symptoms, asks relevant follow-up questions, and determines their severity.",
                color: "from-green-500/20 to-green-600/20",
                delay: "200ms",
              },
              {
                icon: Map,
                title: "3. Get Recommendations",
                description:
                  "Receive personalized advice, whether it's home remedies for mild symptoms or directions to the nearest hospital for severe cases.",
                color: "from-purple-500/20 to-purple-600/20",
                delay: "400ms",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className={`group border-primary/10 bg-gradient-to-br ${step.color} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom-4`}
                style={{ animationDelay: step.delay }}
              >
                <CardHeader className="pb-4">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 w-16 h-16 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base md:text-lg leading-relaxed">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Prompt Section */}
      {!isAuthenticated && (
        <section className="py-20 lg:py-32 bg-gradient-to-r from-primary/5 via-background to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium border border-primary/20 mb-6">
                <Sparkles className="h-5 w-5" />
                Get Started Today
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Create an Account to Check Your Symptoms
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Sign up for free to access our symptom checker and get personalized health recommendations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  size="lg"
                  className="group gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-4"
                  asChild
                >
                  <Link to="/signup">
                    Sign Up Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 text-lg px-8 py-4"
                  asChild
                >
                  <Link to="/login">
                    Already have an account? Log in
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium border border-primary/20 mb-6">
              <Shield className="h-5 w-5" />
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Why Choose SymptaCare
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to helping you make informed health decisions with our innovative features.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: AlertCircle,
                title: "Rapid Assessment",
                description: "Get quick evaluations of your symptoms without waiting for an appointment.",
                color: "from-red-500/10 to-red-600/10",
              },
              {
                icon: Home,
                title: "Home Care Guides",
                description: "Access detailed instructions for managing minor conditions at home.",
                color: "from-green-500/10 to-green-600/10",
              },
              {
                icon: Hospital,
                title: "Hospital Locator",
                description: "Find the nearest healthcare facilities when immediate care is needed.",
                color: "from-blue-500/10 to-blue-600/10",
              },
              {
                icon: Heart,
                title: "Health Education",
                description: "Learn about common conditions, preventive measures, and when to seek medical help.",
                color: "from-pink-500/10 to-pink-600/10",
              },
              {
                icon: Stethoscope,
                title: "AI-Powered Analysis",
                description: "Our advanced algorithms analyze your symptoms to provide accurate recommendations.",
                color: "from-purple-500/10 to-purple-600/10",
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                description: "Access health guidance anytime, day or night, whenever you need it.",
                color: "from-amber-500/10 to-amber-600/10",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br ${feature.color} border border-primary/10 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 w-20 h-20 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Ready to Check Your Symptoms?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Don't wait until symptoms worsen. Get quick, reliable guidance today.
            </p>
            <Button
              size="lg"
              className="group gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-xl"
              onClick={handleGetStarted}
            >
              Get Started Now
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
