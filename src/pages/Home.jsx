import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Rocket, Layers, Shield, Users, Zap, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    desc: "Company info, specialties, territories, and contact details in one place."
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
    desc: "Start RFPs, request quotes, or connect directly with reps—no cold outreach."
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
  return (
    <div className="min-h-screen bg-slate-300 text-slate-800">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
          <Link to="/" className="flex items-center gap-3 font-semibold text-white">
            <img src="/logo.jpg" alt="Eye Bridges Logo" className="h-20 w-auto" />
            <span className="text-xl">{BRAND_NAME}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white">
            <a href="#features" className="hover:text-slate-200">Features</a>
            <a href="#how" className="hover:text-slate-200">How it works</a>
            <a href="#pricing" className="hover:text-slate-200">Pricing</a>
            <a href="#faq" className="hover:text-slate-200">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-2xl text-white hover:bg-slate-800 hover:text-white">Log in</Button>
            <Button className="rounded-2xl bg-white text-slate-700 hover:bg-slate-50">Try for free</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8">
                Find Your Eye Care Vendors
              </h1>
              <p className="text-xl sm:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto">
                Search through 3,746+ verified vendors and suppliers in one place
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
                Free to browse • 3,746+ vendors • Equipment, Contact Lenses, Pharmaceuticals & More
              </p>
              
              {/* Quick Stats */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="text-3xl font-bold text-slate-600">3,746</div>
                  <div className="text-sm text-slate-600 mt-1">Vendors</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="text-3xl font-bold text-slate-600">50+</div>
                  <div className="text-sm text-slate-600 mt-1">Categories</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="text-3xl font-bold text-slate-600">1000+</div>
                  <div className="text-sm text-slate-600 mt-1">Products</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="text-3xl font-bold text-slate-600">Free</div>
                  <div className="text-sm text-slate-600 mt-1">To Browse</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Directory Preview */}
      <section id="directory" className="py-20 bg-slate-300 border-y border-slate-200">
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

      {/* Logos */}
      <section className="py-6 border-y border-slate-200 bg-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-500">Trusted by fast-moving teams</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 opacity-80">
            {["Acme", "Northbeam", "Tecton", "Vector", "Rain", "Nimbus"].map((logo) => (
              <div key={logo} className="h-10 rounded-lg bg-slate-200 border border-slate-300 grid place-items-center text-slate-500">
                {logo}
              </div>
            ))}
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

      {/* How it works */}
      <section id="how" className="py-20 bg-slate-300 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-neutral-600">From idea to launch in three simple steps.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {["Model your tenants & roles", "Compose dashboards & workflows", "Connect billing & go live"].map((step, i) => (
              <Card key={i} className="rounded-3xl bg-slate-200 border-slate-300">
                <CardHeader>
                  <div className="text-xs text-neutral-500">Step {i + 1}</div>
                  <CardTitle className="text-lg">{step}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius libero.
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-3 text-neutral-600">Start free and scale as you grow.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <Card key={p.name} className={`${p.highlighted ? "ring-2 ring-teal-600" : ""} rounded-3xl bg-slate-200 border-slate-300`}>
                <CardHeader>
                  <CardTitle className="flex items-baseline justify-between">
                    <span>{p.name}</span>
                    <span className="text-2xl font-bold">
                      {p.price}
                      <span className="text-base font-medium text-neutral-500">{p.period}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-1" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6 rounded-2xl">{p.cta}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-300 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold">Loved by founders & operators</h2>
            <p className="mt-3 text-neutral-600">Don't just take our word for it.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="rounded-3xl bg-slate-200 border-slate-300">
                <CardContent className="pt-6 text-slate-700">
                  <p className="text-lg leading-relaxed">"{t.quote}"</p>
                  <p className="mt-4 text-sm text-neutral-500">
                    {t.name} — {t.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold">Ready to validate your platform?</h3>
          <p className="mt-3 text-neutral-600">Join the waitlist to get early access, templates, and migration help.</p>
          <form className="mt-6 max-w-md mx-auto flex gap-2">
            <input type="email" placeholder="you@company.com" className="flex-1 rounded-2xl border border-slate-300 bg-slate-200 px-4 h-11 text-slate-800" />
            <Button className="rounded-2xl h-11">
              <Mail className="w-4 h-4 mr-2" /> Notify me
            </Button>
          </form>
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
            <p className="mt-3">{BRAND_NAME} helps teams ship platforms customers love.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-semibold text-neutral-900">Product</div>
              <ul className="mt-2 space-y-1">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-neutral-900">Company</div>
              <ul className="mt-2 space-y-1">
                <li>About</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-neutral-900">Legal</div>
              <ul className="mt-2 space-y-1">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="md:text-right">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
