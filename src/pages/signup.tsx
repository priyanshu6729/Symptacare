import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  
  // Check if there's a redirect destination in the location state
  const from = location.state?.from?.pathname || "/";

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    height: "",
    weight: "",
    age: "",
    gender: "",
    medicalConditions: "",
    allergies: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email and password are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // In a real app, this would create a user account via API
    // For demo purposes, we'll just sign the user up
    signup({
      name: formData.name,
      email: formData.email,
      height: formData.height,
      weight: formData.weight,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(c => c.trim()) : [],
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      role: formData.role,
    });

    // The redirect will happen in the useEffect
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your SymptaCare Account</CardTitle>
          <CardDescription>
            Sign up to access personalized health recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Full Name*
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address*
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password*
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    Confirm Password*
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Health Information</h3>
                <p className="text-sm text-muted-foreground">
                  This information helps us provide more accurate recommendations. You can edit this later.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="height" className="block text-sm font-medium">
                      Height (cm)
                    </label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="weight" className="block text-sm font-medium">
                      Weight (kg)
                    </label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-sm font-medium">
                      Age
                    </label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Gender
                    </label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="medicalConditions" className="block text-sm font-medium">
                    Pre-existing Medical Conditions
                  </label>
                  <Textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    placeholder="E.g., Diabetes, Hypertension, Asthma (separate with commas)"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="allergies" className="block text-sm font-medium">
                    Allergies
                  </label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    placeholder="E.g., Peanuts, Penicillin, Dust (separate with commas)"
                    value={formData.allergies}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg">
                Get Started
              </Button>

              <div className="text-center mt-4 text-sm">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}