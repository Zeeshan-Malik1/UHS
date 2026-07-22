import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardPlus,
  Clock,
  FileHeart,
  HeartPulse,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Users,
  Video,
  Wind,
} from "lucide-react";
import {
  Button,
  DoctorCard,
  HospitalCard,
  SectionTitle,
  Avatar,
} from "../components/ui";
import { articles, doctors, hospitals } from "../data/mockData";
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55 },
};
const services = [
  {
    icon: BrainCircuit,
    title: "AI health insights",
    text: "Understand symptoms with intelligent, responsible guidance.",
  },
  {
    icon: CalendarDays,
    title: "Easy appointments",
    text: "Book trusted specialists in just a few thoughtful steps.",
  },
  {
    icon: Stethoscope,
    title: "Verified doctors",
    text: "Discover experienced professionals across every specialty.",
  },
  {
    icon: MapPin,
    title: "Nearby care",
    text: "Locate hospitals, emergency care and clinics near you.",
  },
  {
    icon: FileHeart,
    title: "Health records",
    text: "Keep your medical journey organized in one secure place.",
  },
  {
    icon: Activity,
    title: "Health analytics",
    text: "Follow meaningful trends and make better daily decisions.",
  },
];
export function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-shade" />
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="eyebrow">
            <Sparkles /> Healthcare, thoughtfully connected
          </span>
          <h1>
            AI-powered care.
            <br />
            <em>Human at heart.</em>
          </h1>
          <p>
            One secure platform to understand your health, find trusted doctors,
            and access better care—wherever life takes you.
          </p>
          <div className="hero-actions">
            <Button to="/predict">
              Check your symptoms <ArrowRight />
            </Button>
            <Button to="/doctors" variant="secondary">
              <CalendarDays /> Book appointment
            </Button>
          </div>
          <div className="hero-proof" aria-label="UHS care metrics">
            <div><strong>4.9/5</strong><span>Patient rating</span></div>
            <i />
            <div><strong>50,000+</strong><span>People supported</span></div>
            <i />
            <div><strong>24/7</strong><span>Care access</span></div>
          </div>
        </motion.div>
      </section>
      <section className="section">
        <SectionTitle
          eyebrow="Care without complexity"
          title="Everything your health needs, in one place"
          text="From first question to follow-up, UHS helps you move forward with clarity and confidence."
          center
        />
        <div className="service-grid">
          {services.map(({ icon: Icon, ...x }, i) => (
            <motion.article
              {...reveal}
              transition={{ delay: i * 0.06 }}
              className="service-card card"
              key={x.title}
            >
              <span>
                <Icon />
              </span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <Link to="/predict">
                Explore <ArrowRight />
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="section soft">
        <div className="split-heading">
          <SectionTitle
            eyebrow="Meet your care team"
            title="Trusted expertise, chosen for you"
            text="Verified specialists with the experience and empathy you deserve."
          />
          <Button to="/doctors" variant="secondary">
            View all doctors <ArrowRight />
          </Button>
        </div>
        <div className="doctor-grid">
          {doctors.slice(0, 3).map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      </section>
      <section className="section ai-preview">
        <motion.div {...reveal} className="ai-copy">
          <span className="eyebrow">
            <BrainCircuit /> UHS Intelligence
          </span>
          <h2>Clarity when your health feels uncertain.</h2>
          <p>
            Share what you’re experiencing and receive an easy-to-understand
            health assessment, recommended next steps, and the right specialist
            in minutes.
          </p>
          {[
            "Private and secure by design",
            "Clear, evidence-aware guidance",
            "Connected to real clinical care",
          ].map((x) => (
            <div className="check-line" key={x}>
              <Check />
              {x}
            </div>
          ))}
          <Button to="/predict">
            Try AI health check <ArrowRight />
          </Button>
          <small>
            Not a medical diagnosis. For emergencies, contact local services.
          </small>
        </motion.div>
        <motion.div {...reveal} className="ai-demo card">
          <div className="ai-head">
            <span>
              <Sparkles />
            </span>
            <div>
              <b>Health assessment</b>
              <small>Analyzing 6 symptoms...</small>
            </div>
            <em>72%</em>
          </div>
          <div className="progress">
            <i />
          </div>
          <div className="symptom-tags">
            <span>Headache</span>
            <span>Fatigue</span>
            <span>Dry cough</span>
            <span>+3</span>
          </div>
          <div className="result-preview">
            <small>Most likely category</small>
            <b>Seasonal respiratory condition</b>
            <p>
              <span>Low–moderate severity</span>
              <span>Consult a physician</span>
            </p>
          </div>
        </motion.div>
      </section>
      <section className="section">
        <div className="split-heading">
          <SectionTitle
            eyebrow="Care near you"
            title="Top hospitals, closer than you think"
          />
          <Button to="/hospitals" variant="secondary">
            Explore map <MapPin />
          </Button>
        </div>
        <div className="hospital-grid">
          {hospitals.map((h) => (
            <HospitalCard key={h.name} hospital={h} />
          ))}
        </div>
      </section>
      <section className="section testimonials">
        <SectionTitle
          eyebrow="Patient stories"
          title="Care people remember"
          center
        />
        <div className="quote-grid">
          {[
            "“UHS helped me find the right specialist in one evening. The whole experience felt calm and clear.”",
            "“The health check gave me useful context without overwhelming me. I knew exactly what to do next.”",
            "“Booking and keeping track of my reports is finally effortless. This is what modern care should feel like.”",
          ].map((q, i) => (
            <blockquote className="card" key={q}>
              <div>★★★★★</div>
              <p>{q}</p>
              <footer>
                <span>{["FA", "DK", "NM"][i]}</span>
                <b>
                  {["Fatima Ali", "Daniel Kim", "Nadia Malik"][i]}
                  <small>Verified patient</small>
                </b>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="split-heading">
          <SectionTitle
            eyebrow="Health library"
            title="Good health starts with good information"
          />
          <Button to="/library" variant="ghost">
            View all articles <ArrowRight />
          </Button>
        </div>
        <div className="article-grid">
          {articles.map((a, i) => (
            <article className="article card" key={a.title}>
              <div className={`article-art art-${i}`}>
                <HeartPulse />
              </div>
              <span>{a.tag}</span>
              <h3>{a.title}</h3>
              <p>{a.read} · Reviewed by UHS clinicians</p>
            </article>
          ))}
        </div>
      </section>
      <section className="cta">
        <div>
          <span>YOUR HEALTH. YOUR NEXT STEP.</span>
          <h2>Better care begins with one simple decision.</h2>
          <p>Join thousands building healthier lives with UHS.</p>
        </div>
        <Button to="/register" variant="secondary">
          Create your free account <ArrowRight />
        </Button>
      </section>
    </>
  );
}

export function Doctors() {
  const [q, setQ] = useState("");
  const filtered = doctors.filter((d) =>
    (d.name + d.specialty + d.hospital).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="page">
      <div className="page-hero">
        <span className="eyebrow">Trusted specialists</span>
        <h1>Find the right doctor for you</h1>
        <p>
          Search verified professionals by specialty, experience, location and
          availability.
        </p>
        <div className="big-search">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search doctor, specialty or hospital"
          />
          <Button>Search</Button>
        </div>
      </div>
      <div className="listing-layout">
        <aside className="filters card">
          <h3>Filters</h3>
          {[
            "Specialization",
            "Availability",
            "Experience",
            "Gender",
            "Hospital",
            "Rating",
          ].map((x) => (
            <button key={x}>
              {x}
              <ChevronDown />
            </button>
          ))}
        </aside>
        <section className="results">
          <div className="results-head">
            <b>{filtered.length} doctors available</b>
            <button>
              Recommended <ChevronDown />
            </button>
          </div>
          <div className="doctor-grid">
            {filtered.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
export function DoctorProfile() {
  const { id } = useParams();
  const d = doctors.find((x) => x.id === Number(id)) || doctors[0];
  return (
    <div className="page profile-page">
      <div className="profile-cover">
        <div className="profile-main">
          <Avatar src={d.image} name={d.name} />
          <div>
            <span className="pill">{d.specialty}</span>
            <h1>{d.name}</h1>
            <p>MBBS, FCPS · {d.experience} years experience</p>
            <p>
              ★ {d.rating} ({d.reviews} patient reviews) · {d.hospital}
            </p>
          </div>
        </div>
        <Button to={`/book?doctor=${d.id}`}>Book an appointment</Button>
      </div>
      <div className="profile-grid">
        <div>
          <article className="card detail-card">
            <h2>About Dr. {d.name.split(" ").pop()}</h2>
            <p>
              {d.name} is a patient-focused {d.specialty.toLowerCase()} known
              for evidence-based care and clear communication. Every
              consultation is built around listening carefully and planning
              treatment together.
            </p>
            <h3>Expertise</h3>
            <div className="tags">
              <span>Preventive care</span>
              <span>Diagnostics</span>
              <span>Long-term health</span>
            </div>
          </article>
          <article className="card detail-card">
            <h2>Education & credentials</h2>
            <div className="timeline">
              <p>
                <b>Clinical Fellowship</b>
                <small>Royal College of Physicians · 2016</small>
              </p>
              <p>
                <b>FCPS, {d.specialty}</b>
                <small>College of Physicians & Surgeons · 2012</small>
              </p>
              <p>
                <b>MBBS</b>
                <small>University Medical College · 2008</small>
              </p>
            </div>
          </article>
        </div>
        <aside className="card appointment-card">
          <h3>Next available</h3>
          <strong>{d.available}</strong>
          <div className="date-row">
            <button>
              MON<em>21</em>
            </button>
            <button className="selected">
              TUE<em>22</em>
            </button>
            <button>
              WED<em>23</em>
            </button>
          </div>
          <div className="time-grid">
            {["09:00", "10:30", "12:00", "14:30"].map((x) => (
              <button key={x}>{x}</button>
            ))}
          </div>
          <Button to={`/book?doctor=${d.id}`}>Continue booking</Button>
        </aside>
      </div>
    </div>
  );
}

const symptoms = [
  "Headache",
  "Fever",
  "Dry cough",
  "Fatigue",
  "Sore throat",
  "Shortness of breath",
  "Nausea",
  "Body aches",
];
export function Prediction() {
  const [selected, setSelected] = useState<string[]>([]),
    [done, setDone] = useState(false);
  return (
    <div className="prediction-page">
      <div className="prediction-intro">
        <span className="eyebrow">
          <Sparkles /> UHS Intelligence
        </span>
        <h1>Understand what your body is telling you.</h1>
        <p>
          Tell us what you’re experiencing. Our AI-assisted assessment will
          organize your symptoms and suggest sensible next steps.
        </p>
        <div>
          <ShieldCheck />
          Your answers are private and encrypted
        </div>
      </div>
      <div className="prediction-shell">
        <section className="assessment card">
          <div className="step-head">
            <div>
              <small>STEP 1 OF 3</small>
              <h2>What are you feeling?</h2>
            </div>
            <span>33%</span>
          </div>
          <div className="progress">
            <i style={{ width: "33%" }} />
          </div>
          <label>
            Search symptoms
            <div className="input">
              <Search />
              <input placeholder="Type a symptom..." />
            </div>
          </label>
          <p>Select all that apply</p>
          <div className="symptom-grid">
            {symptoms.map((s) => (
              <button
                className={selected.includes(s) ? "chosen" : ""}
                onClick={() =>
                  setSelected((x) =>
                    x.includes(s) ? x.filter((y) => y !== s) : [...x, s],
                  )
                }
                key={s}
              >
                {selected.includes(s) && <Check />}
                {s}
              </button>
            ))}
          </div>
          <div className="form-row">
            <label>
              Age
              <input type="number" placeholder="28" />
            </label>
            <label>
              Gender
              <select>
                <option>Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <Button onClick={() => setDone(true)} disabled={!selected.length}>
            Analyze my symptoms <Sparkles />
          </Button>
        </section>
        <aside className={`prediction-result card ${done ? "revealed" : ""}`}>
          {done ? (
            <>
              <div className="result-icon">
                <Wind />
              </div>
              <span className="pill">AI ASSESSMENT COMPLETE</span>
              <h2>Likely respiratory condition</h2>
              <p>
                Your symptom pattern is commonly associated with a seasonal
                upper respiratory infection.
              </p>
              <div className="confidence">
                <span>Confidence</span>
                <b>84%</b>
                <i>
                  <em />
                </i>
              </div>
              <div className="severity">
                <span>Severity</span>
                <b>Low to moderate</b>
              </div>
              <h3>Recommended next steps</h3>
              {[
                "Rest and stay well hydrated",
                "Monitor your temperature",
                "Consult a general physician if symptoms persist",
              ].map((x) => (
                <p className="check-line" key={x}>
                  <Check />
                  {x}
                </p>
              ))}
              <Button to="/book">Book a physician</Button>
              <Button variant="ghost">Download report</Button>
              <small>
                This assessment is informational and does not replace a medical
                diagnosis.
              </small>
            </>
          ) : (
            <>
              <div className="result-empty">
                <BrainCircuit />
                <h3>Your assessment will appear here</h3>
                <p>
                  Select your symptoms to receive a clear, personalized health
                  summary.
                </p>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export function Hospitals() {
  return (
    <div className="page">
      <div className="page-hero">
        <span className="eyebrow">Care around the corner</span>
        <h1>Nearby hospitals & clinics</h1>
        <p>
          Find verified facilities, emergency departments and specialist care
          near you.
        </p>
      </div>
      <div className="map-placeholder">
        <div className="map-grid" />
        <div className="map-pin p1">
          <HeartPulse />
        </div>
        <div className="map-pin p2">
          <HeartPulse />
        </div>
        <div className="map-pin p3">
          <HeartPulse />
        </div>
        <div className="map-search">
          <Search /> Islamabad, Pakistan
        </div>
      </div>
      <div className="hospital-grid page-cards">
        {hospitals.map((h) => (
          <HospitalCard key={h.name} hospital={h} />
        ))}
      </div>
    </div>
  );
}
export function Library() {
  return (
    <div className="page">
      <div className="page-hero">
        <span className="eyebrow">Clinically reviewed</span>
        <h1>Health knowledge for everyday life</h1>
        <p>Clear, reliable guidance to help you make informed decisions.</p>
        <div className="big-search">
          <Search />
          <input placeholder="Search conditions, topics and wellbeing" />
          <Button>Explore</Button>
        </div>
      </div>
      <div className="category-row">
        {[
          "All topics",
          "Nutrition",
          "Mental health",
          "Fitness",
          "Vaccination",
          "Conditions",
        ].map((x) => (
          <button key={x}>{x}</button>
        ))}
      </div>
      <div className="article-grid page-cards">
        {[...articles, ...articles].map((a, i) => (
          <article className="article card" key={i}>
            <div className={`article-art art-${i % 3}`}>
              <HeartPulse />
            </div>
            <span>{a.tag}</span>
            <h3>{a.title}</h3>
            <p>{a.read} · Clinically reviewed</p>
          </article>
        ))}
      </div>
    </div>
  );
}
export function About() {
  return (
    <div className="page story">
      <div className="page-hero">
        <span className="eyebrow">Our purpose</span>
        <h1>Healthcare accessible to everyone.</h1>
        <p>
          UHS brings trustworthy guidance, compassionate professionals and
          connected care into one simple experience.
        </p>
      </div>
      <div className="story-grid">
        <div>
          <SectionTitle
            eyebrow="Why we exist"
            title="A healthier future should feel within reach"
          />
          <p>
            Healthcare can be fragmented, confusing and hard to access. We’re
            building a system that helps people understand their health and
            reach qualified care with confidence.
          </p>
        </div>
        <div className="values card">
          <div>
            <ShieldCheck />
            <b>Trust by design</b>
            <p>
              Privacy, transparency and responsible technology guide every
              choice.
            </p>
          </div>
          <div>
            <Users />
            <b>Care for everyone</b>
            <p>
              Inclusive experiences across backgrounds, abilities and locations.
            </p>
          </div>
          <div>
            <Sparkles />
            <b>Progress with purpose</b>
            <p>AI supports human care—it never replaces clinical judgment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export function Contact() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = useForm();
  return (
    <div className="page contact">
      <div>
        <span className="eyebrow">We’re here to help</span>
        <h1>Let’s start a conversation.</h1>
        <p>
          Questions about UHS, your account, or partnering with us? Our care
          team is ready.
        </p>
        <div className="contact-line">
          <Phone />
          <span>
            <b>Call us</b>+92 51 111 847 847
          </span>
        </div>
        <div className="contact-line">
          <Clock />
          <span>
            <b>Support hours</b>24 hours, 7 days a week
          </span>
        </div>
      </div>
      <form className="card" onSubmit={handleSubmit(() => {})}>
        {isSubmitSuccessful ? (
          <div className="success-state">
            <Check />
            <h2>Message received</h2>
            <p>We’ll be in touch shortly.</p>
          </div>
        ) : (
          <>
            <h2>Send us a message</h2>
            <label>
              Full name
              <input
                {...register("name", { required: true })}
                placeholder="Your name"
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                {...register("email", { required: true })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              How can we help?
              <select>
                <option>General question</option>
                <option>Patient support</option>
                <option>Partnership</option>
              </select>
            </label>
            <label>
              Message
              <textarea rows={5} placeholder="Tell us a little more..." />
            </label>
            <Button type="submit">
              Send message <ArrowRight />
            </Button>
          </>
        )}
      </form>
    </div>
  );
}

export function Book() {
  const [step, setStep] = useState(1);
  const d = doctors[0];
  return (
    <div className="page booking">
      <div className="booking-head">
        <span className="eyebrow">Simple, secure booking</span>
        <h1>{step === 4 ? "You’re all set!" : "Book an appointment"}</h1>
        <div className="steps">
          {["Doctor", "Date & time", "Details", "Confirmed"].map((x, i) => (
            <span className={step >= i + 1 ? "active" : ""} key={x}>
              <i>{step > i + 1 ? <Check /> : i + 1}</i>
              {x}
            </span>
          ))}
        </div>
      </div>
      <div className="booking-card card">
        {step === 1 && (
          <>
            <h2>Choose your doctor</h2>
            <div className="booking-doctor">
              <Avatar src={d.image} name={d.name} />
              <div>
                <h3>{d.name}</h3>
                <p>
                  {d.specialty} · ★ {d.rating}
                </p>
              </div>
              <Check />
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Select a date and time</h2>
            <div className="date-row large">
              {["Mon 21", "Tue 22", "Wed 23", "Thu 24"].map((x, i) => (
                <button className={i === 1 ? "selected" : ""} key={x}>
                  {x}
                </button>
              ))}
            </div>
            <div className="time-grid">
              {[
                "09:00 AM",
                "10:30 AM",
                "12:00 PM",
                "02:30 PM",
                "04:00 PM",
                "05:30 PM",
              ].map((x) => (
                <button key={x}>{x}</button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Tell us what brings you in</h2>
            <label>
              Reason for appointment
              <select>
                <option>New health concern</option>
                <option>Follow-up</option>
                <option>Routine checkup</option>
              </select>
            </label>
            <label>
              Symptoms or notes
              <textarea
                rows={5}
                placeholder="Describe your symptoms briefly..."
              />
            </label>
          </>
        )}
        {step === 4 && (
          <div className="success-state">
            <Check />
            <h2>Appointment confirmed</h2>
            <p>Tuesday, July 22 at 10:30 AM with {d.name}</p>
            <strong>UHS-APT-260722-1842</strong>
            <Button to="/dashboard/patient">View my appointments</Button>
          </div>
        )}
        {step < 4 && (
          <div className="booking-actions">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={() => setStep(step + 1)}>
              {step === 3 ? "Confirm appointment" : "Continue"} <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
export function Auth({ mode }: { mode: "login" | "register" | "forgot" }) {
  const title =
    mode === "login"
      ? "Welcome back"
      : mode === "register"
        ? "Create your UHS account"
        : "Reset your password";
  return (
    <div className="auth-page">
      <div className="auth-art">
        <HeartPulse />
        <h1>Care that stays with you.</h1>
        <p>
          Appointments, insights and records—one beautifully simple health
          journey.
        </p>
      </div>
      <form className="auth-form card">
        <Link to="/" className="auth-logo">
          <HeartPulse /> UHS
        </Link>
        <span className="eyebrow">YOUR HEALTH, CONNECTED</span>
        <h1>{title}</h1>
        <p>
          {mode === "login"
            ? "Access your personal health space securely."
            : "Start your healthier journey in a few minutes."}
        </p>
        {mode === "register" && (
          <div className="role-row">
            {["Patient", "Doctor", "Admin"].map((x) => (
              <button type="button" key={x}>
                {x}
              </button>
            ))}
          </div>
        )}
        {mode !== "forgot" && (
          <label>
            Full name
            {mode === "register" && (
              <input placeholder="Enter your full name" />
            )}
          </label>
        )}
        <label>
          Email address
          <input type="email" placeholder="you@example.com" />
        </label>
        {mode !== "forgot" && (
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
        )}
        <Button type="submit">
          {mode === "login"
            ? "Sign in"
            : mode === "register"
              ? "Create account"
              : "Send reset link"}{" "}
          <ArrowRight />
        </Button>
        {mode === "login" && (
          <Link to="/forgot-password">Forgot password?</Link>
        )}
        <p>
          {mode === "login" ? (
            <>
              New to UHS? <Link to="/register">Create an account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export function Dashboard() {
  const { role = "patient" } = useParams();
  const chart = useMemo(
    () => [
      { d: "Mon", v: 62 },
      { d: "Tue", v: 69 },
      { d: "Wed", v: 65 },
      { d: "Thu", v: 78 },
      { d: "Fri", v: 74 },
      { d: "Sat", v: 82 },
      { d: "Sun", v: 86 },
    ],
    [],
  );
  return (
    <div className="dashboard">
      <aside>
        <Link to="/" className="auth-logo">
          <HeartPulse /> UHS
        </Link>
        <small>{role.toUpperCase()} PORTAL</small>
        {[
          "Overview",
          "Appointments",
          "Medical records",
          "Prescriptions",
          "Lab results",
          "Notifications",
          "Settings",
        ].map((x, i) => (
          <button className={i === 0 ? "active" : ""} key={x}>
            <Activity />
            {x}
          </button>
        ))}
      </aside>
      <section>
        <header>
          <div>
            <small>TUESDAY, JULY 21</small>
            <h1>Good morning, {role === "doctor" ? "Dr. Sarah" : "Ayesha"}.</h1>
            <p>Here’s what’s happening with your care today.</p>
          </div>
          <Avatar src={doctors[2].image} name="Ayesha Khan" />
        </header>
        <div className="dash-stats">
          <div className="card">
            <span>
              <HeartPulse />
            </span>
            <small>Health score</small>
            <strong>86</strong>
            <em>+4 this month</em>
          </div>
          <div className="card">
            <span>
              <CalendarDays />
            </span>
            <small>Appointments</small>
            <strong>02</strong>
            <em>Next today, 4:30</em>
          </div>
          <div className="card">
            <span>
              <ClipboardPlus />
            </span>
            <small>Active plans</small>
            <strong>03</strong>
            <em>All on track</em>
          </div>
        </div>
        <div className="dash-grid">
          <article className="card chart-card">
            <div className="row">
              <div>
                <h3>Your health trend</h3>
                <p>Wellbeing score · Last 7 days</p>
              </div>
              <span className="pill">Weekly</span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0f6fff" stopOpacity=".35" />
                    <stop offset="1" stopColor="#0f6fff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#0f6fff"
                  strokeWidth={3}
                  fill="url(#g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </article>
          <article className="card next-appointment">
            <h3>Next appointment</h3>
            <div>
              <Avatar src={doctors[0].image} name={doctors[0].name} />
              <b>
                {doctors[0].name}
                <small>{doctors[0].specialty}</small>
              </b>
            </div>
            <p>
              <CalendarDays /> Today, 4:30 PM
            </p>
            <p>
              <Video /> Video consultation
            </p>
            <Button>Join consultation</Button>
          </article>
        </div>
      </section>
    </div>
  );
}
export function NotFound() {
  return (
    <div className="not-found">
      <span>404</span>
      <h1>This page took a wrong turn.</h1>
      <p>Let’s get you back to somewhere helpful.</p>
      <Button to="/">Return home</Button>
    </div>
  );
}
