"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import type { UserProfile } from "../../lib/auth-context"
import {
  User,
  Calendar,
  Users,
  Clock,
  FileText,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Activity,
} from "lucide-react"

const symptomSchema = z.object({
  symptoms: z.string().min(5, { message: "Please describe your symptoms in more detail" }),
  age: z.string().min(1, { message: "Please enter your age" }),
  gender: z.string().min(1, { message: "Please select your gender" }),
  duration: z.string().min(1, { message: "Please specify how long you've had these symptoms" }),
})

export type SymptomFormData = z.infer<typeof symptomSchema>

interface SymptomFormProps {
  onSubmit: (data: SymptomFormData) => void
  userData?: UserProfile
}

export function SymptomForm({ onSubmit, userData }: SymptomFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    control,
  } = useForm<SymptomFormData>({
    resolver: zodResolver(symptomSchema),
    mode: "onChange",
    defaultValues: {
      symptoms: "",
      age: "",
      gender: "",
      duration: "",
    },
  })

  const watchedValues = watch()

  // Set user data from profile if available
  useEffect(() => {
    if (userData) {
      if (userData.age) {
        setValue("age", userData.age.toString())
      }
      if (userData.gender) {
        setValue("gender", userData.gender)
      }
    }
  }, [userData, setValue])

  const processSubmit = (data: SymptomFormData) => {
    setIsSubmitting(true)
    // Simulate a delay to show loading state
    setTimeout(() => {
      onSubmit(data)
      setIsSubmitting(false)
    }, 1500)
  }

  const getFieldIcon = (fieldName: string) => {
    switch (fieldName) {
      case "symptoms":
        return FileText
      case "age":
        return Calendar
      case "gender":
        return Users
      case "duration":
        return Clock
      default:
        return User
    }
  }

  const getCompletionPercentage = () => {
    const fields = Object.values(watchedValues)
    const completedFields = fields.filter((field) => field && field.trim() !== "").length
    return Math.round((completedFields / fields.length) * 100)
  }

  const isFieldCompleted = (fieldName: keyof SymptomFormData) => {
    return watchedValues[fieldName] && watchedValues[fieldName].trim() !== ""
  }

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Assessment Progress</h3>
              <p className="text-sm text-muted-foreground">Complete all fields for accurate analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{getCompletionPercentage()}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(processSubmit)} className="space-y-8">
        {/* Symptoms Section */}
        <div className="group relative">
          <div
            className={`bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border-2 transition-all duration-300 ${
              focusedField === "symptoms"
                ? "border-primary/50 shadow-lg shadow-primary/10"
                : isFieldCompleted("symptoms")
                  ? "border-green-500/50 shadow-lg shadow-green-500/10"
                  : errors.symptoms
                    ? "border-red-500/50 shadow-lg shadow-red-500/10"
                    : "border-border/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-full transition-all duration-300 ${
                  isFieldCompleted("symptoms") ? "bg-green-500/20" : "bg-primary/20"
                }`}
              >
                {isFieldCompleted("symptoms") ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <FileText className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="symptoms" className="block text-lg font-semibold mb-1">
                  Describe Your Symptoms
                </label>
                <p className="text-responsive-sm text-muted-foreground">
                  Be as detailed as possible about what you're experiencing
                </p>
              </div>
              {isFieldCompleted("symptoms") && <Sparkles className="h-5 w-5 text-green-500 animate-pulse" />}
            </div>

            <Textarea
              id="symptoms"
              placeholder="Please describe your symptoms in detail. For example: fever, headache, cough, when they started, how severe they are, etc."
              className={`min-h-32 resize-y text-base transition-all duration-300 ${
                focusedField === "symptoms" ? "ring-2 ring-primary/20" : ""
              }`}
              onFocus={() => setFocusedField("symptoms")}
              {...register("symptoms")}
            />

            {errors.symptoms && (
              <div className="flex items-center gap-2 mt-3 text-red-500 animate-in slide-in-from-top duration-300">
                <AlertCircle className="h-4 w-4" />
                <p className="text-responsive-sm">{errors.symptoms.message}</p>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-responsive-xs text-muted-foreground">
              <span>Minimum 5 characters required</span>
              <span>{watchedValues.symptoms?.length || 0} characters</span>
            </div>
          </div>
        </div>

        {/* Personal Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Age Field */}
          <div className="group relative">
            <div
              className={`bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border-2 transition-all duration-300 ${
                focusedField === "age"
                  ? "border-primary/50 shadow-lg shadow-primary/10"
                  : isFieldCompleted("age")
                    ? "border-green-500/50 shadow-lg shadow-green-500/10"
                    : errors.age
                      ? "border-red-500/50 shadow-lg shadow-red-500/10"
                      : "border-border/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isFieldCompleted("age") ? "bg-green-500/20" : "bg-primary/20"
                  }`}
                >
                  {isFieldCompleted("age") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Calendar className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="age" className="block text-base font-semibold">
                    Age {userData?.age && <span className="text-responsive-xs text-muted-foreground">(From profile)</span>}
                  </label>
                </div>
                {isFieldCompleted("age") && <Sparkles className="h-4 w-4 text-green-500 animate-pulse" />}
              </div>

              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                className={`text-base transition-all duration-300 ${
                  focusedField === "age" ? "ring-2 ring-primary/20" : ""
                } ${userData?.age ? "bg-muted/50" : ""}`}
                onFocus={() => setFocusedField("age")}
                disabled={!!userData?.age}
                {...register("age")}
              />

              {errors.age && (
                <div className="flex items-center gap-2 mt-2 text-red-500 animate-in slide-in-from-top duration-300">
                  <AlertCircle className="h-3 w-3" />
                  <p className="text-responsive-xs">{errors.age.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Gender Field */}
          <div className="group relative">
            <div
              className={`bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border-2 transition-all duration-300 ${
                focusedField === "gender"
                  ? "border-primary/50 shadow-lg shadow-primary/10"
                  : isFieldCompleted("gender")
                    ? "border-green-500/50 shadow-lg shadow-green-500/10"
                    : errors.gender
                      ? "border-red-500/50 shadow-lg shadow-red-500/10"
                      : "border-border/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isFieldCompleted("gender") ? "bg-green-500/20" : "bg-primary/20"
                  }`}
                >
                  {isFieldCompleted("gender") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Users className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="gender" className="block text-base font-semibold">
                    Gender {userData?.gender && <span className="text-responsive-xs text-muted-foreground">(From profile)</span>}
                  </label>
                </div>
                {isFieldCompleted("gender") && <Sparkles className="h-4 w-4 text-green-500 animate-pulse" />}
              </div>

              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!!userData?.gender}
                    onOpenChange={(open) => {
                      if (open) {
                        setFocusedField("gender")
                      } else {
                        setFocusedField(null)
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`text-base transition-all duration-300 ${
                        focusedField === "gender" ? "ring-2 ring-primary/20" : ""
                      } ${userData?.gender ? "bg-muted/50" : ""}`}
                    >
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.gender && (
                <div className="flex items-center gap-2 mt-2 text-red-500 animate-in slide-in-from-top duration-300">
                  <AlertCircle className="h-3 w-3" />
                  <p className="text-responsive-xs">{errors.gender.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Duration Field */}
          <div className="group relative">
            <div
              className={`bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border-2 transition-all duration-300 ${
                focusedField === "duration"
                  ? "border-primary/50 shadow-lg shadow-primary/10"
                  : isFieldCompleted("duration")
                    ? "border-green-500/50 shadow-lg shadow-green-500/10"
                    : errors.duration
                      ? "border-red-500/50 shadow-lg shadow-red-500/10"
                      : "border-border/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isFieldCompleted("duration") ? "bg-green-500/20" : "bg-primary/20"
                  }`}
                >
                  {isFieldCompleted("duration") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="duration" className="block text-base font-semibold">
                    Duration
                  </label>
                </div>
                {isFieldCompleted("duration") && <Sparkles className="h-4 w-4 text-green-500 animate-pulse" />}
              </div>

              <Input
                id="duration"
                placeholder="e.g., 2 days, 1 week"
                className={`text-base transition-all duration-300 ${
                  focusedField === "duration" ? "ring-2 ring-primary/20" : ""
                }`}
                onFocus={() => setFocusedField("duration")}
                {...register("duration")}
              />

              {errors.duration && (
                <div className="flex items-center gap-2 mt-2 text-red-500 animate-in slide-in-from-top duration-300">
                  <AlertCircle className="h-3 w-3" />
                  <p className="text-responsive-xs">{errors.duration.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`w-full group gap-3 py-4 text-lg font-semibold transition-all duration-500 transform ${
              isSubmitting
                ? "bg-primary/50 cursor-not-allowed"
                : isValid
                  ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:scale-105"
                  : "bg-muted cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing symptoms...
              </>
            ) : (
              <>
                <Stethoscope className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Start AI Analysis
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </Button>

          {!isValid && (
            <p className="text-center text-responsive-sm text-muted-foreground mt-3">
              Please complete all required fields to continue
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
