import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { CheckCircle2, Clock, Loader2, MessageSquareText, PhoneCall, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCourseNames, submitContactForm } from "@/api/contactForm";
import { BRAND_LOGO_URL, BRAND_NAME, RECAPTCHA_SITE_KEY, TENANT_ID } from "@/config";

// The site key is a reCAPTCHA Enterprise key, so the widget must load enterprise.js
(window as Window & { recaptchaOptions?: { enterprise?: boolean } }).recaptchaOptions = {
  enterprise: true,
};

const HIGHLIGHTS = [
  { icon: MessageSquareText, title: "Tell us what you need", text: "Share your details and the course you are interested in." },
  { icon: PhoneCall, title: "We call you back", text: "A counsellor will reach out on the number you provide." },
  { icon: Clock, title: "Quick response", text: "We usually get back within one working day." },
];

/** The standard captcha is 304px wide; on very narrow phones the compact one is used so it never overflows. */
const COMPACT_CAPTCHA_QUERY = "(max-width: 380px)";

const emptyForm = { fullName: "", mobile: "", email: "", courseInterested: "", message: "" };

type FormField = keyof typeof emptyForm;
type FormErrors = Partial<Record<FormField, string>>;

function useCompactCaptcha(): boolean {
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_CAPTCHA_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(COMPACT_CAPTCHA_QUERY);
    const onChange = () => setCompact(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return compact;
}

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [courses, setCourses] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const compactCaptcha = useCompactCaptcha();

  useEffect(() => {
    let cancelled = false;
    fetchCourseNames(TENANT_ID).then((names) => {
      if (!cancelled) setCourses(names);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Switching captcha size remounts the widget, so any earlier tick no longer counts
  useEffect(() => {
    setRecaptchaToken(null);
  }, [compactCaptcha]);

  const setField = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError("");
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    const digits = form.mobile.replace(/\D/g, "").slice(-10);
    if (!form.mobile.trim()) next.mobile = "Mobile number is required";
    else if (digits.length !== 10) next.mobile = "Enter a valid 10-digit mobile number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!recaptchaToken) {
      setSubmitError("Captcha validation is required.");
      return;
    }

    setLoading(true);
    setSubmitError("");
    try {
      await submitContactForm({
        fullName: form.fullName.trim(),
        mobile: form.mobile.replace(/\D/g, "").slice(-10),
        email: form.email.trim() || undefined,
        courseInterested: form.courseInterested.trim() || undefined,
        message: form.message.trim() || undefined,
        tenantId: TENANT_ID,
      });
      setSubmittedName(form.fullName.trim());
      setForm(emptyForm);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      // A token is single-use: after any attempt the visitor ticks the box again
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-start justify-center bg-gradient-to-br from-primary/10 via-background to-background px-3 py-4 sm:items-center sm:px-4 sm:py-10">
      <Card className="w-full max-w-4xl overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-5">
          {/* Brand panel: a compact header on phones, a full side panel from tablets up */}
          <aside className="flex flex-col bg-primary p-5 text-primary-foreground sm:p-8 md:col-span-2">
            <div className="flex items-center gap-4 md:block">
              <div className="inline-flex shrink-0 rounded-xl bg-white p-2.5 md:p-3">
                <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} logo`} className="h-9 w-auto object-contain md:h-10" />
              </div>
              <div className="min-w-0 md:mt-8">
                <h1 className="text-lg font-bold leading-tight sm:text-2xl">Let's talk about your future</h1>
                <p className="mt-1 text-xs text-primary-foreground/80 sm:mt-2 sm:text-sm">
                  Fill in the form and our team will get in touch with you.
                </p>
              </div>
            </div>
            <ul className="mt-8 hidden space-y-5 md:block">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-primary-foreground/75">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className="p-5 sm:p-8 md:col-span-3">
            {submittedName != null ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mt-5 text-xl font-bold">Thank you, {submittedName}!</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  We have received your details. Our team will contact you shortly.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSubmittedName(null)}>
                  Submit another response
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">Contact Us</h2>
                <p className="mt-1 text-sm text-muted-foreground">Fields marked * are required.</p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      maxLength={200}
                      autoComplete="name"
                    />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        inputMode="numeric"
                        value={form.mobile}
                        onChange={(e) => setField("mobile", e.target.value)}
                        placeholder="XXXXX XXXXX"
                        maxLength={15}
                        autoComplete="tel-national"
                      />
                      {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="your@email.com"
                        maxLength={200}
                        autoComplete="email"
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="courseInterested">Course Interested</Label>
                    {courses.length > 0 ? (
                      <Select value={form.courseInterested} onValueChange={(v) => setField("courseInterested", v)}>
                        <SelectTrigger id="courseInterested">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {courses.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="courseInterested"
                        value={form.courseInterested}
                        onChange={(e) => setField("courseInterested", e.target.value)}
                        placeholder="Which course are you interested in?"
                        maxLength={300}
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    {/* 16px text on phones stops iOS from zooming into the field */}
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      placeholder="How can we help you?"
                      rows={4}
                      className="text-base md:text-sm"
                    />
                  </div>

                  <div className="flex justify-center">
                    <ReCAPTCHA
                      key={compactCaptcha ? "compact" : "normal"}
                      ref={recaptchaRef}
                      sitekey={RECAPTCHA_SITE_KEY}
                      size={compactCaptcha ? "compact" : "normal"}
                      onChange={(token) => {
                        setRecaptchaToken(token);
                        setSubmitError("");
                      }}
                      onExpired={() => setRecaptchaToken(null)}
                      onErrored={() => setRecaptchaToken(null)}
                    />
                  </div>

                  {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                  <Button type="submit" size="lg" className="w-full" disabled={loading || !recaptchaToken}>
                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                    {loading ? "Submitting…" : "Submit"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
