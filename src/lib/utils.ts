import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This function helps determine symptom severity based on text input
export function analyzeSeverity(symptomsText: string): "low" | "medium" | "high" {
  const lowSymptoms = ["cold", "cough", "sore throat", "headache", "mild", "slight"];
  const highSymptoms = [
    "chest pain",
    "difficulty breathing",
    "severe",
    "can't breathe",
    "heart",
    "unconscious",
    "bleeding",
    "blood",
    "emergency"
  ];

  const symptomsLower = symptomsText.toLowerCase();

  if (highSymptoms.some(s => symptomsLower.includes(s))) {
    return "high";
  } else if (lowSymptoms.some(s => symptomsLower.includes(s))) {
    return "low";
  } else {
    return "medium";
  }
}
