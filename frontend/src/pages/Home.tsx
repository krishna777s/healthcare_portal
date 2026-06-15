import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  Stethoscope,
  Users,
  ChevronRight,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Activity,
  Shield,
} from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") || "";
  const [showLogin, setShowLogin] = useState(roleParam !== "");
  const [logoError, setLogoError] = useState(false);

  // header scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Update modal state when URL params change
    if (roleParam) {
      setShowLogin(true);
    }
  }, [roleParam]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeAllModals = () => {
    setShowLogin(false);
  };


  const stats = [
    {
      label: "Active Hospitals",
      value: "500+",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      label: "Patient Satisfaction",
      value: "98.5%",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      label: "Compliance Rate",
      value: "99.2%",
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const testimonials = [
    {
      quote: "This platform has transformed how we manage our hospital operations. The patient records system alone has improved our efficiency by 40%.",
      author: "Dr. Sarah Chen",
      position: "Chief Medical Officer",
      company: "Metropolitan Health System",
      rating: 5,
    },
    {
      quote: "The compliance tracking feature is invaluable. We've maintained 100% accreditation compliance since implementing the system.",
      author: "Michael Rodriguez",
      position: "Hospital Administrator",
      company: "City Medical Center",
      rating: 5,
    },
    {
      quote: "Outstanding platform with exceptional support. Highly recommended for any healthcare facility looking to modernize their operations.",
      author: "Emma Thompson",
      position: "Director of Operations",
      company: "Regional Healthcare Network",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#131e3a] text-white">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-lg border-gray-200"
            : "bg-[#131e3a] border-[#2D2755]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isScrolled ? "bg-white" : "bg-[#131e3a]/50"}`}>
                {logoError ? (
                  <Building2 className={`h-8 w-8 ${isScrolled ? "text-[#131e3a]" : "text-white"}`} />
                ) : (
                  <img 
                    src="/cerevyn-logo.png" 
                    alt="Cerevyn Logo" 
                    className={`h-8 w-8 object-contain ${isScrolled ? "brightness-0" : ""}`}
                    onError={() => setLogoError(true)}
                  />
                )}
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isScrolled ? "text-[#131e3a]" : "text-white"}`}>
                  Hospital Management Portal
                </h1>
                <p className={`text-sm ${isScrolled ? "text-gray-600" : "text-[#D1D5DB]"}`}>
                  Digital Command Center
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/select-role'}
                className={`px-6 py-2 rounded-2xl font-semibold backdrop-blur-sm border transition-all duration-300 ${
                  isScrolled
                    ? "bg-white/10 border-[#2D2755] text-[#131e3a]"
                    : "bg-[#051650]/10 border-[#2D2755] text-white"
                }`}
              >
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#131e3a] mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              <span className="text-white">Hospital Management</span>
              <br />
              
            </h1>
            <p className="text-xl text-[#D1D5DB] mb-8 max-w-3xl mx-auto">
              Streamline the operations of your healthcare facility across departments, staff, and patients. Your centralized hub for hospital management, patient care, and regulatory compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/select-role'}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold rounded-2xl flex items-center justify-center"
              >
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Healthcare Leaders</h2>
            <p className="text-xl text-[#D1D5DB] max-w-3xl mx-auto">
              See what our clients say about transforming their hospital management processes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-2xl p-6 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-[#D1D5DB] mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-full p-2 mr-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.author}</div>
                    <div className="text-[#D1D5DB] text-sm">{testimonial.position}</div>
                    <div className="text-[#D1D5DB] text-xs">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Hospital Operations?
            </h2>
            <p className="text-xl text-[#9fc0d6] mb-8 max-w-4xl mx-auto">
              Join hundreds of healthcare facilities that trust our platform for their management needs. Start your journey to streamlined hospital operations today.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-2xl p-8 text-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
              <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-full p-4 inline-block mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Free Trial</h3>
              <p className="text-[#D1D5DB] mb-6">
                Experience our platform with a 30-day free trial. No credit card required.
              </p>
              <Button
                onClick={() => window.location.href = '/select-role'}
                className="bg-primary hover:bg-primary/90 text-white w-full rounded-2xl"
              >
                Start Free Trial
              </Button>
            </div>

            <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-2xl p-8 text-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
              <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-full p-4 inline-block mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Schedule Demo</h3>
              <p className="text-[#D1D5DB] mb-6">
                Book a personalized demo to see how our platform fits your healthcare facility.
              </p>
              <Button
                onClick={() => window.location.href = '/select-role'}
                className="bg-primary hover:bg-primary/90 text-white w-full rounded-2xl"
              >
                Book Demo
              </Button>
            </div>

            <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-2xl p-8 text-center transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
              <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-full p-4 inline-block mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Enterprise</h3>
              <p className="text-[#D1D5DB] mb-6">
                Custom solutions for large healthcare networks with complex needs.
              </p>
              <Button
                onClick={() => window.location.href = '/select-role'}
                className="bg-primary hover:bg-primary/90 text-white w-full rounded-2xl"
              >
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Why Choose Our Platform?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#cfeaf8]">HIPAA-compliant security and compliance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#cfeaf8]">24/7 expert support and consultation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#cfeaf8]">Seamless integration with existing healthcare systems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-[#cfeaf8]">ROI-focused implementation and training</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-2xl p-8">
              <h4 className="text-lg font-bold text-white mb-4">Get Started in 3 Steps</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="text-white font-semibold">Sign Up</h5>
                    <p className="text-[#D1D5DB] text-sm">Create your account and set up your hospital profile</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="text-white font-semibold">Import Data</h5>
                    <p className="text-[#D1D5DB] text-sm">Upload your existing hospital and patient information</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="text-white font-semibold">Start Managing</h5>
                    <p className="text-[#D1D5DB] text-sm">Begin streamlined hospital operations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#131e3a] text-[#9fc0d6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-[#051650]/10 backdrop-blur-sm border border-[#2D2755] p-2 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Hospital Management Portal</span>
              </div>
              <p className="text-[#9fc0d6] mb-4 max-w-md">
                The backbone of your healthcare Digital Command Center, designed to streamline hospital operations, patient care, and regulatory compliance.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
              <div className="space-y-2">
                <a href="#" className="block text-[#9fc0d6] hover:text-white transition-colors">
                  Hospital Management
                </a>
                <a href="#" className="block text-[#9fc0d6] hover:text-white transition-colors">
                  Patient Records
                </a>
                <a href="#" className="block text-[#9fc0d6] hover:text-white transition-colors">
                  Compliance Tracking
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block text-[#9fc0d6] hover:text-white transition-colors">
                  Documentation
                </a>
                <a href="#" className="block text-[#9fc0d6] hover:text-white transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#022b45] mt-8 pt-8 text-center text-[#9fc0d6]">
            <p>&copy; 2025 Hospital Management Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Render Modals */}
      <LoginModal open={showLogin} onOpenChange={setShowLogin} onSwitchToSignup={() => {}} role={roleParam} />
    </div>
  );
};

export default Home;