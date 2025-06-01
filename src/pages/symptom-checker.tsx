"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { AlertCircle, Stethoscope, Heart, Activity, Shield, Clock } from "lucide-react"
import { SymptomForm, type SymptomFormData } from "../components/symptom-checker/symptom-form"
import { Chatbot } from "../components/symptom-checker/chatbot"
import { useAuth } from "../lib/auth-context"

enum Stage {
  FORM = 0,
  CHATBOT = 1,
}

export function SymptomCheckerPage() {
  const [stage, setStage] = useState<Stage>(Stage.FORM)
  const [formData, setFormData] = useState<SymptomFormData | null>(null)
  const { user } = useAuth()

  const handleFormSubmit = (data: SymptomFormData) => {
    setFormData(data)
    setStage(Stage.CHATBOT)
  }

  const handleRestart = () => {
    setStage(Stage.FORM)
    setFormData(null)
  }

  const features = [
    {
      icon: Stethoscope,
      title: "AI Analysis",
      description: "Advanced symptom evaluation",
      color: "from-blue-500/20 to-blue-600/20",
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Tailored recommendations",
      color: "from-red-500/20 to-red-600/20",
    },
    {
      icon: Activity,
      title: "Real-time Results",
      description: "Instant health insights",
      color: "from-green-500/20 to-green-600/20",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected",
      color: "from-purple-500/20 to-purple-600/20",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
        <div className="absolute w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse bottom-10 right-10 animation-delay-2000"></div>
        <div className="absolute w-64 h-64 bg-primary/4 rounded-full blur-2xl animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animation-delay-4000"></div>
      </div>

      <div className="container mx-auto py-8 md:py-16 px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-16 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-base font-medium border border-primary/20 mb-6 animate-pulse">
            <Activity className="h-5 w-5" />
            AI-Powered Health Assessment
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            Check Your Symptoms
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Describe what you're feeling, and our advanced AI will help guide you to the appropriate care with
            personalized recommendations.
          </p>

          {user?.name && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-3 rounded-full border border-primary/20 shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium">
                Welcome back, <span className="text-primary">{user.name}</span>!
              </span>
            </div>
          )}
        </div>

        {/* Features Grid - Only show on form stage */}
        {stage === Stage.FORM && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 animate-in slide-in-from-bottom duration-700 delay-300">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${feature.color} rounded-2xl p-4 md:p-6 border border-primary/10 hover:border-primary/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="bg-primary/20 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Card */}
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-2xl border-0 bg-background/80 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom duration-700 delay-500">
            {/* Card Header with gradient */}
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-2xl shadow-lg">
                        {stage === Stage.FORM ? (
                          <Stethoscope className="h-7 w-7 text-primary" />
                        ) : (
                          <Activity className="h-7 w-7 text-primary" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {stage === Stage.FORM ? "Symptom Assessment" : "AI Analysis"}
                      </CardTitle>
                      <CardDescription className="text-base md:text-lg mt-1">
                        {stage === Stage.FORM
                          ? "Please provide detailed information about your symptoms"
                          : "Our AI is analyzing your symptoms and providing recommendations"}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="hidden md:flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${stage === Stage.FORM ? "bg-primary" : "bg-primary/30"}`}
                    ></div>
                    <div
                      className={`w-8 h-1 rounded-full transition-all duration-300 ${stage === Stage.CHATBOT ? "bg-primary" : "bg-primary/30"}`}
                    ></div>
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${stage === Stage.CHATBOT ? "bg-primary" : "bg-primary/30"}`}
                    ></div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="mt-6 bg-gradient-to-r from-amber-50/80 to-amber-100/80 dark:from-amber-950/20 dark:to-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50 p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm md:text-base text-amber-800 dark:text-amber-200 font-medium mb-1">
                        Important Medical Disclaimer
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                        This tool provides general health information and is not a substitute for professional medical
                        advice.
                        <span className="font-semibold">
                          {" "}
                          In case of emergency, call your local emergency services immediately.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {stage === Stage.FORM && (
                <div className="p-6 md:p-8">
                  <SymptomForm onSubmit={handleFormSubmit} userData={user || undefined} />
                </div>
              )}

              {stage === Stage.CHATBOT && formData && (
                <div className="h-[600px] md:h-[700px]">
                  <Chatbot initialData={formData} onRestart={handleRestart} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Section - Only show on form stage */}
        {stage === Stage.FORM && (
          <div className="mt-12 md:mt-16 text-center animate-in slide-in-from-bottom duration-700 delay-700">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                How Our AI Assessment Works
              </h2>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    step: "01",
                    title: "Symptom Collection",
                    description: "Provide detailed information about your symptoms, duration, and medical history",
                    icon: Clock,
                  },
                  {
                    step: "02",
                    title: "AI Analysis",
                    description: "Our advanced AI analyzes your symptoms against medical databases",
                    icon: Activity,
                  },
                  {
                    step: "03",
                    title: "Personalized Report",
                    description: "Receive tailored recommendations and next steps for your care",
                    icon: Heart,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group relative bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors duration-300">
                      {item.step}
                    </div>
                    <div className="relative z-10">
                      <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
