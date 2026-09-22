import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowUpRight } from "lucide-react";
// Defaults to Regular (400); explicit path for clarity
import "@fontsource/playfair-display/400.css";
import { publicApi } from "../api/api";
import AuthModal from "../components/AuthModal";

const FEATURES = [
  "Live rates and availability",
  "Quotes you can forward to your client",
  "Commission tracked per booking",
] as const;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export const AgentsHome: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    initialEmail?: string;
  }>({ open: false });
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(null);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError(null);
    setLoading(true);

    try {
      const response = (await publicApi("/auth/check-email", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      })) as { userExists: boolean };

      if (response.userExists) {
        setAuthModal({ open: true, initialEmail: email.trim() });
      } else {
        navigate(`/advisor-signup?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err) {
      console.error("❌ Error checking user:", err);
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeAuthModal = () => setAuthModal({ open: false });

  const handleAuthSuccess = (user: any) => {
    console.log("✅ Auth success:", user);
    closeAuthModal();
    window.dispatchEvent(new Event("authStateChange"));
    navigate("/properties");
  };

  return (
    <div className="min-h-screen bg-agents-background flex flex-col overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-agents-navy-darker/80 backdrop-blur-md border-b border-agents-border">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              aria-label="Personal Villas Agents home"
              className="inline-flex min-w-0 items-center gap-4"
            >
              <img
                src="/logo-pv-agents-white.png"
                alt="Personal Villas"
                className="h-11 w-auto max-w-full"
              />
              <span className="border-l border-agents-border pl-4 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-agents-muted-foreground">
                Agents
              </span>
            </Link>
            <Link
              to="/login"
              className="text-xs font-medium uppercase tracking-widest text-agents-muted-foreground hover:text-agents-primary transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20 flex flex-col">
        <section className="flex-1 px-6 py-12 lg:py-16 flex items-center">
          <div className="container mx-auto max-w-6xl px-8 grid lg:grid-cols-[1.08fr_0.82fr] gap-10 lg:gap-20 items-start">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-agents-primary mb-5">
                Personal Villas Agents
              </p>
              <h1 className="font-agentsSerif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] tracking-normal text-agents-foreground mb-6">
                Search, quote and book villas for your clients.
              </h1>
              <p className="text-lg leading-8 text-agents-muted-foreground max-w-xl mb-8">
                Live availability across ~2,200 homes in 19 destinations. Build
                a quote in minutes and send it under your name. Free for travel
                advisors.
              </p>
              <ul className="space-y-3">
                {FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-agents-foreground"
                  >
                    <span className="flex h-6 w-6 items-center justify-center border border-agents-primary/50 text-agents-primary">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full max-w-md lg:ml-auto lg:mt-10">
              <div className="border border-agents-border bg-agents-card p-7 sm:p-9 rounded-md">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-agents-primary mb-3">
                  Advisor access
                </p>
                <h2 className="font-agentsSerif text-3xl text-agents-foreground mb-3 tracking-normal">
                  Get instant access
                </h2>
                <p className="text-sm text-agents-muted-foreground leading-6 mb-6">
                  Enter your work email to continue.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    aria-label="Work email"
                    value={email}
                    onChange={handleEmailChange}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !loading && handleSubmit()
                    }
                    disabled={loading}
                    placeholder="Work email address"
                    className="flex w-full rounded-md border border-agents-border px-3 py-2 text-base ring-offset-agents-background placeholder:text-agents-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agents-primary focus-visible:ring-offset-2 md:text-sm h-12 bg-agents-secondary text-agents-foreground"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs pl-1">{emailError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-agents-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agents-primary focus-visible:ring-offset-2 bg-agents-primary text-agents-primary-foreground uppercase tracking-widest text-xs hover:bg-agents-primary/90 px-4 py-2 h-12 w-full disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Checking..." : "Get Instant Access"}
                  </button>
                </div>
              </div>
              <p className="text-sm text-center text-agents-muted-foreground mt-5">
                Already have access?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-agents-primary hover:underline underline-offset-4"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-agents-border bg-agents-secondary px-6 py-5">
          <div className="container mx-auto max-w-6xl px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm sm:text-base text-agents-foreground">
              Rather hand it off? Our help desk will source and cost the whole
              trip for you.
            </p>
            <a
              href="https://personalvillas.com/agents"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-agents-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agents-primary focus-visible:ring-offset-2 bg-agents-primary text-agents-primary-foreground uppercase tracking-widest text-xs hover:bg-agents-primary/90 h-10 px-4 py-2 shrink-0"
            >
              Send it to the Help Desk{" "}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-agents-border bg-agents-navy-darker px-6 py-6">
        <div className="container mx-auto max-w-6xl px-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.68rem] uppercase tracking-wider text-agents-muted-foreground">
          <span>© Personal Villas</span>
          <a
            className="hover:text-agents-primary"
            href="mailto:reservations@personalvillas.com"
          >
            reservations@personalvillas.com
          </a>
          <a className="hover:text-agents-primary" href="tel:+18009670559">
            800.967.0559
          </a>
          <Link className="hover:text-agents-primary" to="/terms-of-service">
            Terms
          </Link>
          <Link className="hover:text-agents-primary" to="/privacy-policy">
            Privacy
          </Link>
          <a
            className="hover:text-agents-primary"
            href="https://personalvillas.com"
            target="_blank"
            rel="noreferrer"
          >
            personalvillas.com
          </a>
        </div>
      </footer>

      {authModal.open && (
        <AuthModal
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
          initialEmail={authModal.initialEmail}
          initialMode="password"
        />
      )}
    </div>
  );
};

export default AgentsHome;
