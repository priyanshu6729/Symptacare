"use client"

import { useEffect, useRef, useState } from "react"
import {
  Heart,
  Send,
  AlertCircle,
  Stethoscope,
  Home,
  RefreshCw,
  Bot,
  User,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  ThumbsUp,
  Activity,
  Pill,
  CheckCircle,
  Info,
  ArrowRight,
  Clipboard,
  Download,
} from "lucide-react"
import type React from "react"
import { diagnoseSymptoms, mapGenderForAPI, normalizeSeverity, type DiagnoseResponse } from "../../lib/api"
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
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | null>(null)
  const [apiResponse, setApiResponse] = useState<DiagnoseResponse | null>(null)
  const [allUserInputs, setAllUserInputs] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Smooth auto-scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
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
      content: `👋 Hi there! I'm your SymptaCare AI assistant. I see you're experiencing: "${initialData.symptoms}".`,
      timestamp: new Date(),
      status: "delivered",
    }

    const firstQuestion: Message = {
      id: "2",
      type: "bot",
      content:
        "🩺 Let me ask you a few questions to better understand your condition. Are you experiencing any pain? If yes, on a scale of 1-10, how would you rate it?",
      timestamp: new Date(),
      status: "delivered",
    }

    // Add messages with a slight delay for better UX
    setTimeout(() => setMessages([welcomeMessage]), 500)
    setTimeout(() => setMessages((prev) => [...prev, firstQuestion]), 1500)
  }, [initialData])

  // Simulate typing indicator
  const showTypingIndicator = (duration = 2000) => {
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), duration)
  }

  // Handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return

    // Add user message with sending status
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      status: "sending",
    }

    // Store all user inputs for API call
    const newUserInputs = [...allUserInputs, input]
    setAllUserInputs(newUserInputs)

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Update message status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" as MessageStatus } : msg)),
      )
    }, 500)

    // Update to delivered
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" as MessageStatus } : msg)),
      )
    }, 1000)

    try {
      if (conversationStage === "gathering") {
        showTypingIndicator()

        // After collecting 1 response, proceed to analysis (change from >= 2 to >= 1)
        if (newUserInputs.length >= 1) {
          setTimeout(() => {
            setConversationStage("analysis")
            setLoading(true)

            // Add analysis message
            const analysisMessage: Message = {
              id: (Date.now() + 1).toString(),
              type: "bot",
              content: "⏳ Thank you for the information. I'm analyzing your symptoms now...",
              timestamp: new Date(),
              status: "delivered",
            }
            setMessages((prev) => [...prev, analysisMessage])

            // Prepare the combined input for API
            const combinedInput = `Initial symptoms: ${initialData.symptoms}. Additional details: ${newUserInputs.join(". ")}`

            const apiRequest = {
              age: Number.parseInt(initialData.age),
              gender: mapGenderForAPI(initialData.gender),
              input: combinedInput,
            }

            // Call the API
            diagnoseSymptoms(apiRequest)
              .then((response) => {
                setApiResponse(response)
                const normalizedSeverity = normalizeSeverity(response.severity)
                setSeverity(normalizedSeverity)

                // Move to recommendation after analysis
                setTimeout(() => {
                  setConversationStage("recommendation")
                  setLoading(false)

                  // Add AI-generated recommendation
                  const recommendationMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    type: "bot",
                    content: createVisualReport(response, initialData),
                    timestamp: new Date(),
                    status: "delivered",
                    isReport: true,
                  }

                  setMessages((prev) => [...prev, recommendationMessage])
                }, 2000)
              })
              .catch((error) => {
                console.error("Error analyzing symptoms:", error)
                setLoading(false)
                const errorMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  type: "bot",
                  content:
                    "❌ I'm sorry, there was an error analyzing your symptoms. Please try again or consult with a healthcare professional directly.",
                  timestamp: new Date(),
                  status: "delivered",
                }
                setMessages((prev) => [...prev, errorMessage])
                setConversationStage("gathering")
              })
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Error in conversation flow:", error)
    }
  }

  // Get next question based on conversation state
  const getNextQuestion = (questionCount: number): string => {
    switch (questionCount) {
      case 1:
        return "🤔 Have you noticed when these symptoms started? Are they getting better, worse, or staying the same?"
      case 2:
        return "💊 Have you tried any medications, treatments, or remedies for these symptoms?"
      default:
        return "📝 Is there anything else important about your symptoms that I should know?"
    }
  }

  // Create visual report component
  const createVisualReport = (response: DiagnoseResponse, userData: SymptomFormData) => {
    const normalizedSeverity = normalizeSeverity(response.severity)

    // Get severity color and icon
    const getSeverityInfo = (severity: string) => {
      switch (severity) {
        case "low":
          return { color: "green", icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "Low" }
        case "medium":
          return { color: "amber", icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, text: "Medium" }
        case "high":
          return { color: "red", icon: <AlertCircle className="h-5 w-5 text-red-500" />, text: "High" }
        default:
          return { color: "green", icon: <Info className="h-5 w-5 text-blue-500" />, text: "Unknown" }
      }
    }

    const severityInfo = getSeverityInfo(normalizedSeverity)

    // Format confidence score as percentage and get color
    const getConfidenceColor = (score: number) => {
      if (score >= 0.7) return "bg-green-500"
      if (score >= 0.4) return "bg-amber-500"
      return "bg-red-500"
    }

    // Get current date for report
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-t-xl p-4 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Medical Assessment Report</h2>
                <p className="text-xs text-muted-foreground">Generated on {reportDate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
                <Clipboard className="h-3 w-3" /> Copy
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
                <Download className="h-3 w-3" /> Save
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-background/80 p-4 border-b border-border/50">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Age:</span> {userData.age}
            </div>
            <div>
              <span className="text-muted-foreground">Gender:</span> {userData.gender}
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Reported Symptoms:</span> {userData.symptoms}
            </div>
          </div>
        </div>

        {/* Diagnosis Summary */}
        {response.diagnosis_summary && (
          <div className="bg-background/80 p-4 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Diagnosis Summary</h3>
            </div>
            <p className="text-sm">{response.diagnosis_summary}</p>
          </div>
        )}

        {/* Severity Indicator */}
        <div className="bg-background/80 p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Severity Level</h3>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium bg-${severityInfo.color}-100 text-${severityInfo.color}-700 border border-${severityInfo.color}-200 flex items-center gap-1`}
            >
              {severityInfo.icon}
              {severityInfo.text}
            </div>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                normalizedSeverity === "low"
                  ? "bg-green-500 w-1/3"
                  : normalizedSeverity === "medium"
                    ? "bg-amber-500 w-2/3"
                    : "bg-red-500 w-full"
              }`}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Possible Conditions */}
        {response.conditions && response.conditions.length > 0 && (
          <div className="bg-background/80 p-4 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Possible Conditions</h3>
            </div>

            <div className="space-y-3">
              {response.conditions.map((condition, index) => {
                const confidencePercent = Math.round(condition.confidence*10)
                const confidenceColor = getConfidenceColor(condition.confidence)

                return (
                  <div key={index} className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{condition.condition}</h4>
                      <div className="text-xs px-2 py-1 rounded-full bg-background border border-border/50">
                        Match: {confidencePercent}%
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${confidenceColor}`} style={{ width: `${confidencePercent}%` }}></div>
                    </div>

                    {/* Matched symptoms */}
                    {condition.matched_symptoms && condition.matched_symptoms.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Matched symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {condition.matched_symptoms.map((symptom, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20"
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
          </div>
        )}

        {/* Medical Advice */}
        {response.advice && (
          <div className="bg-background/80 p-4 border-b border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Medical Advice</h3>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm">{response.advice}</p>
            </div>
          </div>
        )}

        {/* Home Remedies */}
        {response.home_remedies && response.home_remedies.length > 0 && (
          <div className="bg-background/80 p-4 border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Home Care Suggestions</h3>
            </div>

            <div className="space-y-2">
              {response.home_remedies.map((remedy, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm">{remedy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-background/80 p-4 rounded-b-xl">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Recommended Next Steps</h3>
          </div>

          {normalizedSeverity === "high" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertCircle className="h-4 w-4" />
                <p className="font-medium">Seek immediate medical attention</p>
              </div>
              <p className="text-xs text-red-600">
                Your symptoms suggest a potentially serious condition that requires prompt medical evaluation.
              </p>
            </div>
          )}

          {normalizedSeverity === "medium" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <p className="font-medium">Schedule a doctor's appointment</p>
              </div>
              <p className="text-xs text-amber-600">
                Your symptoms should be evaluated by a healthcare professional within the next 1-2 days.
              </p>
            </div>
          )}

          {normalizedSeverity === "low" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <Home className="h-4 w-4" />
                <p className="font-medium">Monitor symptoms at home</p>
              </div>
              <p className="text-xs text-green-600">
                Your symptoms appear mild and can likely be managed with home care. Seek medical attention if they
                worsen.
              </p>
            </div>
          )}

          {/* Disclaimer */}
          {response.disclaimer && (
            <div className="mt-4 bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">{response.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
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
    <Card className="h-[600px] flex flex-col shadow-2xl border-0 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
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
              <p className="text-xs text-muted-foreground">Online • Ready to help</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {conversationStage === "gathering" && "Gathering Information"}
            {conversationStage === "analysis" && "Analyzing Symptoms"}
            {conversationStage === "recommendation" && "Report Ready"}
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
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-6 py-3 border border-primary/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <span className="text-sm font-medium text-primary">Analyzing your symptoms...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Enhanced results based on severity */}
          {conversationStage === "recommendation" && severity && (
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
