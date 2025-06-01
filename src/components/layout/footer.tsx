import { Heart, AlertTriangle, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
  ]

  return (
    <footer className="bg-gradient-to-b from-muted/30 to-muted/50 border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand and description */}
          <div className="space-y-6">
            <div className="flex items-center group">
              <div className="relative">
                <Heart className="h-8 w-8 text-primary fill-primary transition-all duration-300 group-hover:scale-110" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse"></div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                SymptaCare
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Providing guidance for your health concerns and helping you make informed decisions about your well-being.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="group bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                >
                  <social.icon className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "#about" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Our Team", href: "#team" },
                { label: "Contact", href: "#contact" },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 group flex items-center"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "#privacy" },
                { label: "Terms of Service", href: "#terms" },
                { label: "Cookie Policy", href: "#cookies" },
                { label: "Medical Disclaimer", href: "#disclaimer" },
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 group flex items-center"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Disclaimer */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h3>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@symptacare.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Medical disclaimer */}
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 p-4 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                <h4 className="ml-2 text-sm font-semibold text-red-600 dark:text-red-400">Important Disclaimer</h4>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                SymptaCare is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the
                advice of your physician or other qualified health provider.
              </p>
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                If you are experiencing a medical emergency, call your local emergency services immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center text-xs text-muted-foreground">
              &copy; {currentYear} SymptaCare. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" />
              <span>for better health</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
