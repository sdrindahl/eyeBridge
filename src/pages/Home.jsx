import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Rocket, Layers, Shield, Users, Zap, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/services/api";
import vendorsData from "@/data/vendors.json";

// 🔧 Quick edit guide:
// - Replace BRAND_NAME, TAGLINE, and all placeholder copy.
// - Update the nav links and CTAs to match your flow (e.g., Browse vendors, List your company).
// - Swap the placeholder images with product shots or illustrations.
// - For pricing, set your real plans and features.

const BRAND_NAME = "Eye Bridges";
const TAGLINE = "Connecting optometry & ophthalmology with verified vendors and products";

const features = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Verified vendor profiles",
    desc: "Company info, specialties, and contact details in one place."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Product catalog search",
    desc: "Search instruments, lenses, frames, diagnostics, and software with rich filters."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Optometry & ophthalmology ready",
    desc: "Content tailored for ODs and MDs: indications, training, and support."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Quotes & inquiries",
    desc: "Request quotes & demos with one click"
  }
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    cta: "Get started",
    features: ["Up to 5 team members", "Basic automations", "Email support"]
  },
  {
    name: "Growth",
    price: "$49",
    period: "/mo",
    cta: "Start free trial",
    highlighted: true,
    features: ["Unlimited team members", "Advanced automations", "SSO & roles", "Priority support"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    cta: "Contact sales",
    features: ["Dedicated tenant", "SLAs & security review", "Custom integrations"]
  }
];

const testimonials = [
  {
    quote: "We moved from concept to paying customers in six weeks.",
    name: "Avery Chen",
    role: "Founder, Northbeam Ops"
  },
  {
    quote: "The multi-tenant model and SSO saved us months of work.",
    name: "Jordan Patel",
    role: "CTO, Scalar Labs"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    // Check if user has valid token
    const checkAuth = async () => {
      try {
        await api.verifyToken();
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-300 text-slate-800">
      {/* Nav */}
      <header data-testid="home-header" className="sticky top-0 z-40 border-b border-slate-800 relative" style={{ backgroundImage: 'url(/banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-slate-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4 sm:h-24 relative z-10">
          <Link to="/" data-testid="logo-link" className="flex items-center gap-2 sm:gap-3 font-semibold text-white">
            <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-16 sm:h-20 w-auto" />
            <span className="text-lg sm:text-xl">{BRAND_NAME}</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard">
                  <Button className="rounded-2xl bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10">
                    <span className="hidden sm:inline">Go to Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="rounded-2xl border-white text-white hover:bg-slate-800 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="rounded-2xl text-white hover:bg-slate-800 hover:text-white text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10">Log in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8">
                Find Your Eye Care Vendors
              </h1>
              <p className="text-xl sm:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto">
                Search through {vendorsData.length} verified vendors and suppliers in one place
              </p>
              
              {/* Large CTA Button */}
              <Link to="/vendors">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button className="rounded-2xl px-12 py-8 text-2xl font-bold shadow-2xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
                    Browse Vendors Directory →
                  </Button>
                </motion.div>
              </Link>
              
              <p className="mt-8 text-base text-slate-600">
                {vendorsData.length} vendors • Equipment, Contact Lenses, Pharmaceuticals & More
              </p>
              
              {/* Quick Stats */}
              <div className="mt-16 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="text-3xl font-bold text-slate-600">{vendorsData.length}</div>
                  <div className="text-sm text-slate-600 mt-1">Vendors</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="text-3xl font-bold text-slate-600">184</div>
                  <div className="text-sm text-slate-600 mt-1">Categories</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="text-3xl font-bold text-slate-600">201</div>
                  <div className="text-sm text-slate-600 mt-1">Products</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Directory Preview */}
      <section id="directory" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">Explore vendors & product lines</h2>
            <p className="mt-3 text-neutral-600">A quick look at the kinds of listings you'll find on Eye Bridges.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "AcuSight Diagnostics", tags: ["OCT", "Topography"], blurb: "Imaging systems for glaucoma and retina." },
              { name: "ClearLens Lab", tags: ["CL", "Custom"], blurb: "Specialty and custom contact lenses." },
              { name: "OptiSoft EMR", tags: ["Software", "EMR"], blurb: "Cloud EMR with imaging integrations." },
              { name: "Prism Frames", tags: ["Frames", "Retail"], blurb: "Independent frame collections for boutiques." },
              { name: "CornealTech", tags: ["Surgery", "Equipment"], blurb: "Ophthalmic surgical tools & disposables." },
              { name: "Vision Billing Pro", tags: ["RevCycle", "Services"], blurb: "Revenue cycle management for ODs & MDs." }
            ].map((v) => (
              <Card key={v.name} className="rounded-3xl bg-slate-200 border-slate-300">
                <CardHeader>
                  <CardTitle className="text-lg">{v.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {v.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded-full bg-neutral-100 border">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-neutral-600">{v.blurb}</CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/vendors">
              <Button className="rounded-2xl px-8">View All Vendors →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">Everything you need to ship a platform</h2>
            <p className="mt-3 text-neutral-600">Start simple, then customize deeply as you scale.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="rounded-3xl bg-slate-200 border-slate-300">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-slate-300 border border-slate-400 grid place-items-center text-slate-700">{f.icon}</div>
                  <CardTitle className="mt-4 text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-600">{f.desc}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold">Have Comments or Feedback?</h3>
          <p className="mt-3 text-neutral-600">We'd love to hear from you. Share your thoughts to help us improve.</p>
          <Button 
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className="rounded-2xl h-11 mt-6"
          >
            <Mail className="w-4 h-4 mr-2" /> {showFeedbackForm ? 'Close Form' : 'Share Feedback'}
          </Button>
          
          {showFeedbackForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-300 shadow-lg"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const email = formData.get('email');
                const comments = formData.get('comments');
                // Here you would typically send this to your backend
                alert('Thank you for your feedback!');
                setShowFeedbackForm(false);
                e.target.reset();
              }} className="space-y-4 text-left">
                <div>
                  <label htmlFor="feedback-email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="feedback-email"
                    name="email"
                    placeholder="you@company.com" 
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400" 
                  />
                </div>
                <div>
                  <label htmlFor="feedback-comments" className="block text-sm font-medium text-slate-700 mb-2">
                    Comments
                  </label>
                  <textarea 
                    id="feedback-comments"
                    name="comments"
                    placeholder="Share your thoughts..."
                    required
                    rows="4"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl h-11">
                  Submit Feedback
                </Button>
              </form>
            </motion.div>
          )}
          
          <p className="mt-3 text-xs text-neutral-500">We'll never share your email.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-sky-50 border-t border-sky-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold">Frequently asked questions</h3>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {[
              { q: "Is there a free plan?", a: "Yes, the Starter plan is free forever." },
              { q: "Can I bring my data?", a: "Import via CSV or connect your warehouse." },
              { q: "Do you support SSO?", a: "Yes—Google, Microsoft, Okta, and SAML." },
              { q: "How do I deploy?", a: "One-click to Vercel or your own infra." }
            ].map((item) => (
              <div key={item.q}>
                <h4 className="font-semibold">{item.q}</h4>
                <p className="text-sm text-neutral-600 mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6 text-sm text-neutral-600">
          <div>
            <div className="flex items-center gap-3 font-semibold text-neutral-900">
              <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-16 w-auto" />
              <span className="text-lg">{BRAND_NAME}</span>
            </div>
            <p className="mt-3">Connects you with products easily.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-semibold text-neutral-900">Product</div>
              <ul className="mt-2 space-y-1">
                <li><a href="#features">Features</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-neutral-900">Company</div>
              <ul className="mt-2 space-y-1">
                <li>About</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-neutral-900">Legal</div>
              <ul className="mt-2 space-y-1">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="md:text-right">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
