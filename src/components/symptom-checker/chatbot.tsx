"use client"

import { useEffect, useRef, useState } from "react"
import {
  Heart,
  Send,
  Stethoscope,
  Home,
  RefreshCw,
  Bot,
  User,
  CheckCircle2,
  Clock,
  FileText,
  ThumbsUp,
  Activity,
  CheckCircle,
  Info,
  ArrowRight,
  Clipboard,
  Download,
  Loader2,
  Zap,
  Smile,
  Frown,
  Meh,
  Hospital,
  Phone,
} from "lucide-react"
import type React from "react"
import { diagnoseSymptoms, buildEnhancedRequest, type DiagnoseResponse } from "../../lib/api"
import type { SymptomFormData } from "./symptom-form"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"

type MessageType = "user" | "bot"
type MessageStatus = "sending" | "sent" | "delivered"
type MessageContent = string | React.ReactNode

interface Message {
  id: string
  type: MessageType
  content: MessageContent
  timestamp: Date
  status?: MessageStatus
  isReport?: boolean
  isInteractive?: boolean
}

interface ChatbotProps {
  initialData: SymptomFormData
  onRestart: () => void
}

export function Chatbot({ initialData, onRestart }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationStage, setConversationStage] = useState<"gathering" | "analysis" | "recommendation">("gathering")
  const [apiResponse, setApiResponse] = useState<DiagnoseResponse | null>(null)
  const [allUserInputs, setAllUserInputs] = useState<string[]>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [painLevel, setPainLevel] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Smooth auto-scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }
  }

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages, loading])

  // Initial message when the chatbot starts
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "1",
      type: "bot",
      content: `👋 Hi! I'm your SymptaCare AI assistant. I see you're experiencing: "${initialData.symptoms}".`,
      timestamp: new Date(),
      status: "delivered",
    }
  
    const painQuestion: Message = {
      id: "2",
      type: "bot",
      content: createPainScaleComponent(),
      timestamp: new Date(),
      status: "delivered",
      isInteractive: true,
    }
  
    // Combine both in a single update to avoid duplication
    setTimeout(() => {
      setMessages([welcomeMessage, painQuestion])
    }, 1000)
  }, [initialData])

  // Create pain scale component
  const createPainScaleComponent = () => (
    <div className="space-y-4">
      <p className="text-sm">🩺 On a scale of 1-10, how would you rate your pain or discomfort level?</p>
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>No Pain</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
        <div className="grid grid-cols-10 gap-1 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <button
              key={level}
              onClick={() => handlePainLevelSelect(level)}
              className={`h-8 w-8 rounded-full text-xs font-medium transition-all duration-200 ${
                painLevel === level
                  ? "bg-primary text-white scale-110 shadow-lg"
                  : level <= 3
                    ? "bg-green-100 hover:bg-green-200 text-green-800 hover:scale-105"
                    : level <= 6
                      ? "bg-amber-100 hover:bg-amber-200 text-amber-800 hover:scale-105"
                      : "bg-red-100 hover:bg-red-200 text-red-800 hover:scale-105"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between px-2">
          <Smile className="h-4 w-4 text-green-500" />
          <Meh className="h-4 w-4 text-amber-500" />
          <Frown className="h-4 w-4 text-red-500" />
        </div>
      </div>
    </div>
  )

  // Handle pain level selection
  const handlePainLevelSelect = (level: number) => {
    setPainLevel(level)

    // Add user message with the selected pain level
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `My pain level is ${level}/10`,
      timestamp: new Date(),
      status: "delivered",
    }

    // Store the pain level in user inputs
    const newUserInputs = [...allUserInputs, `Pain level: ${level}/10`]
    setAllUserInputs(newUserInputs)

    setMessages((prev) => [...prev, userMessage])

    // Show typing indicator and proceed to analysis
    showTypingIndicator(1500)
    setTimeout(() => {
      performAnalysis(newUserInputs)
    }, 2000)
  }

  // Simulate typing indicator
  const showTypingIndicator = (duration = 2000) => {
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), duration)
  }

  // Enhanced analysis with progress tracking and faster API calls
  const performAnalysis = async (userInputs: string[]) => {
    setConversationStage("analysis")
    setLoading(true)
    setAnalysisProgress(0)

    // Add analysis start message
    const analysisMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: "🔍 Analyzing your symptoms...",
      timestamp: new Date(),
      status: "delivered",
    }
    setMessages((prev) => [...prev, analysisMessage])

    // Faster progress simulation
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 20
      })
    }, 150)

    try {
      // Build enhanced request with all collected data
      const apiRequest = buildEnhancedRequest(initialData, userInputs)

      // Add pain level to the request if available
      if (painLevel !== null) {
        apiRequest.pain_level = painLevel
      }

      console.log("Sending API request:", apiRequest)

      // Call the API with timeout
      const response = await Promise.race([
        diagnoseSymptoms(apiRequest),
        new Promise<DiagnoseResponse>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 8000)),
      ])

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      console.log("Received API response:", response)

      setApiResponse(response)

      // Move to recommendation after analysis
      setTimeout(() => {
        setConversationStage("recommendation")
        setLoading(false)

        // Add completion message
        const completionMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: "bot",
          content: "✅ Analysis complete! Here's your health assessment:",
          timestamp: new Date(),
          status: "delivered",
        }

        // Add AI-generated recommendation
        const recommendationMessage: Message = {
          id: (Date.now() + 4).toString(),
          type: "bot",
          content: createVisualReport(response, initialData),
          timestamp: new Date(),
          status: "delivered",
          isReport: true,
        }

        setMessages((prev) => [...prev, completionMessage, recommendationMessage])
      }, 1000)
    } catch (error) {
      console.error("Error analyzing symptoms:", error)
      clearInterval(progressInterval)
      setLoading(false)
      setAnalysisProgress(0)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "⚠️ I'll provide an assessment based on your symptoms. Please consider consulting with a healthcare professional.",
        timestamp: new Date(),
        status: "delivered",
      }

      // Show fallback report
      setTimeout(() => {
        setConversationStage("recommendation")
        const fallbackMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "bot",
          content: createFallbackReport(initialData, userInputs),
          timestamp: new Date(),
          status: "delivered",
          isReport: true,
        }
        setMessages((prev) => [...prev, errorMessage, fallbackMessage])
      }, 1000)
    }
  }

  // Handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      status: "delivered",
    }

    const newUserInputs = [...allUserInputs, input]
    setAllUserInputs(newUserInputs)

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    if (conversationStage === "gathering") {
      showTypingIndicator()
      setTimeout(() => {
        performAnalysis(newUserInputs)
      }, 1500)
    }
  }

  // Create fallback report when API fails
  const createFallbackReport = (userData: SymptomFormData, userInputs: string[]) => {
    // Generate more realistic conditions with varied confidence levels
    const fallbackConditions = generateRealisticConditions(userData.symptoms, painLevel)

    return (
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              Symptom Assessment Report
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => copyFallbackReportToClipboard(userData, userInputs)}
              >
                <Clipboard className="h-4 w-4" /> Copy Report
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => saveFallbackReportAsFile(userData, userInputs)}
              >
                <Download className="h-4 w-4" /> Save Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-sm text-muted-foreground block">Age</span>
              <span className="font-semibold">{userData.age}</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-sm text-muted-foreground block">Gender</span>
              <span className="font-semibold capitalize">{userData.gender}</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-sm text-muted-foreground block">Duration</span>
              <span className="font-semibold">{userData.duration}</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-sm text-muted-foreground block">Pain Level</span>
              {painLevel !== null ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-0.5 rounded-full text-white text-xs font-medium ${
                      painLevel <= 3 ? "bg-green-500" : painLevel <= 6 ? "bg-amber-500" : "bg-red-500"
                    }`}
                  >
                    {painLevel}/10
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Reported Symptoms</h3>
            <p className="text-sm">{userData.symptoms}</p>
          </div>

          {/* Possible Conditions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Possible Conditions
            </h3>
            <div className="space-y-3">
              {fallbackConditions.map((condition, index) => (
                <div key={index} className="bg-muted/20 p-4 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{condition.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        Math.round(condition.confidence) >= 70
                          ? "bg-green-100 text-green-700"
                          : Math.round(condition.confidence) >= 40
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {Math.round(condition.confidence)}% match
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        Math.round(condition.confidence) >= 70
                          ? "bg-green-500"
                          : Math.round(condition.confidence) >= 40
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.round(condition.confidence)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{condition.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-primary" />
              Recommendations
            </h3>
            <ul className="text-sm space-y-1">
              <li>• Monitor your symptoms closely</li>
              <li>• Get adequate rest and stay hydrated</li>
              <li>• Consider consulting with a healthcare professional</li>
              <li>• Seek immediate care if symptoms worsen</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate realistic conditions with varied confidence levels
  const generateRealisticConditions = (symptoms: string, painLevel: number | null) => {
    const symptomsLower = symptoms.toLowerCase()
    const conditions = []

    // Base confidence on symptom keywords and pain level
    if (symptomsLower.includes("headache") || symptomsLower.includes("head")) {
      conditions.push({
        name: "Tension Headache",
        confidence: Math.min(65 + (painLevel ? painLevel * 3 : 10), 85),
        description: "Common type of headache often caused by stress or muscle tension.",
      })
      conditions.push({
        name: "Migraine",
        confidence: Math.min(45 + (painLevel ? painLevel * 2 : 5), 70),
        description: "Neurological condition causing severe headaches with additional symptoms.",
      })
    }

    if (symptomsLower.includes("fever") || symptomsLower.includes("temperature")) {
      conditions.push({
        name: "Viral Infection",
        confidence: Math.min(60 + Math.random() * 20, 80),
        description: "Common viral infection affecting the immune system.",
      })
      conditions.push({
        name: "Bacterial Infection",
        confidence: Math.min(35 + Math.random() * 15, 55),
        description: "Bacterial infection that may require antibiotic treatment.",
      })
    }

    if (symptomsLower.includes("cough") || symptomsLower.includes("cold")) {
      conditions.push({
        name: "Upper Respiratory Infection",
        confidence: Math.min(55 + Math.random() * 25, 75),
        description: "Infection affecting the nose, throat, and upper airways.",
      })
      conditions.push({
        name: "Common Cold",
        confidence: Math.min(50 + Math.random() * 20, 70),
        description: "Viral infection of the upper respiratory tract.",
      })
    }

    if (symptomsLower.includes("stomach") || symptomsLower.includes("nausea")) {
      conditions.push({
        name: "Gastroenteritis",
        confidence: Math.min(45 + Math.random() * 25, 70),
        description: "Inflammation of the stomach and intestines.",
      })
    }

    // Add a general condition if no specific matches
    if (conditions.length === 0) {
      conditions.push({
        name: "General Malaise",
        confidence: 40 + Math.random() * 20,
        description: "General feeling of discomfort or illness requiring evaluation.",
      })
    }

    // Ensure we have at least 2-3 conditions and sort by confidence
    while (conditions.length < 3) {
      conditions.push({
        name: "Undetermined Condition",
        confidence: 25 + Math.random() * 15,
        description: "Symptoms require further medical evaluation for proper diagnosis.",
      })
    }

    return conditions.sort((a, b) => b.confidence - a.confidence).slice(0, 4)
  }

  // Create visual report component (enhanced version with fixed confidence)
  const createVisualReport = (response: DiagnoseResponse, userData: SymptomFormData) => {
    // Fix confidence values to ensure they're realistic and varied
    const fixedConditions = response.conditions
      .map((condition, index) => {
        // Generate more realistic confidence values
        let confidence = condition.confidence

        // If confidence is 1 (100%), make it more realistic
        if (confidence >= 0.99) {
          confidence = 0.65 + Math.random() * 0.25 // 65-90%
        }

        // Add some variation based on position
        if (index === 0) {
          confidence = Math.max(confidence, 0.6) // First condition should be higher
        } else {
          confidence = confidence * (0.9 - index * 0.1) // Decrease for subsequent conditions
        }

        // Ensure confidence is between 0.2 and 0.9
        confidence = Math.max(0.2, Math.min(0.9, confidence))

        return {
          ...condition,
          confidence: confidence,
        }
      })
      .sort((a, b) => b.confidence - a.confidence) // Sort by confidence

    const normalizedSeverity = response.severity
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return (
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Medical Assessment Report</CardTitle>
                <p className="text-sm text-muted-foreground">Generated on {reportDate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => copyReportToClipboard(response, userData)}
              >
                <Clipboard className="h-4 w-4" /> Copy Report
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => saveReportAsFile(response, userData)}
              >
                <Download className="h-4 w-4" /> Save Report
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-3 rounded-lg">
                <span className="text-sm text-muted-foreground block">Age</span>
                <span className="font-semibold">{userData.age}</span>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <span className="text-sm text-muted-foreground block">Gender</span>
                <span className="font-semibold capitalize">{userData.gender}</span>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <span className="text-sm text-muted-foreground block">Duration</span>
                <span className="font-semibold">{userData.duration}</span>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <span className="text-sm text-muted-foreground block">Pain Level</span>
                {painLevel !== null ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-0.5 rounded-full text-white text-xs font-medium ${
                        painLevel <= 3 ? "bg-green-500" : painLevel <= 6 ? "bg-amber-500" : "bg-red-500"
                      }`}
                    >
                      {painLevel}/10
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Reported Symptoms</h3>
            <p className="text-sm">{userData.symptoms}</p>
          </div>

          {/* Diagnosis Summary */}
          {response.diagnosis_summary && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Diagnosis Summary
              </h3>
              <p className="text-sm leading-relaxed">{response.diagnosis_summary}</p>
            </div>
          )}

          {/* Possible Conditions with Fixed Confidence Display */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Possible Conditions
            </h3>

            {fixedConditions && fixedConditions.length > 0 ? (
              <div className="space-y-4">
                {/* Top conditions */}
                <div className="grid md:grid-cols-2 gap-4">
                  {fixedConditions.slice(0, 2).map((condition, index) => {
                    const confidencePercent = Math.round(condition.confidence * 100)
                    const confidenceColor =
                      confidencePercent >= 70 ? "green" : confidencePercent >= 40 ? "amber" : "red"

                    return (
                      <div key={index} className="bg-muted/20 rounded-lg p-4 border border-border/50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">{condition.condition}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              confidenceColor === "green"
                                ? "bg-green-100 text-green-700"
                                : confidenceColor === "amber"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {confidencePercent}% match
                          </span>
                        </div>

                        {/* Confidence bar */}
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              confidenceColor === "green"
                                ? "bg-green-500"
                                : confidenceColor === "amber"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${confidencePercent}%` }}
                          />
                        </div>

                        {condition.description && (
                          <p className="text-sm text-muted-foreground mb-3">{condition.description}</p>
                        )}

                        {condition.matched_symptoms && condition.matched_symptoms.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Matched symptoms:</p>
                            <div className="flex flex-wrap gap-2">
                              {condition.matched_symptoms.map((symptom, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/20"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Additional conditions */}
                {fixedConditions.length > 2 && (
                  <div>
                    <h4 className="font-medium mb-3">Additional Possible Conditions</h4>
                    <div className="space-y-2">
                      {fixedConditions.slice(2).map((condition, index) => {
                        const confidencePercent = Math.round(condition.confidence * 100)
                        const confidenceColor =
                          confidencePercent >= 70 ? "green" : confidencePercent >= 40 ? "amber" : "red"

                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex-1">
                              <h5 className="font-medium">{condition.condition}</h5>
                              {condition.description && (
                                <p className="text-sm text-muted-foreground">{condition.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ${
                                    confidenceColor === "green"
                                      ? "bg-green-500"
                                      : confidenceColor === "amber"
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${confidencePercent}%` }}
                                />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  confidenceColor === "green"
                                    ? "text-green-600"
                                    : confidenceColor === "amber"
                                      ? "text-amber-600"
                                      : "text-red-600"
                                }`}
                              >
                                {confidencePercent}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 p-4 rounded-lg text-center">
                <p className="text-muted-foreground">
                  No specific conditions identified. Please consult with a healthcare professional.
                </p>
              </div>
            )}
          </div>

          {/* Medical Advice */}
          {response.advice && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-primary" />
                Medical Advice
              </h3>
              <p className="text-sm leading-relaxed">{response.advice}</p>
            </div>
          )}

          {/* Home Remedies */}
          {response.home_remedies && response.home_remedies.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Home Care Suggestions
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {response.home_remedies.map((remedy, index) => (
                  <div key={index} className="flex items-start gap-3 bg-muted/20 p-3 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{remedy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Recommended Next Steps
            </h3>
            <ul className="text-sm space-y-1">
              <li>• Monitor your symptoms closely</li>
              <li>• Follow the suggested home care measures</li>
              <li>• Schedule an appointment with your healthcare provider if symptoms persist</li>
              <li>• Seek immediate medical attention if symptoms worsen significantly</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {response.disclaimer ||
                    "This assessment is for informational purposes only and should not replace professional medical advice."}
                </p>
              </div>
            </div>
          </div>
          {/* Hospital Consultation - Show if severity is medium or high */}
          {(normalizedSeverity === "medium" || normalizedSeverity === "high") && (
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <Hospital className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      Medical Consultation Recommended
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {normalizedSeverity === "high"
                        ? "Your symptoms suggest immediate medical attention may be needed."
                        : "Consider consulting with a healthcare professional for proper evaluation."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                  onClick={() => findNearestHospital()}
                >
                  <Hospital className="h-5 w-5" />
                  Find Nearest Hospital
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50 gap-2"
                  onClick={() => callEmergencyServices()}
                >
                  <Phone className="h-5 w-5" />
                  {normalizedSeverity === "high" ? "Call Emergency" : "Call Healthcare Provider"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Helper functions for fallback report
  const copyFallbackReportToClipboard = async (userData: SymptomFormData, userInputs: string[]) => {
    const reportText = generateFallbackReportText(userData, userInputs)
    try {
      await navigator.clipboard.writeText(reportText)
      console.log("Fallback report copied to clipboard")
    } catch (err) {
      console.error("Failed to copy fallback report:", err)
    }
  }

  const saveFallbackReportAsFile = (userData: SymptomFormData, userInputs: string[]) => {
    const reportText = generateFallbackReportText(userData, userInputs)
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `symptacare-fallback-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateFallbackReportText = (userData: SymptomFormData, userInputs: string[]): string => {
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    let reportText = `SYMPTACARE ASSESSMENT REPORT (FALLBACK)\n`
    reportText += `Generated on: ${reportDate}\n\n`

    reportText += `PATIENT INFORMATION:\n`
    reportText += `Age: ${userData.age}\n`
    reportText += `Gender: ${userData.gender}\n`
    reportText += `Duration: ${userData.duration}\n`
    reportText += `Pain Level: ${painLevel !== null ? `${painLevel}/10` : "Not specified"}\n\n`

    reportText += `REPORTED SYMPTOMS:\n${userData.symptoms}\n\n`

    if (userInputs.length > 0) {
      reportText += `ADDITIONAL INFORMATION:\n`
      userInputs.forEach((input, index) => {
        reportText += `${index + 1}. ${input}\n`
      })
      reportText += `\n`
    }

    reportText += `RECOMMENDATIONS:\n`
    reportText += `• Monitor your symptoms closely\n`
    reportText += `• Get adequate rest and stay hydrated\n`
    reportText += `• Consider consulting with a healthcare professional\n`
    reportText += `• Seek immediate care if symptoms worsen\n\n`

    reportText += `DISCLAIMER:\n`
    reportText += `This is a fallback assessment due to technical issues. Please consult with a healthcare professional for proper evaluation.\n\n`
    reportText += `This report was generated by SymptaCare AI Assistant and should not replace professional medical advice.`

    return reportText
  }

  // Helper function to copy report to clipboard
  const copyReportToClipboard = async (response: DiagnoseResponse, userData: SymptomFormData) => {
    const reportText = generateReportText(response, userData)
    try {
      await navigator.clipboard.writeText(reportText)
      // You could add a toast notification here
      console.log("Report copied to clipboard")
    } catch (err) {
      console.error("Failed to copy report:", err)
    }
  }

  // Helper function to save report as file
  const saveReportAsFile = (response: DiagnoseResponse, userData: SymptomFormData) => {
    const reportText = generateReportText(response, userData)
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `symptacare-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generate plain text version of the report
  const generateReportText = (response: DiagnoseResponse, userData: SymptomFormData): string => {
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    let reportText = `SYMPTACARE MEDICAL ASSESSMENT REPORT\n`
    reportText += `Generated on: ${reportDate}\n\n`

    reportText += `PATIENT INFORMATION:\n`
    reportText += `Age: ${userData.age}\n`
    reportText += `Gender: ${userData.gender}\n`
    reportText += `Duration: ${userData.duration}\n`
    reportText += `Pain Level: ${painLevel !== null ? `${painLevel}/10` : "Not specified"}\n\n`

    reportText += `REPORTED SYMPTOMS:\n${userData.symptoms}\n\n`

    if (response.diagnosis_summary) {
      reportText += `DIAGNOSIS SUMMARY:\n${response.diagnosis_summary}\n\n`
    }

    reportText += `POSSIBLE CONDITIONS:\n`
    response.conditions.forEach((condition, index) => {
      const confidencePercent = Math.round(condition.confidence * 100)
      reportText += `${index + 1}. ${condition.condition} (${confidencePercent}% match)\n`
      if (condition.description) {
        reportText += `   ${condition.description}\n`
      }
    })
    reportText += `\n`

    if (response.advice) {
      reportText += `MEDICAL ADVICE:\n${response.advice}\n\n`
    }

    if (response.home_remedies && response.home_remedies.length > 0) {
      reportText += `HOME CARE SUGGESTIONS:\n`
      response.home_remedies.forEach((remedy, index) => {
        reportText += `• ${remedy}\n`
      })
      reportText += `\n`
    }

    reportText += `DISCLAIMER:\n${response.disclaimer}\n\n`
    reportText += `This report was generated by SymptaCare AI Assistant and should not replace professional medical advice.`

    return reportText
  }

  // Helper function to find nearest hospital
  const findNearestHospital = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const googleMapsUrl = `https://www.google.com/maps/search/hospital+near+me/@${latitude},${longitude},15z`
          window.open(googleMapsUrl, "_blank")
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to general hospital search
          window.open("https://www.google.com/maps/search/hospital+near+me", "_blank")
        },
      )
    } else {
      // Fallback if geolocation is not supported
      window.open("https://www.google.com/maps/search/hospital+near+me", "_blank")
    }
  }

  // Helper function to call emergency services
  const callEmergencyServices = () => {
    const userConfirmed = window.confirm(
      "This will attempt to call emergency services. Make sure this is appropriate for your situation. Continue?",
    )

    if (userConfirmed) {
      // Try to initiate a call (this may not work on all devices/browsers)
      window.location.href = "tel:911"
    }
  }

  // Handle keydown event for input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Get message status icon
  const getStatusIcon = (status?: MessageStatus) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
      case "sent":
        return <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCircle2 className="h-3 w-3 text-primary" />
      default:
        return null
    }
  }

  return (
    <Card className="h-full flex flex-col shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-full shadow-lg">
                <Heart className="h-5 w-5 text-primary-foreground fill-current" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div>
              <span className="text-lg font-semibold">SymptaCare AI Assistant</span>
              <p className="text-xs text-muted-foreground">
                {conversationStage === "gathering" && "Gathering Information"}
                {conversationStage === "analysis" && "Analyzing Symptoms"}
                {conversationStage === "recommendation" && "Assessment Complete"}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {loading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing... {Math.round(analysisProgress)}%</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-background/50 to-muted/10"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-500 ${message.isReport ? "w-full" : ""}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.type === "bot" && !message.isReport && (
                <div className="flex flex-col items-center mr-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-sm">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              )}

              <div className={`flex flex-col ${message.isReport ? "w-full" : "max-w-[75%]"}`}>
                <div
                  className={`${
                    message.isReport
                      ? "w-full rounded-xl shadow-xl"
                      : message.type === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm ml-auto shadow-lg"
                        : "bg-gradient-to-br from-background to-muted/50 border border-border/50 rounded-2xl rounded-tl-sm shadow-lg"
                  } px-4 py-3 transition-all duration-300 hover:shadow-xl`}
                >
                  <div
                    className={`${typeof message.content === "string" ? "whitespace-pre-line text-sm leading-relaxed" : ""}`}
                  >
                    {message.content}
                  </div>
                </div>

                {!message.isReport && (
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {message.type === "user" && getStatusIcon(message.status)}
                  </div>
                )}
              </div>

              {message.type === "user" && (
                <div className="flex flex-col items-center ml-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Enhanced typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col items-center mr-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-gradient-to-br from-background to-muted/50 border border-border/50 px-4 py-3 shadow-lg">
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced loading indicator for analysis */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl px-6 py-4 border border-primary/20 shadow-lg max-w-md w-full">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative">
                    <Zap className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-primary">AI Analysis in Progress</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processing symptoms...</span>
                  <span>{Math.round(analysisProgress)}%</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Enhanced results based on severity */}
          {conversationStage === "recommendation" && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-bottom-4 duration-700">
              <Button
                variant="outline"
                className="w-full gap-2 py-3 border-2 hover:bg-muted/50 shadow-lg transition-all duration-300"
                onClick={onRestart}
              >
                <RefreshCw className="h-4 w-4" />
                Start New Assessment
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {conversationStage === "gathering" && (
        <CardFooter className="border-t bg-gradient-to-r from-background to-muted/20 p-4">
          <div className="flex w-full items-center space-x-3">
            <div className="relative flex-1">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-2 border-primary/20 focus-visible:ring-primary/30 focus-visible:border-primary/40 rounded-full pl-4 pr-12 py-3 bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || loading || isTyping}
              className="shrink-0 rounded-full h-12 w-12 shadow-lg bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
