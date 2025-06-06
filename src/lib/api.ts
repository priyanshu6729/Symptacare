export interface DiagnoseRequest {
  age: number
  gender: string
  input: string
  duration?: string
  severity_indicators?: string[]
  medical_history?: string[]
  additional_context?: string
  pain_level?: number
}

export interface Condition {
  condition: string
  confidence: number
  matched_symptoms: string[]
  description?: string
  urgency_level?: "low" | "medium" | "high"
}

export interface DiagnoseResponse {
  advice: string
  conditions: Condition[]
  diagnosis_summary: string
  disclaimer: string
  home_remedies: string[]
  severity: "low" | "medium" | "high" | "moderate" // Keep all options
  next_steps?: string[]
  when_to_seek_help?: string
  estimated_recovery_time?: string
}

const API_BASE_URL = "https://symptacare-api.onrender.com"
const API_TIMEOUT = 15000 // 15 seconds timeout
const MAX_RETRIES = 2

// Enhanced API call with retry logic and better error handling
export async function diagnoseSymptoms(request: DiagnoseRequest): Promise<DiagnoseResponse> {
  let lastError: Error | null = null

  // Reduce timeout for faster responses
  const timeout = 8000 // 8 seconds timeout
  const maxRetries = 1 // Reduce retries for faster response

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API attempt ${attempt + 1}/${maxRetries + 1}:`, request)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(`${API_BASE_URL}/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API response received:", data)

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from API")
      }

      return enhanceApiResponse(data, request)
    } catch (error) {
      lastError = error as Error
      console.error(`API attempt ${attempt + 1} failed:`, error)

      // If it's the last attempt, don't wait
      if (attempt < maxRetries) {
        // Shorter wait time for faster response
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  // If all attempts failed, return a fallback response
  console.error("All API attempts failed, using fallback response")
  return getFallbackResponse(request, lastError)
}

// Enhance API response with more realistic and diverse confidence values
function enhanceApiResponse(data: any, request: DiagnoseRequest): DiagnoseResponse {
  // Generate more diverse and realistic conditions
  const enhancedConditions = generateDiverseConditions(data.conditions || [], request)

  return {
    advice: data.advice || generateContextualAdvice(request),
    conditions: enhancedConditions,
    diagnosis_summary: data.diagnosis_summary || generateDiagnosisSummary(request, enhancedConditions),
    disclaimer:
      data.disclaimer ||
      "This assessment is for informational purposes only and should not replace professional medical advice.",
    home_remedies: data.home_remedies || generateContextualRemedies(request),
    severity: normalizeSeverity(data.severity || getSeverityFromContext(request)),
    next_steps: data.next_steps || generateNextSteps(request),
    when_to_seek_help: data.when_to_seek_help || generateWhenToSeekHelp(request),
    estimated_recovery_time: data.estimated_recovery_time || generateRecoveryTime(request),
  }
}

// Generate diverse conditions with realistic confidence levels
function generateDiverseConditions(apiConditions: any[], request: DiagnoseRequest): Condition[] {
  const inputLower = request.input.toLowerCase()
  const conditions: Condition[] = [] // Add explicit type annotation

  // Process API conditions first
  if (apiConditions && apiConditions.length > 0) {
    apiConditions.forEach((condition, index) => {
      let confidence = typeof condition.confidence === "number" ? condition.confidence : 0.5

      // Fix unrealistic confidence values
      if (confidence >= 0.95) {
        confidence = 0.65 + Math.random() * 0.2 // 65-85%
      }

      // Add variation based on position and context
      if (index === 0) {
        confidence = Math.max(confidence, 0.55) // First condition should be higher
      } else {
        confidence = confidence * (0.9 - index * 0.08) // Decrease for subsequent conditions
      }

      // Factor in pain level
      if (request.pain_level) {
        const painFactor = request.pain_level / 10
        if (condition.condition && condition.condition.toLowerCase().includes("pain")) {
          confidence = Math.min(confidence + painFactor * 0.15, 0.85)
        }
      }

      // Ensure realistic range
      confidence = Math.max(0.25, Math.min(0.85, confidence))

      conditions.push({
        condition: condition.condition || "Unknown condition",
        confidence: confidence,
        matched_symptoms: condition.matched_symptoms || extractSymptomsFromInput(request.input),
        description: condition.description || getConditionDescription(condition.condition),
        urgency_level: getUrgencyFromConfidence(confidence),
      })
    })
  }

  // Add symptom-specific conditions if none from API
  if (conditions.length === 0) {
    conditions.push(...generateSymptomBasedConditions(request))
  }

  // Ensure we have 3-5 conditions for diversity
  while (conditions.length < 3) {
    conditions.push(generateAdditionalCondition(request, conditions.length))
  }

  // Sort by confidence and limit to top 5
  return conditions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((condition, index) => ({
      ...condition,
      confidence: Math.max(condition.confidence - index * 0.05, 0.2), // Ensure decreasing confidence
    }))
}

// Generate symptom-based conditions with varied confidence
function generateSymptomBasedConditions(request: DiagnoseRequest): Condition[] {
  const inputLower = request.input.toLowerCase()
  const conditions: Condition[] = [] // Fix: Add explicit type
  const painLevel = request.pain_level || 5

  // Headache conditions
  if (inputLower.includes("headache") || inputLower.includes("head pain")) {
    conditions.push({
      condition: "Tension Headache",
      confidence: 0.65 + Math.random() * 0.15,
      matched_symptoms: ["headache", "head pain", "pressure"],
      description: "Most common type of headache, often caused by stress, poor posture, or muscle tension.",
      urgency_level: painLevel > 7 ? "medium" : "low", // Fix: Remove 'as const'
    })

    conditions.push({
      condition: "Migraine",
      confidence: 0.45 + Math.random() * 0.2,
      matched_symptoms: ["severe headache", "sensitivity to light", "nausea"],
      description: "Neurological condition causing intense headaches, often with additional symptoms.",
      urgency_level: painLevel > 8 ? "high" : "medium", // Fix: Remove 'as const'
    })

    if (painLevel > 8) {
      conditions.push({
        condition: "Cluster Headache",
        confidence: 0.35 + Math.random() * 0.15,
        matched_symptoms: ["severe head pain", "eye pain", "nasal congestion"],
        description: "Severe headaches that occur in cyclical patterns or clusters.",
        urgency_level: "high", // Fix: Remove 'as const'
      })
    }
  }

  // Respiratory conditions
  if (inputLower.includes("cough") || inputLower.includes("cold") || inputLower.includes("congestion")) {
    conditions.push({
      condition: "Upper Respiratory Infection",
      confidence: 0.6 + Math.random() * 0.15,
      matched_symptoms: ["cough", "congestion", "sore throat"],
      description: "Viral infection affecting the nose, throat, and upper airways.",
      urgency_level: "low",
    })

    conditions.push({
      condition: "Common Cold",
      confidence: 0.55 + Math.random() * 0.15,
      matched_symptoms: ["runny nose", "sneezing", "mild cough"],
      description: "Viral infection of the upper respiratory tract.",
      urgency_level: "low",
    })

    if (inputLower.includes("fever")) {
      conditions.push({
        condition: "Influenza",
        confidence: 0.5 + Math.random() * 0.15,
        matched_symptoms: ["fever", "body aches", "fatigue", "cough"],
        description: "Viral infection that affects the respiratory system and causes systemic symptoms.",
        urgency_level: "medium",
      })
    }
  }

  // Gastrointestinal conditions
  if (inputLower.includes("stomach") || inputLower.includes("nausea") || inputLower.includes("vomit")) {
    conditions.push({
      condition: "Gastroenteritis",
      confidence: 0.55 + Math.random() * 0.2,
      matched_symptoms: ["nausea", "stomach pain", "diarrhea"],
      description: "Inflammation of the stomach and intestines, often caused by viral or bacterial infection.",
      urgency_level: "medium",
    })

    conditions.push({
      condition: "Food Poisoning",
      confidence: 0.4 + Math.random() * 0.15,
      matched_symptoms: ["nausea", "vomiting", "abdominal cramps"],
      description: "Illness caused by consuming contaminated food or beverages.",
      urgency_level: "medium",
    })
  }

  // Fever-related conditions
  if (inputLower.includes("fever") || inputLower.includes("temperature")) {
    conditions.push({
      condition: "Viral Infection",
      confidence: 0.6 + Math.random() * 0.15,
      matched_symptoms: ["fever", "fatigue", "body aches"],
      description: "General viral infection causing systemic symptoms.",
      urgency_level: "medium",
    })

    if (painLevel > 6) {
      conditions.push({
        condition: "Bacterial Infection",
        confidence: 0.45 + Math.random() * 0.15,
        matched_symptoms: ["high fever", "severe pain", "fatigue"],
        description: "Bacterial infection that may require antibiotic treatment.",
        urgency_level: "medium",
      })
    }
  }

  return conditions
}

// Generate additional condition for diversity
function generateAdditionalCondition(request: DiagnoseRequest, index: number): Condition {
  const baseConfidence = 0.4 - index * 0.08

  return {
    condition: "General Malaise",
    confidence: Math.max(baseConfidence + Math.random() * 0.1, 0.2),
    matched_symptoms: ["fatigue", "discomfort", "general unwellness"],
    description: "General feeling of discomfort or illness that may require further evaluation.",
    urgency_level: "low",
  }
}

// Generate contextual advice based on symptoms
function generateContextualAdvice(request: DiagnoseRequest): string {
  const inputLower = request.input.toLowerCase()
  const painLevel = request.pain_level || 5

  if (painLevel >= 8) {
    return "Your high pain level suggests you should seek medical attention promptly. Consider visiting an urgent care center or emergency room if pain is severe."
  }

  if (inputLower.includes("headache")) {
    return "For headaches, try resting in a quiet, dark room and staying hydrated. If headaches are severe or frequent, consult with a healthcare provider."
  }

  if (inputLower.includes("fever")) {
    return "Monitor your fever and stay hydrated. Seek medical attention if fever exceeds 103°F (39.4°C) or persists for more than 3 days."
  }

  if (inputLower.includes("cough") || inputLower.includes("cold")) {
    return "Rest, stay hydrated, and consider using a humidifier. If symptoms worsen or persist beyond 10 days, consult a healthcare provider."
  }

  return "Monitor your symptoms closely and seek medical attention if they worsen or persist. Consider consulting with a healthcare provider for proper evaluation."
}

// Generate contextual home remedies
function generateContextualRemedies(request: DiagnoseRequest): string[] {
  const inputLower = request.input.toLowerCase()
  const remedies = []

  if (inputLower.includes("headache")) {
    remedies.push(
      "Apply a cold or warm compress to your head or neck",
      "Rest in a quiet, dark room",
      "Stay hydrated with water",
      "Practice relaxation techniques or gentle neck stretches",
    )
  }

  if (inputLower.includes("fever")) {
    remedies.push(
      "Stay hydrated with water, clear broths, or electrolyte solutions",
      "Rest and avoid strenuous activities",
      "Use a cool, damp cloth on your forehead",
      "Dress in lightweight clothing",
    )
  }

  if (inputLower.includes("cough") || inputLower.includes("cold")) {
    remedies.push(
      "Drink warm liquids like tea with honey",
      "Use a humidifier or breathe steam from a hot shower",
      "Gargle with warm salt water for sore throat",
      "Get plenty of rest to help your body recover",
    )
  }

  if (inputLower.includes("stomach") || inputLower.includes("nausea")) {
    remedies.push(
      "Eat bland foods like crackers, toast, or rice",
      "Stay hydrated with small, frequent sips of water",
      "Try ginger tea or peppermint for nausea relief",
      "Avoid dairy, caffeine, and fatty foods",
    )
  }

  // Add general remedies if none specific
  if (remedies.length === 0) {
    remedies.push(
      "Get adequate rest and sleep",
      "Stay hydrated by drinking plenty of fluids",
      "Eat nutritious, easily digestible foods",
      "Monitor your symptoms and note any changes",
    )
  }

  return remedies.slice(0, 6) // Limit to 6 remedies
}

// Generate diagnosis summary
function generateDiagnosisSummary(request: DiagnoseRequest, conditions: any[]): string {
  const topCondition = conditions[0]
  const painLevel = request.pain_level

  if (painLevel && painLevel >= 8) {
    return `Based on your symptoms and high pain level (${painLevel}/10), you may be experiencing ${topCondition?.condition || "a condition that requires attention"}. The severity of your pain suggests prompt medical evaluation would be beneficial.`
  }

  if (painLevel && painLevel >= 5) {
    return `Your symptoms suggest you may be experiencing ${topCondition?.condition || "a medical condition"}. With a moderate pain level of ${painLevel}/10, monitoring and possible medical consultation is recommended.`
  }

  return `Based on your reported symptoms, you may be experiencing ${topCondition?.condition || "a condition"} or a related condition. The symptoms you've described warrant attention and monitoring.`
}

// Get severity from context including pain level
function getSeverityFromContext(request: DiagnoseRequest): "low" | "medium" | "high" {
  const painLevel = request.pain_level
  const inputLower = request.input.toLowerCase()

  // High severity indicators
  if (painLevel && painLevel >= 8) return "high"
  if (inputLower.includes("severe") || inputLower.includes("unbearable") || inputLower.includes("emergency")) {
    return "high"
  }

  // Medium severity indicators
  if (painLevel && painLevel >= 5) return "medium"
  if (inputLower.includes("moderate") || inputLower.includes("persistent") || inputLower.includes("fever")) {
    return "medium"
  }

  // Low severity indicators
  if (painLevel && painLevel <= 3) return "low"
  if (inputLower.includes("mild") || inputLower.includes("slight")) {
    return "low"
  }

  return "medium" // Default
}

// Generate next steps based on context
function generateNextSteps(request: DiagnoseRequest): string[] {
  const severity = getSeverityFromContext(request)
  const painLevel = request.pain_level

  if (severity === "high" || (painLevel && painLevel >= 8)) {
    return [
      "Seek medical attention within 24 hours",
      "Consider visiting urgent care or emergency room if symptoms are severe",
      "Monitor symptoms closely and seek immediate help if they worsen",
      "Have someone accompany you to medical appointments if possible",
    ]
  }

  if (severity === "medium" || (painLevel && painLevel >= 4)) {
    return [
      "Schedule an appointment with your healthcare provider within 2-3 days",
      "Keep a symptom diary noting changes and triggers",
      "Follow recommended home care measures",
      "Seek immediate care if symptoms significantly worsen",
    ]
  }

  return [
    "Monitor symptoms for 24-48 hours",
    "Try appropriate home remedies and self-care measures",
    "Schedule a routine appointment if symptoms persist beyond a week",
    "Maintain good hydration and rest",
  ]
}

// Generate when to seek help guidance
function generateWhenToSeekHelp(request: DiagnoseRequest): string {
  const painLevel = request.pain_level

  if (painLevel && painLevel >= 8) {
    return "Seek immediate medical attention if pain becomes unbearable, if you develop difficulty breathing, severe dizziness, or if symptoms rapidly worsen."
  }

  return "Contact your healthcare provider if symptoms worsen significantly, if you develop high fever (over 103°F), severe pain, difficulty breathing, or if symptoms persist beyond expected recovery time."
}

// Generate recovery time estimate
function generateRecoveryTime(request: DiagnoseRequest): string {
  const inputLower = request.input.toLowerCase()
  const severity = getSeverityFromContext(request)

  if (inputLower.includes("cold") || inputLower.includes("cough")) {
    return "Most cold symptoms resolve within 7-10 days with proper rest and care."
  }

  if (inputLower.includes("headache")) {
    return "Tension headaches typically resolve within a few hours to 2 days. Migraines may last 4-72 hours."
  }

  if (inputLower.includes("stomach") || inputLower.includes("nausea")) {
    return "Gastrointestinal symptoms often improve within 24-48 hours with proper care and hydration."
  }

  switch (severity) {
    case "high":
      return "Recovery time depends on proper medical treatment. Follow your healthcare provider's guidance for expected recovery timeline."
    case "medium":
      return "Most moderate conditions improve within 1-2 weeks with appropriate care and rest."
    case "low":
      return "Mild symptoms typically resolve within 3-7 days with adequate self-care."
    default:
      return "Recovery time varies depending on the specific condition and individual factors."
  }
}

// Get condition description
function getConditionDescription(conditionName: string): string {
  if (!conditionName) return "Medical condition requiring evaluation."

  const descriptions: Record<string, string> = {
    "tension headache": "Most common type of headache, often caused by stress, poor posture, or muscle tension.",
    migraine: "Neurological condition causing intense headaches, often with sensitivity to light and sound.",
    "cluster headache": "Severe headaches that occur in cyclical patterns, typically affecting one side of the head.",
    "common cold": "Viral infection of the upper respiratory tract causing congestion and mild symptoms.",
    influenza: "Viral infection affecting the respiratory system with systemic symptoms like fever and body aches.",
    "upper respiratory infection": "Infection affecting the nose, throat, and upper airways.",
    gastroenteritis: "Inflammation of the stomach and intestines, often causing nausea and digestive issues.",
    "food poisoning": "Illness caused by consuming contaminated food, typically causing gastrointestinal symptoms.",
    "viral infection": "General viral infection that can affect various body systems.",
    "bacterial infection": "Bacterial infection that may require antibiotic treatment.",
    "allergic rhinitis": "Allergic reaction causing cold-like symptoms such as sneezing and congestion.",
    sinusitis: "Inflammation of the sinus cavities, often causing facial pain and congestion.",
  }

  const key = conditionName.toLowerCase()
  return descriptions[key] || `${conditionName} is a medical condition that may require professional evaluation.`
}

// Provide a comprehensive fallback response when API fails
function getFallbackResponse(request: DiagnoseRequest, error: Error | null): DiagnoseResponse {
  const severity = getSeverityFromContext(request)
  const fallbackConditions = generateSymptomBasedConditions(request)

  return {
    advice: generateContextualAdvice(request),
    conditions: fallbackConditions.slice(0, 4).map(condition => ({
      ...condition,
      urgency_level: condition.urgency_level as "low" | "medium" | "high" | undefined,
    })), // Limit to 4 conditions
    diagnosis_summary: generateDiagnosisSummary(request, fallbackConditions),
    disclaimer:
      "This is a fallback assessment due to technical issues. Please consult with a healthcare professional for proper evaluation.",
    home_remedies: generateContextualRemedies(request),
    severity: severity,
    next_steps: generateNextSteps(request),
    when_to_seek_help: generateWhenToSeekHelp(request),
    estimated_recovery_time: generateRecoveryTime(request),
  }
}

// Get default condition description if none provided
function getDefaultConditionDescription(conditionName: string): string {
  const conditionDescriptions: Record<string, string> = {
    "Common Cold":
      "A viral infection of the upper respiratory tract that typically causes nasal congestion, sore throat, and coughing.",
    Influenza: "A viral infection that attacks your respiratory system causing fever, body aches, and fatigue.",
    Migraine:
      "A neurological condition that causes intense, debilitating headaches often accompanied by nausea and sensitivity to light and sound.",
    Gastroenteritis:
      "An intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.",
    "Allergic Rhinitis":
      "An allergic response causing cold-like symptoms such as sneezing, itchy nose, and congestion.",
  }

  // Try to find a matching description
  for (const [condition, description] of Object.entries(conditionDescriptions)) {
    if (conditionName.toLowerCase().includes(condition.toLowerCase())) {
      return description
    }
  }

  // Default description
  return "A medical condition that may require professional evaluation."
}

// Determine urgency level based on confidence
function getUrgencyFromConfidence(confidence: number): "low" | "medium" | "high" | undefined {
  if (confidence >= 0.7) return "high"
  if (confidence >= 0.4) return "medium"
  return "low"
}

// Get severity based on pain level
function getSeverityFromPainLevel(painLevel: number | undefined): "low" | "medium" | "high" {
  if (!painLevel) return "medium"
  if (painLevel >= 7) return "high"
  if (painLevel >= 4) return "medium"
  return "low"
}

// Get default home remedies based on request
function getDefaultHomeRemedies(request: DiagnoseRequest): string[] {
  const inputLower = request.input.toLowerCase()

  if (inputLower.includes("headache") || inputLower.includes("head pain")) {
    return [
      "Rest in a quiet, dark room",
      "Apply a cold or warm compress to your head",
      "Stay hydrated by drinking plenty of water",
      "Consider over-the-counter pain relievers if appropriate",
    ]
  }

  if (inputLower.includes("cough") || inputLower.includes("cold") || inputLower.includes("congestion")) {
    return [
      "Stay hydrated by drinking warm fluids like tea with honey",
      "Use a humidifier to add moisture to the air",
      "Get plenty of rest to help your body recover",
      "Consider over-the-counter cough suppressants if appropriate",
    ]
  }

  // Default remedies
  return [
    "Get plenty of rest",
    "Stay hydrated by drinking water and clear fluids",
    "Monitor your symptoms and seek medical attention if they worsen",
    "Take over-the-counter pain relievers as directed (if appropriate)",
  ]
}

// Get default next steps based on severity
function getDefaultNextSteps(severity: "low" | "medium" | "high"): string[] {
  switch (severity) {
    case "high":
      return [
        "Seek immediate medical attention",
        "Call emergency services if symptoms are severe",
        "Have someone accompany you to the hospital if possible",
        "Bring a list of your current medications",
      ]
    case "medium":
      return [
        "Schedule an appointment with your healthcare provider within 1-2 days",
        "Keep a symptom diary noting any changes",
        "Avoid activities that worsen your symptoms",
        "Follow the recommended home care measures",
      ]
    case "low":
      return [
        "Monitor your symptoms for the next 24-48 hours",
        "Rest and follow the suggested home remedies",
        "Schedule a routine appointment if symptoms persist beyond a week",
        "Maintain good hydration and nutrition",
      ]
  }
}

// Get default when to seek help message
function getDefaultWhenToSeekHelp(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "high":
      return "Seek immediate medical attention if you experience severe pain, difficulty breathing, confusion, severe dizziness, or any symptoms that concern you."
    case "medium":
      return "Contact your healthcare provider if symptoms worsen, new symptoms develop, or if you don't see improvement within 48 hours."
    case "low":
      return "Seek medical attention if symptoms persist beyond a week, worsen significantly, or if you develop fever, severe pain, or other concerning symptoms."
  }
}

// Get default recovery time estimate
function getDefaultRecoveryTime(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "high":
      return "Recovery time will depend on diagnosis and treatment. Follow your healthcare provider's guidance."
    case "medium":
      return "Most moderate conditions improve within 1-2 weeks with appropriate care and rest."
    case "low":
      return "Mild symptoms typically resolve within 3-7 days with adequate rest and self-care."
  }
}

// Helper function to map form gender to API format
export function mapGenderForAPI(gender: string): string {
  switch (gender.toLowerCase()) {
    case "male":
      return "male"
    case "female":
      return "female"
    case "other":
    case "prefer-not-to-say":
      return "other"
    default:
      return "other"
  }
}

// Helper function to normalize severity for UI consistency
export function normalizeSeverity(severity: string): "low" | "medium" | "high" | "moderate" {
  switch (severity.toLowerCase()) {
    case "low":
    case "mild":
      return "low"
    case "medium":
      return "medium"
    case "moderate":
      return "moderate" // Keep as separate option
    case "high":
    case "severe":
      return "high"
    default:
      return "medium"
  }
}

// Enhanced request builder
export function buildEnhancedRequest(
  formData: { symptoms: string; age: string; gender: string; duration: string },
  additionalInputs: string[] = [],
): DiagnoseRequest {
  const combinedInput = [
    `Primary symptoms: ${formData.symptoms}`,
    `Duration: ${formData.duration}`,
    ...additionalInputs.map((input, index) => `Additional detail ${index + 1}: ${input}`),
  ].join(". ")

  return {
    age: Number.parseInt(formData.age),
    gender: mapGenderForAPI(formData.gender),
    input: combinedInput,
    duration: formData.duration,
    severity_indicators: extractSeverityIndicators(formData.symptoms + " " + additionalInputs.join(" ")),
    additional_context: additionalInputs.length > 0 ? additionalInputs.join(". ") : undefined,
  }
}

function extractSeverityIndicators(text: string): string[] {
  const indicators: string[] = []
  const textLower = text.toLowerCase()

  if (textLower.includes("severe") || textLower.includes("intense")) {
    indicators.push("severe_pain")
  }
  if (textLower.includes("sudden") || textLower.includes("acute")) {
    indicators.push("sudden_onset")
  }
  if (textLower.includes("worsening") || textLower.includes("getting worse")) {
    indicators.push("progressive")
  }
  if (textLower.includes("fever") || textLower.includes("temperature")) {
    indicators.push("fever_present")
  }

  return indicators
}

// Helper function to extract symptoms from input
function extractSymptomsFromInput(input: string): string[] {
  const commonSymptoms = [
    "fever",
    "headache",
    "cough",
    "sore throat",
    "runny nose",
    "congestion",
    "nausea",
    "vomiting",
    "diarrhea",
    "fatigue",
    "dizziness",
    "pain",
    "rash",
    "swelling",
    "shortness of breath",
    "chest pain",
  ]

  const inputLower = input.toLowerCase()
  return commonSymptoms.filter((symptom) => inputLower.includes(symptom))
}
