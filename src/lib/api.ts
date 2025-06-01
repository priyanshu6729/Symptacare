export interface DiagnoseRequest {
  age: number
  gender: string
  input: string
}

export interface Condition {
  condition: string
  confidence: number
  matched_symptoms: string[]
}

export interface DiagnoseResponse {
  advice: string
  conditions: Condition[]
  diagnosis_summary: string
  disclaimer: string
  home_remedies: string[]
  severity: "low" | "medium" | "high" | "moderate"
}

const API_BASE_URL = "https://symptacare-api.onrender.com"

export async function diagnoseSymptoms(request: DiagnoseRequest): Promise<DiagnoseResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/diagnose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error calling symptom diagnosis API:", error)
    throw new Error("Failed to analyze symptoms. Please try again.")
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
export function normalizeSeverity(severity: string): "low" | "medium" | "high" {
  switch (severity.toLowerCase()) {
    case "low":
      return "low"
    case "medium":
    case "moderate":
      return "medium"
    case "high":
      return "high"
    default:
      return "low"
  }
}
