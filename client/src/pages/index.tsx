import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  Bot,
  Building2,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardPlus,
  Clock,
  FileHeart,
  FileText,
  HeartPulse,
  MapPin,
  LockKeyhole,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Users,
  UserRound,
  Video,
  Wind,
  Zap,
} from "lucide-react";
import { Button, DoctorCard, SectionTitle, Avatar } from "../components/ui";
import { doctors } from "../data/mockData";
import generatedArticles from "../data/generatedArticles.json";
import { api, uploadRegistrationAvatar, uploadUrl } from "../services/api";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BlogModal, HealthLibrary } from "../components/HealthLibrary";
import { healthBlogs, type HealthBlog } from "../data/healthBlogs";
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
type ArticleSection = { heading: string; blocks: string[] };
type Article = {
  id: string;
  title: string;
  shortTitle: string;
  heading: string;
  description: string;
  readingTime: string;
  category: string;
  keywords: string[];
  updatedAt: string;
  sections: ArticleSection[];
};
const realArticles = generatedArticles as Article[];
function ArticleCard({
  article,
  index,
  onOpen,
}: {
  article: Article;
  index: number;
  onOpen: (article: Article) => void;
}) {
  return (
    <article
      className="article card real-article-card"
      onClick={() => onOpen(article)}
    >
      <div className={`article-art art-${index % 3}`}>
        <FileHeart />
      </div>
      <span>{article.category}</span>
      <h3>{article.shortTitle}</h3>
      <b>{article.heading}</b>
      <p>{article.description}</p>
      <small>{article.readingTime}</small>
      <Button variant="ghost" onClick={() => onOpen(article)}>
        Read More <ArrowRight />
      </Button>
    </article>
  );
}
function ArticleModal({
  article,
  onClose,
}: {
  article: Article | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!article) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", close);
    };
  }, [article, onClose]);
  if (!article) return null;
  return (
    <div className="article-modal-backdrop" onMouseDown={onClose}>
      <motion.article
        className="article-modal"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="article-modal-close" onClick={onClose}>
          Close
        </button>
        <header>
          <span className="pill">{article.category}</span>
          <h1>{article.title}</h1>
          <p>
            {article.readingTime} · Updated{" "}
            {new Date(article.updatedAt).toLocaleDateString()}
          </p>
        </header>
        <div className="medical-note">
          <ShieldCheck />
          <span>
            This article is educational and does not replace advice from a
            qualified clinician.
          </span>
        </div>
        <div className="article-content">
          {article.sections.map((section, i) => (
            <section key={`${section.heading}-${i}`}>
              <h2>{section.heading}</h2>
              {section.blocks.map((block, j) =>
                /^([•\-*]|\d+[.)])\s+/.test(block) ? (
                  <li key={j}>{block.replace(/^([•\-*]|\d+[.)])\s+/, "")}</li>
                ) : (
                  <p key={j}>{block}</p>
                ),
              )}
            </section>
          ))}
        </div>
        <Button onClick={onClose}>Close Article</Button>
      </motion.article>
    </div>
  );
}
function OverviewArticleCard({
  article,
  index,
  onOpen,
}: {
  article: Article;
  index: number;
  onOpen: (article: Article) => void;
}) {
  return (
    <article className="article card real-article-card">
      <button className="article-card-trigger" onClick={() => onOpen(article)}>
        <div className={`article-art art-${index % 3}`}>
          <FileHeart />
        </div>
        <span>{article.category}</span>
        <h3>{article.shortTitle}</h3>
        <b>{article.heading}</b>
        <p>{article.description}</p>
        <small>{article.readingTime}</small>
        <span className="article-read-more">
          Read More <ArrowRight />
        </span>
      </button>
    </article>
  );
}
function OverviewArticleModal({
  article,
  onClose,
}: {
  article: Article | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!article) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", close);
    };
  }, [article, onClose]);
  if (!article) return null;
  const paragraphs = [
    article.description,
    ...article.sections.flatMap((section) => section.blocks),
  ]
    .filter(
      (block, index, all) => block.length > 80 && all.indexOf(block) === index,
    )
    .slice(0, 2);
  if (!paragraphs.length)
    paragraphs.push("A concise overview is not available for this article.");
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(article.title)}`;
  return (
    <div className="article-modal-backdrop" onMouseDown={onClose}>
      <motion.article
        className="article-modal"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="article-modal-close" onClick={onClose}>
          Close
        </button>
        <header>
          <span className="pill">{article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.readingTime} · Article overview</p>
        </header>
        <div className="medical-note">
          <ShieldCheck />
          <span>
            This article is educational and does not replace advice from a
            qualified clinician.
          </span>
        </div>
        <div className="article-content">
          <section>
            <h2>Overview</h2>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>
        </div>
        <div className="article-modal-actions">
          <a
            className="btn btn-secondary"
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
          >
            Read full article on Google <ArrowRight />
          </a>
          <Button onClick={onClose}>Close Article</Button>
        </div>
      </motion.article>
    </div>
  );
}
const mapDoctor = (d: any) => ({
  id: d.id,
  name: `Dr. ${d.user?.firstName ?? ""} ${d.user?.lastName ?? ""}`.trim(),
  specialty: d.specialization ?? "General Medicine",
  hospital: d.hospital?.name ?? d.hospital ?? "UHS Clinic",
  experience: d.experienceYears ?? 0,
  rating: d.averageRating ?? 4.8,
  reviews: d.reviews?.length ?? 0,
  image: uploadUrl(d.user?.avatarUrl),
  available: d.availability?.[0]
    ? `${d.availability[0].startTime}-${d.availability[0].endTime}`
    : "Available today",
  qualification: d.qualification,
  bio: d.bio,
  availability: d.availability ?? [],
});
export function Home() {
  const [activeArticle, setActiveArticle] = useState<HealthBlog | null>(null);
  return (
    <>
      <section className="hero">
        <div className="hero-shade" />
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1>
            Universal Standard for
            <br />
            <em>Modern Healthcare</em>
          </h1>
          <p>
            One secure platform to understand your health, find trusted doctors,
            and access better care wherever life takes you.
          </p>
          {/*
          <p>
            One secure platform to understand your health, find trusted doctors,
            and access better care—wherever life takes you.
          </p>
          */}
          <div className="hero-actions">
            <Button to="/predict">
              Check your symptoms <ArrowRight />
            </Button>
            <Button to="/doctors" variant="secondary">
              <CalendarDays /> Book appointment
            </Button>
          </div>
          <div className="hero-proof" aria-label="UHS care metrics">
            <div>
              <strong>4.9/5</strong>
              <span>Patient rating</span>
            </div>
            <i />
            <div>
              <strong>50,000+</strong>
              <span>People supported</span>
            </div>
            <i />
            <div>
              <strong>24/7</strong>
              <span>Care access</span>
            </div>
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
          {healthBlogs.slice(0, 3).map((article) => (
            <motion.article
              whileHover={{ y: -6 }}
              className="health-blog-card card"
              tabIndex={0}
              role="button"
              onClick={() => setActiveArticle(article)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveArticle(article);
                }
              }}
              key={article.id}
            >
              <img
                src={article.coverImage}
                alt={article.alt}
                loading="lazy"
                decoding="async"
              />
              <div className="health-blog-card-body">
                <span className="pill">{article.category}</span>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <small>{article.readingTime}</small>
                <Button variant="ghost" onClick={() => setActiveArticle(article)}>
                  Read More <ArrowRight />
                </Button>
              </div>
            </motion.article>
          ))}
          {/*
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
          */}
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
      <BlogModal
        blog={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </>
  );
}

export function Doctors() {
  const [q, setQ] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [liveDoctors, setLiveDoctors] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    api<any[]>("/doctors")
      .then((x) => setLiveDoctors(x.map(mapDoctor)))
      .catch((error) => {
        setLiveDoctors([]);
        setLoadError(
          error instanceof Error ? error.message : "Unable to load doctors",
        );
      });
  }, []);
  const filtered = (liveDoctors ?? []).filter((d) => {
    const matchesSearch = (d.name + d.specialty + d.hospital)
      .toLowerCase()
      .includes(q.toLowerCase());
    const matchesSpecialization =
      !specializationFilter || d.specialty === specializationFilter;
    const matchesAvailability =
      availabilityFilter === "" ||
      (d.availability ?? []).some(
        (slot: any) =>
          slot.active !== false &&
          slot.dayOfWeek === Number(availabilityFilter),
      );
    return matchesSearch && matchesSpecialization && matchesAvailability;
  });
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
          <label>
            Specialization
            <select
              value={specializationFilter}
              onChange={(event) => setSpecializationFilter(event.target.value)}
            >
              <option value="">All specializations</option>
              {specializations.map((specialization) => (
                <option value={specialization} key={specialization}>
                  {specialization}
                </option>
              ))}
            </select>
          </label>
          <label>
            Availability
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
            >
              <option value="">All available days</option>
              {weekDays.map((day, index) => (
                <option value={index} key={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        </aside>
        <section className="results">
          <div className="results-head">
            <b>{filtered.length} doctors available</b>
            <button>
              Recommended <ChevronDown />
            </button>
          </div>
          <div className="doctor-grid">
            {liveDoctors === null && <p>Loading registered doctors...</p>}
            {loadError && (
              <p className="form-error" role="alert">
                {loadError}
              </p>
            )}
            {liveDoctors !== null && !loadError && !filtered.length && (
              <p>No approved doctors are registered yet.</p>
            )}
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
  const [liveDoctor, setLiveDoctor] = useState<any>();
  useEffect(() => {
    if (id)
      api<any>(`/doctors/${id}`)
        .then((x) => setLiveDoctor(mapDoctor(x)))
        .catch(() => setLiveDoctor(null));
  }, [id]);
  if (liveDoctor === undefined)
    return (
      <div className="page">
        <p>Loading doctor profile...</p>
      </div>
    );
  if (liveDoctor === null)
    return (
      <div className="page">
        <h1>Doctor not found</h1>
        <p>This doctor is not registered or approved.</p>
        <Button to="/doctors">Back to doctors</Button>
      </div>
    );
  const d = liveDoctor;
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
              {d.bio ??
                `${d.name} is a patient-focused ${d.specialty.toLowerCase()} known for evidence-based care and clear communication. Every consultation is built around listening carefully and planning treatment together.`}
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
type OsmHospital = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distanceKm: number;
  emergency: boolean;
};
const userLocationIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const hospitalIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
) {
  const r = 6371,
    p = Math.PI / 180,
    dLat = (b.lat - a.lat) * p,
    dLon = (b.lon - a.lon) * p;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(x));
}
function RecenterMap({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}
export function Prediction() {
  const location = useLocation();
  const [selected, setSelected] = useState<string[]>([]),
    [result, setResult] = useState<{
      disease: string;
      confidence: number;
      severity: string;
      specialist: string;
      recommendedMedicines: string[];
      suggestedTests: string[];
    } | null>(null),
    [age, setAge] = useState(28),
    [gender, setGender] = useState("Female"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const saved = new URLSearchParams(location.search).get("symptoms");
    if (saved)
      setSelected(
        saved
          .split(",")
          .map((item) => item.trim())
          .filter((item) => symptoms.includes(item)),
      );
  }, [location.search]);
  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      setResult(
        await api("/predictions", {
          method: "POST",
          body: JSON.stringify({ symptoms: selected, age, gender }),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assessment failed");
    } finally {
      setLoading(false);
    }
  };
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
              <input
                type="number"
                value={age}
                onChange={(event) => setAge(Number(event.target.value))}
                min="0"
                max="120"
              />
            </label>
            <label>
              Gender
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button onClick={analyze} disabled={!selected.length || loading}>
            {loading ? "Analyzing securely..." : "Analyze my symptoms"}{" "}
            <Sparkles />
          </Button>
        </section>
        <aside className={`prediction-result card ${result ? "revealed" : ""}`}>
          {result ? (
            <>
              <div className="result-icon">
                <Wind />
              </div>
              <span className="pill">AI ASSESSMENT COMPLETE</span>
              <h2>{result.disease}</h2>
              <p>
                Your symptom pattern is commonly associated with a seasonal
                upper respiratory infection.
              </p>
              <div className="confidence">
                <span>Confidence</span>
                <b>{Math.round(result.confidence * 100)}%</b>
                <i>
                  <em style={{ width: `${result.confidence * 100}%` }} />
                </i>
              </div>
              <div className="severity">
                <span>Severity</span>
                <b>{result.severity.replaceAll("_", " ").toLowerCase()}</b>
              </div>
              <h3>Recommended next steps</h3>
              {[`Consult a ${result.specialist}`, ...result.suggestedTests].map(
                (x) => (
                  <p className="check-line" key={x}>
                    <Check />
                    {x}
                  </p>
                ),
              )}
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
  const fallback = { lat: 33.6844, lon: 73.0479 };
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [items, setItems] = useState<OsmHospital[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"nearby" | "search">("nearby");
  const [mapZoom, setMapZoom] = useState(13);
  const center = location ?? fallback;
  const fetchHospitals = async (pos: { lat: number; lon: number }) => {
    setLoading(true);
    setError("");
    setMode("nearby");
    try {
      const body = `[out:json][timeout:25];(node["amenity"~"hospital|clinic"](around:10000,${pos.lat},${pos.lon});way["amenity"~"hospital|clinic"](around:10000,${pos.lat},${pos.lon});relation["amenity"~"hospital|clinic"](around:10000,${pos.lat},${pos.lon}););out center tags 80;`;
      let res: Response | null = null;
      for (const endpoint of [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
      ]) {
        res = await fetch(endpoint, { method: "POST", body }).catch(() => null);
        if (res?.ok) break;
      }
      if (!res?.ok)
        throw new Error(
          "Nearby hospital refresh is temporarily unavailable. Showing the last results.",
        );
      const json = await res.json();
      const mapped = (json.elements ?? [])
        .map((x: any) => {
          const lat = x.lat ?? x.center?.lat,
            lon = x.lon ?? x.center?.lon,
            t = x.tags ?? {};
          if (!lat || !lon) return null;
          const address =
            [t["addr:housenumber"], t["addr:street"], t["addr:city"]]
              .filter(Boolean)
              .join(", ") ||
            t["addr:full"] ||
            "Address not available";
          return {
            id: String(x.id),
            name: t.name || "Unnamed hospital/clinic",
            address,
            lat,
            lon,
            distanceKm: haversineKm(pos, { lat, lon }),
            emergency: t.emergency === "yes" || t.healthcare === "hospital",
          };
        })
        .filter(Boolean)
        .sort(
          (a: OsmHospital, b: OsmHospital) => a.distanceKm - b.distanceKm,
        ) as OsmHospital[];
      setItems(mapped);
    } catch (e) {
      if (items.length === 0)
        setError(
          e instanceof Error ? e.message : "Unable to search nearby hospitals",
        );
    } finally {
      setLoading(false);
    }
  };
  const searchAnyHospital = async () => {
    const term = query.trim();
    if (!term) {
      fetchHospitals(center);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=20&addressdetails=1&q=${encodeURIComponent(`${term} hospital`)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Search is unavailable right now.");
      const json = await res.json();
      const mapped = (json ?? [])
        .map((x: any) => {
          const lat = Number(x.lat),
            lon = Number(x.lon);
          if (!lat || !lon) return null;
          return {
            id: String(x.place_id),
            name: x.name || x.display_name?.split(",")[0] || term,
            address: x.display_name || "Address not available",
            lat,
            lon,
            distanceKm: haversineKm(center, { lat, lon }),
            emergency: false,
          };
        })
        .filter(Boolean) as OsmHospital[];
      setMode("search");
      setItems(mapped.sort((a, b) => a.distanceKm - b.distanceKm));
      if (mapped[0]) {
        setLocation({ lat: mapped[0].lat, lon: mapped[0].lon });
        setMapZoom(13);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to search hospital by name",
      );
    } finally {
      setLoading(false);
    }
  };
  const refreshLocation = () => {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lon: coords.longitude };
        setLocation(pos);
        setMapZoom(13);
        fetchHospitals(pos);
      },
      () => {
        setError(
          "Location permission was denied. Enable location access or use search from the default map area.",
        );
        setLocation(fallback);
        fetchHospitals(fallback);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };
  useEffect(() => {
    refreshLocation();
  }, []);
  const filtered =
    mode === "nearby"
      ? items.filter((h) =>
          (h.name + h.address).toLowerCase().includes(query.toLowerCase()),
        )
      : items;
  return (
    <div className="page">
      <div className="page-hero">
        <span className="eyebrow">Care around the corner</span>
        <h1>Nearby hospitals & clinics</h1>
        <p>
          Find verified facilities, emergency departments and specialist care
          near you.
        </p>
        <div className="big-search">
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchAnyHospital();
            }}
            placeholder="Search any hospital by name or filter nearby results"
          />
          <Button onClick={searchAnyHospital}>Search hospitals</Button>
        </div>
      </div>
      <div className="osm-layout page-cards">
        <section className="osm-map-card card">
          <div className="osm-toolbar">
            <div>
              <b>
                {mode === "nearby"
                  ? "Hospitals within 10 km"
                  : "Hospital search results"}
              </b>
              <small>
                {mode === "nearby"
                  ? location
                    ? "Using your current location"
                    : "Using default map area"
                  : "Search is free through OpenStreetMap Nominatim"}
              </small>
            </div>
            <div>
              <Button variant="secondary" onClick={refreshLocation}>
                Refresh location
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setMapZoom(15);
                }}
              >
                Zoom to current location
              </Button>
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {loading && (
            <div className="map-loading">
              <span /> Searching nearby hospitals...
            </div>
          )}
          <MapContainer
            center={[center.lat, center.lon]}
            zoom={mapZoom}
            className="osm-map"
            scrollWheelZoom
          >
            <RecenterMap center={[center.lat, center.lon]} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[center.lat, center.lon]} icon={userLocationIcon}>
              <Popup>
                Your current location
                <br />
                {center.lat.toFixed(5)}, {center.lon.toFixed(5)}
              </Popup>
            </Marker>
            {filtered.map((h) => (
              <Marker key={h.id} position={[h.lat, h.lon]} icon={hospitalIcon}>
                <Popup>
                  <strong>{h.name}</strong>
                  <br />
                  {h.address}
                  <br />
                  Distance: {h.distanceKm.toFixed(2)} km
                  <br />
                  Lat/Lon: {h.lat.toFixed(5)}, {h.lon.toFixed(5)}
                  <br />
                  <a
                    target="_blank"
                    href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`}
                  >
                    Open in Google Maps
                  </a>
                  <br />
                  <a
                    target="_blank"
                    href={`https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lon}#map=17/${h.lat}/${h.lon}`}
                  >
                    Open in OpenStreetMap
                  </a>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>
        <aside className="osm-results">
          {filtered.length === 0 && !loading ? (
            <article className="card osm-hospital-card">
              <h3>No hospitals found</h3>
              <p>Try refreshing location or searching a different term.</p>
            </article>
          ) : (
            filtered.map((h) => (
              <article className="card osm-hospital-card" key={h.id}>
                <span className="pill">
                  {h.emergency ? "Emergency" : "Hospital / Clinic"}
                </span>
                <h3>{h.name}</h3>
                <p>
                  <MapPin size={15} />
                  {h.address}
                </p>
                <p>
                  {h.distanceKm.toFixed(2)} km away · {h.lat.toFixed(5)},{" "}
                  {h.lon.toFixed(5)}
                </p>
                <div className="card-actions">
                  <a
                    className="btn btn-secondary"
                    target="_blank"
                    href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`}
                  >
                    Google Maps
                  </a>
                  <a
                    className="btn btn-ghost"
                    target="_blank"
                    href={`https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lon}#map=17/${h.lat}/${h.lon}`}
                  >
                    OpenStreetMap
                  </a>
                </div>
              </article>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
export function Library() {
  return <HealthLibrary />;
}
function ImpactCounter({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);
  const numeric = typeof value === "number" ? value : Number.parseInt(value);
  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      setCount(Math.min(numeric, Math.round((numeric * frame) / 28)));
      if (frame >= 28) window.clearInterval(timer);
    }, 30);
    return () => window.clearInterval(timer);
  }, [visible, numeric]);
  return (
    <div ref={ref} className="impact-stat">
      <strong>
        {count}
        {typeof value === "string" && value.includes("+") ? "+" : ""}
      </strong>
      <span>{label}</span>
    </div>
  );
}
const aboutFeatures = [
  {
    icon: Bot,
    title: "AI-Powered Healthcare",
    text: "Clear health guidance when you need it.",
  },
  {
    icon: Stethoscope,
    title: "Verified Doctors",
    text: "Trusted specialists for every next step.",
  },
  {
    icon: LockKeyhole,
    title: "Secure Medical Records",
    text: "Your health data, private by design.",
  },
  {
    icon: Zap,
    title: "Fast & Seamless",
    text: "One connected experience for modern care.",
  },
];
const aboutServices = [
  {
    icon: BrainCircuit,
    title: "AI Disease Prediction",
    text: "Understand symptoms with intelligent guidance.",
  },
  {
    icon: CalendarDays,
    title: "Book Appointments",
    text: "Find and schedule trusted care quickly.",
  },
  {
    icon: ClipboardPlus,
    title: "Digital Prescriptions",
    text: "Keep treatment details close at hand.",
  },
  {
    icon: FileText,
    title: "Medical Reports",
    text: "Access important records in one place.",
  },
  {
    icon: Activity,
    title: "Health Analytics",
    text: "Make sense of meaningful health trends.",
  },
  {
    icon: HeartPulse,
    title: "Personalized Health Plans",
    text: "Better routines tailored around you.",
  },
];
function ExpandedAbout() {
  return (
    <div className="about-page">
      <section className="about-hero section">
        <motion.div
          className="about-hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="eyebrow">
            <HeartPulse /> Universal Health System
          </span>
          <h1>
            About <em>UHS</em>
          </h1>
          <p>
            Delivering modern, intelligent healthcare through one secure digital
            platform.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
export function About() {
  return (
    <div className="about-compact">
      <motion.div
        className="about-compact-copy"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <span className="eyebrow">
          <HeartPulse /> About UHS
        </span>
        <h1>
          Universal <em>Health System</em>
        </h1>
        <p>
          Excellence in healthcare, connected through one secure and intelligent
          platform that makes everyday care easier to understand and access.
        </p>
        <Button to="/contact" variant="secondary">
          Contact Us <ArrowRight />
        </Button>
      </motion.div>
      <div className="about-compact-cards">
        {[
          {
            icon: Bot,
            title: "Intelligent Care",
            text: "UHS brings helpful health guidance, meaningful insights, and clearer next steps together in one modern experience. It helps you feel informed before, during, and after every care decision.",
          },
          {
            icon: Stethoscope,
            title: "Excellence in Service",
            text: "Connect with trusted, verified professionals and manage appointments with less friction. Every interaction is designed to make quality healthcare feel simpler, faster, and more personal.",
          },
          {
            icon: LockKeyhole,
            title: "Secure & Connected",
            text: "Your health information remains protected, organized, and available in one private place. UHS keeps the details that matter connected, so your care journey stays clear and continuous.",
          },
        ].map(({ icon: Icon, ...item }, index) => (
          <motion.article
            key={item.title}
            className="compact-value card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.08 }}
            whileHover={{ y: -5 }}
          >
            <span>
              <Icon />
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
function LegacyAbout() {
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
  const location = useLocation();
  const selectedDoctorId = new URLSearchParams(location.search).get("doctor");
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [chosenDoctorId, setChosenDoctorId] = useState<string | null>(
    selectedDoctorId,
  );
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  );
  const [time, setTime] = useState("10:30");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [reason, setReason] = useState("New health concern");
  const [notes, setNotes] = useState("");
  const [created, setCreated] = useState<any>(null);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  useEffect(() => {
    api<any[]>("/doctors")
      .then((x) => setAvailableDoctors(x.map(mapDoctor)))
      .catch(() => setAvailableDoctors([]));
  }, []);
  const d =
    availableDoctors.find((x) => String(x.id) === String(chosenDoctorId)) ??
    availableDoctors.find((x) => String(x.id) === String(selectedDoctorId)) ??
    availableDoctors[0];
  const availableDays = useMemo(
    () =>
      Array.from(
        new Set(
          (d?.availability ?? [])
            .filter((slot: any) => slot.active !== false)
            .map((slot: any) => slot.dayOfWeek),
        ),
      ) as number[],
    [d],
  );
  const queueTimes = useMemo(() => {
    if (selectedDay === null) return [];
    return (d?.availability ?? [])
      .filter(
        (slot: any) => slot.active !== false && slot.dayOfWeek === selectedDay,
      )
      .flatMap((slot: any) => {
        const result: string[] = [];
        const [sh, sm] = slot.startTime.split(":").map(Number),
          [eh, em] = slot.endTime.split(":").map(Number);
        for (let value = sh * 60 + sm; value < eh * 60 + em; value += 30)
          result.push(
            `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`,
          );
        return result;
      });
  }, [d, selectedDay]);
  useEffect(() => {
    if (!d) return;
    setSelectedDay((current) =>
      availableDays.includes(current ?? -1)
        ? current
        : (availableDays[0] ?? null),
    );
  }, [d?.id, availableDays.join(",")]);
  useEffect(() => {
    if (selectedDay === null) return;
    const delta = (selectedDay - new Date().getDay() + 7) % 7 || 7,
      next = new Date();
    next.setDate(next.getDate() + delta);
    setDate(next.toISOString().slice(0, 10));
    setTime(queueTimes[0] ?? "");
  }, [selectedDay, queueTimes.join(",")]);
  const confirm = async () => {
    if (!d || selectedDay === null) return;
    setError("");
    try {
      const startsAt = new Date(`${date}T${time}:00`).toISOString();
      const appt = await api<any>("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId: d.id,
          startsAt,
          selectedDay,
          selectedTime: time,
          reason,
          symptoms: notes
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        }),
      });
      setCreated(appt);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to book appointment");
    }
  };
  if (!d)
    return (
      <div className="page">
        <h1>No doctors available</h1>
        <p>No approved doctors are registered yet.</p>
        <Button to="/doctors">View doctors</Button>
      </div>
    );
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
            <h2>Select a day and time</h2>
            <label>
              Day
              <select
                value={selectedDay ?? ""}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
              >
                {availableDays.map((day) => (
                  <option value={day} key={day}>
                    {weekDays[day]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Time
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {queueTimes.map((value: string) => (
                  <option value={value} key={value}>
                    {new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </option>
                ))}
              </select>
            </label>
            <p className="availability-summary">
              {selectedDay === null
                ? `${d.name} has no saved availability.`
                : `Next ${weekDays[selectedDay]} - ${date}`}
            </p>
            {false && (
              <>
                <p className="availability-summary">
                  {availability.length
                    ? `Available ${availability.map((slot) => `${weekDays[slot.dayOfWeek]} ${slot.startTime}–${slot.endTime}`).join(", ")}`
                    : `${d.name} is not available on this day.`}
                </p>
                <div className="time-grid">
                  {slotsLoading ? (
                    <p>Loading available times…</p>
                  ) : (
                    slots.map((slot) => (
                      <button
                        type="button"
                        disabled={slot.booked}
                        className={time === slot.time ? "selected" : ""}
                        onClick={() => setTime(slot.time)}
                        key={slot.startsAt}
                      >
                        {new Date(
                          `2000-01-01T${slot.time}:00`,
                        ).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {slot.booked && <small>Booked</small>}
                      </button>
                    ))
                  )}
                </div>
                {!slotsLoading && !slots.length && (
                  <p className="form-error">
                    No appointment times are available for this date. Please
                    select another day.
                  </p>
                )}
              </>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <h2>Tell us what brings you in</h2>
            <label>
              Reason for appointment
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option>New health concern</option>
                <option>Follow-up</option>
                <option>Routine checkup</option>
              </select>
            </label>
            <label>
              Symptoms or notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
            <p>{d.name}</p>
            <p>
              {selectedDay === null ? "" : weekDays[selectedDay]} - Booking time{" "}
              {new Date(
                created?.bookingTimestamp ?? Date.now(),
              ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </p>
            <p>
              Queue position: {created?.queuePosition} - Estimated wait:{" "}
              {created?.liveWaitMinutes ?? created?.estimatedWaitMinutes ?? 0}{" "}
              minutes
            </p>
            <p>
              Status: {created?.status ?? "PENDING"} - Appointment Confirmed
            </p>
            <strong>{created?.appointmentNumber}</strong>
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
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button
              disabled={step === 2 && !time}
              onClick={() => (step === 3 ? confirm() : setStep(step + 1))}
            >
              {step === 3 ? "Confirm appointment" : "Continue"} <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
const specializations = [
  "Allergy & Immunology",
  "Anesthesiology",
  "Cardiology",
  "Cardiothoracic Surgery",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Geriatrics",
  "Gynecology & Obstetrics",
  "Hematology",
  "Infectious Diseases",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Pediatrics",
  "Plastic Surgery",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
];
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function LegacyAuth({
  mode,
  adminOnly = false,
}: {
  mode: "login" | "register" | "forgot";
  adminOnly?: boolean;
}) {
  const navigate = useNavigate(),
    location = useLocation(),
    { login } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [fullName, setFullName] = useState(""),
    [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT"),
    [authError, setAuthError] = useState(""),
    [submitting, setSubmitting] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState(""),
    [specialization, setSpecialization] = useState("General Medicine"),
    [qualification, setQualification] = useState(""),
    [phone, setPhone] = useState(""),
    [avatar, setAvatar] = useState<File | null>(null);
  const [age, setAge] = useState(""),
    [weight, setWeight] = useState(""),
    [height, setHeight] = useState(""),
    [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [availability, setAvailability] = useState(() =>
    weekDays.map((_, dayOfWeek) => ({
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      slotMinutes: 20,
      active: dayOfWeek > 0 && dayOfWeek < 6,
    })),
  );
  const updateSlot = (
    dayOfWeek: number,
    key: "active" | "startTime" | "endTime",
    value: boolean | string,
  ) =>
    setAvailability((slots) =>
      slots.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [key]: value } : slot,
      ),
    );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        const user = await login(email, password);
        if (adminOnly && user.role !== "ADMIN") {
          await authApi.logout();
          throw new Error(
            "This portal is only for administrators. Use Patient/Doctor login instead.",
          );
        }
        if (!adminOnly && user.role === "ADMIN")
          throw new Error("Admins must use the separate Admin login portal.");
        const requested = (location.state as { from?: string } | null)?.from;
        navigate(requested ?? `/dashboard/${user.role.toLowerCase()}`, {
          replace: true,
        });
      } else if (mode === "register") {
        if (role === "DOCTOR" && !avatar)
          throw new Error("A doctor profile photo is required.");
        const avatarUrl = avatar
          ? (await uploadRegistrationAvatar(avatar)).url
          : undefined;
        const [firstName, ...rest] = fullName.trim().split(/\s+/);
        await authApi.register({
          email,
          password,
          firstName,
          lastName: rest.join(" ") || "User",
          phone,
          avatarUrl,
          role,
          ...(role === "DOCTOR"
            ? {
                licenseNumber,
                specialization,
                qualification,
                availability: availability
                  .filter((slot) => slot.active)
                  .map(({ active, ...slot }) => slot),
              }
            : {
                age: age ? Number(age) : undefined,
                weight: weight ? Number(weight) : undefined,
                height: height ? Number(height) : undefined,
                gender,
              }),
        });
        setAuthError(
          role === "DOCTOR"
            ? "Doctor registration submitted. Your account is pending until admin approval."
            : "Patient registration complete. You can login now.",
        );
        if (role === "PATIENT") navigate("/login", { replace: true });
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to continue",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const title =
    mode === "login"
      ? adminOnly
        ? "Admin portal login"
        : "Welcome back"
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
      <form className="auth-form card" onSubmit={submit}>
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
            {["Patient", "Doctor"].map((x) => (
              <button
                type="button"
                className={role === x.toUpperCase() ? "selected" : ""}
                onClick={() => setRole(x.toUpperCase() as "PATIENT" | "DOCTOR")}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        )}
        {mode !== "forgot" && (
          <label>
            Full name
            {mode === "register" && (
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                placeholder="Enter your full name"
              />
            )}
          </label>
        )}
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
        {mode === "register" && (
          <label>
            Phone number
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="+92..."
            />
          </label>
        )}
        {mode === "register" && (
          <label>
            Profile photo {role === "DOCTOR" ? "(required)" : "(optional)"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={role === "DOCTOR"}
              onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
            />
            <small>{avatar?.name ?? "JPEG, PNG, or WebP up to 10 MB"}</small>
          </label>
        )}
        {mode === "register" && role === "PATIENT" && (
          <>
            <div className="form-row">
              <label>
                Age
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="e.g. 28"
                />
              </label>
              <label>
                Sex
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Weight (kg)
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="e.g. 65"
                />
              </label>
              <label>
                Height (cm)
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  placeholder="e.g. 170"
                />
              </label>
            </div>
          </>
        )}
        {mode === "register" && role === "DOCTOR" && (
          <>
            <div className="form-row">
              <label>
                PMDC registration number
                <input
                  value={licenseNumber}
                  onChange={(event) => setLicenseNumber(event.target.value)}
                  required
                  placeholder="PMDC-12345"
                />
              </label>
              <label>
                Specialization
                <select
                  value={specialization}
                  onChange={(event) => setSpecialization(event.target.value)}
                >
                  {specializations.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Qualification
              <input
                value={qualification}
                onChange={(event) => setQualification(event.target.value)}
                required
                placeholder="MBBS, FCPS"
              />
            </label>
            <fieldset className="availability-editor">
              <legend>Weekly availability</legend>
              <small>Select the days and times patients can book you.</small>
              {availability.map((slot) => (
                <div className="availability-row" key={slot.dayOfWeek}>
                  <label>
                    <input
                      type="checkbox"
                      checked={slot.active}
                      onChange={(event) =>
                        updateSlot(
                          slot.dayOfWeek,
                          "active",
                          event.target.checked,
                        )
                      }
                    />{" "}
                    {weekDays[slot.dayOfWeek]}
                  </label>
                  <input
                    aria-label={`${weekDays[slot.dayOfWeek]} start time`}
                    type="time"
                    disabled={!slot.active}
                    value={slot.startTime}
                    onChange={(event) =>
                      updateSlot(
                        slot.dayOfWeek,
                        "startTime",
                        event.target.value,
                      )
                    }
                  />
                  <span>to</span>
                  <input
                    aria-label={`${weekDays[slot.dayOfWeek]} end time`}
                    type="time"
                    disabled={!slot.active}
                    value={slot.endTime}
                    onChange={(event) =>
                      updateSlot(slot.dayOfWeek, "endTime", event.target.value)
                    }
                  />
                </div>
              ))}
            </fieldset>
            <p>
              After signup, admin must approve your account before you can
              login.
            </p>
          </>
        )}
        {mode !== "forgot" && (
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </label>
        )}
        {authError && (
          <p className="form-error" role="alert">
            {authError}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Please wait..."
            : mode === "login"
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
export const Auth = LegacyAuth;

export function Dashboard() {
  const { role = "patient" } = useParams();
  const { user } = useAuth();
  const [active, setActive] = useState("Overview");
  const [data, setData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [requests, setRequests] = useState<any>(null);
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatus, setAppointmentStatus] = useState("");
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [appointmentPages, setAppointmentPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [consult, setConsult] = useState({
    diagnosis: "",
    notes: "",
    medicines: "Paracetamol, 500mg, twice daily, 3 days",
    labTests: "CBC",
    dietPlan: "Light meals and fluids",
    workoutPlan: "Rest for 48 hours",
  });
  const [labReportFile, setLabReportFile] = useState<File | null>(null);
  const loadAdmin = async () => {
    const [dash, ps, ds, as, rs] = await Promise.all([
      api<any>("/me/dashboard"),
      api<any[]>("/admin/patients"),
      api<any[]>("/admin/doctors"),
      api<any>("/admin/appointments"),
      api<any>("/admin/requests"),
    ]);
    setData(dash);
    setPatients(ps);
    setDoctorsList(ds);
    setAppointments(as.items ?? as);
    setAppointmentPages(as.pages ?? 1);
    setRequests(rs);
  };
  useEffect(() => {
    setLoading(true);
    (role === "admin" ? loadAdmin() : api<any>("/me/dashboard").then(setData))
      .catch((e) =>
        setMessage(e instanceof Error ? e.message : "Unable to load dashboard"),
      )
      .finally(() => setLoading(false));
  }, [role]);
  useEffect(() => {
    if (!["patient", "doctor"].includes(role)) return;
    const refresh = () =>
      api<any[]>("/appointments")
        .then((items) =>
          setData((current: any) => ({ ...current, appointments: items })),
        )
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [role]);
  const updateDoctor = async (id: string, status: "ACTIVE" | "REJECTED") => {
    setMessage("");
    await api(`/admin/doctors/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await loadAdmin();
    setMessage(
      status === "ACTIVE"
        ? "Doctor approved and can login now."
        : "Doctor rejected.",
    );
  };
  const deleteAdminUser = async (userId: string, label: string) => {
    if (!confirm(`Delete ${label} and all related records?`)) return;
    await api(`/admin/users/${userId}`, { method: "DELETE" });
    await loadAdmin();
    setMessage(`${label} deleted completely.`);
  };
  const loadAdminAppointments=async(page=1)=>{const params=new URLSearchParams({page:String(page),pageSize:"10"});if(appointmentSearch)params.set("q",appointmentSearch);if(appointmentStatus)params.set("status",appointmentStatus);const result=await api<any>(`/admin/appointments?${params}`);setAppointments(result.items);setAppointmentPage(result.page);setAppointmentPages(result.pages||1)};
  if (role === "admin")
    return (
      <div className="dashboard">
        <aside>
          <Link to="/" className="auth-logo">
            <HeartPulse /> UHS
          </Link>
          <small>ADMIN PORTAL</small>
          {[
            "Overview",
            "Patients",
            "Doctors",
            "Appointments",
            "Requests",
            "Notifications",
            "Settings",
          ].map((x) => (
            <button
              className={active === x ? "active" : ""}
              onClick={() => setActive(x)}
              key={x}
            >
              <Activity />
              {x}
            </button>
          ))}
        </aside>
        <section>
          <header>
            <div>
              <small>{new Date().toLocaleDateString()}</small>
              <h1>Admin control center</h1>
              <p>
                Approve doctors, review patients, and monitor registrations from
                MySQL.
              </p>
            </div>
            <Avatar src="" name={user?.firstName ?? "Admin"} />
          </header>
          {message && (
            <p className="form-error" role="status">
              {message}
            </p>
          )}
          {loading ? (
            <div className="card">
              <h3>Loading admin data...</h3>
            </div>
          ) : (
            <>
              <div className="dash-stats">
                <div className="card">
                  <span>
                    <Users />
                  </span>
                  <small>Patients</small>
                  <strong>{data?.stats?.patients ?? patients.length}</strong>
                  <em>Registered accounts</em>
                </div>
                <div className="card">
                  <span>
                    <Stethoscope />
                  </span>
                  <small>Approved doctors</small>
                  <strong>
                    {data?.stats?.doctors ??
                      doctorsList.filter((d) => d.user?.status === "ACTIVE")
                        .length}
                  </strong>
                  <em>Can access portal</em>
                </div>
                <div className="card">
                  <span>
                    <ShieldCheck />
                  </span>
                  <small>Pending doctors</small>
                  <strong>
                    {data?.stats?.pendingDoctors ??
                      doctorsList.filter((d) => d.user?.status === "PENDING")
                        .length}
                  </strong>
                  <em>Awaiting approval</em>
                </div>
              </div>
              {active === "Overview" && (
                <div className="dash-grid">
                  <article className="card">
                    <h3>Recent doctors</h3>
                    {doctorsList.slice(0, 5).map((d) => (
                      <p className="check-line" key={d.id}>
                        <Stethoscope />
                        {d.user?.firstName} {d.user?.lastName} ·{" "}
                        {d.specialization} · {d.user?.status}
                      </p>
                    ))}
                  </article>
                  <article className="card">
                    <h3>Recent patients</h3>
                    {patients.slice(0, 5).map((p) => (
                      <p className="check-line" key={p.id}>
                        <Users />
                        {p.user?.firstName} {p.user?.lastName} · {p.user?.email}
                      </p>
                    ))}
                  </article>
                </div>
              )}
              {active === "Doctors" && (
                <article className="card">
                  <h3>Registered doctors</h3>
                  {doctorsList.map((d) => (
                    <div className="booking-doctor" key={d.id}>
                      <Avatar
                        src={d.user?.avatarUrl ?? ""}
                        name={`${d.user?.firstName ?? ""} ${d.user?.lastName ?? ""}`}
                      />
                      <div>
                        <h3>
                          {d.user?.firstName} {d.user?.lastName}
                        </h3>
                        <p>
                          {d.user?.email} · {d.specialization} · PMDC{" "}
                          {d.licenseNumber} · {d.user?.status} ·{" "}
                          {d.user?.phone ?? "No phone"} · {d.qualification} ·{" "}
                          {d.experienceYears ?? 0} years · registered{" "}
                          {new Date(d.user?.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          Availability:{" "}
                          {(d.availability ?? [])
                            .map(
                              (slot: any) =>
                                `${weekDays[slot.dayOfWeek]} ${slot.startTime}-${slot.endTime}`,
                            )
                            .join(", ") || "Not provided"}
                        </p>
                      </div>
                      {d.user?.status === "PENDING" ? (
                        <>
                          <Button onClick={() => updateDoctor(d.id, "ACTIVE")}>
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => updateDoctor(d.id, "REJECTED")}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="pill">{d.user?.status}</span>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() =>
                          deleteAdminUser(
                            d.userId,
                            `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
                          )
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </article>
              )}
              {active === "Patients" && (
                <article className="card">
                  <h3>Registered patients</h3>
                  {patients.map((p) => (
                    <div className="booking-doctor" key={p.id}>
                      <Avatar
                        src={p.user?.avatarUrl ?? ""}
                        name={`${p.user?.firstName ?? ""} ${p.user?.lastName ?? ""}`}
                      />
                      <div>
                        <h3>
                          {p.user?.firstName} {p.user?.lastName}
                        </h3>
                        <p>
                          {p.user?.email} · {p.user?.phone ?? "No phone"} ·{" "}
                          age {p.age ?? "N/A"} · {p.gender ?? "N/A"} ·{" "}
                          {p.user?.status} · Appointment history{" "}
                          {p.appointments?.length ?? 0} · registered{" "}
                          {new Date(p.user?.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="pill">{p.bloodType ?? "Patient"}</span>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          deleteAdminUser(
                            p.userId,
                            `${p.user?.firstName} ${p.user?.lastName}`,
                          )
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </article>
              )}
              {active === "Appointments" && (
                <article className="card">
                  <h3>All appointments</h3>
                  <div className="big-search">
                    <Search />
                    <input value={appointmentSearch} onChange={e=>setAppointmentSearch(e.target.value)} placeholder="Search appointment, patient, or doctor" />
                    <select value={appointmentStatus} onChange={e=>setAppointmentStatus(e.target.value)}>
                      <option value="">All statuses</option>
                      {["PENDING","APPROVED","COMPLETED","CANCELLED","REJECTED"].map(status=><option key={status}>{status}</option>)}
                    </select>
                    <Button onClick={()=>loadAdminAppointments(1)}>Search</Button>
                  </div>
                  {appointments.map((a) => (
                    <div className="booking-doctor" key={a.id}>
                      <CalendarDays />
                      <div>
                        <b>{a.appointmentNumber}</b>
                        <p>
                          {a.patient?.user?.firstName} with Dr.{" "}
                          {a.doctor?.user?.firstName} ·{" "}
                          {weekDays[
                            a.selectedDay ?? new Date(a.startsAt).getDay()
                          ]}{" "}
                          · booked{" "}
                          {new Date(
                            a.bookingTimestamp ?? a.createdAt,
                          ).toLocaleString()}{" "}
                          · Queue #{a.queuePosition} · Wait{" "}
                          {a.estimatedWaitMinutes} min · {a.status} · created{" "}
                          {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={async () => {
                          await api(`/admin/appointments/${a.id}`, {
                            method: "DELETE",
                          });
                          await loadAdmin();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                  <div className="booking-actions">
                    <Button variant="ghost" disabled={appointmentPage<=1} onClick={()=>loadAdminAppointments(appointmentPage-1)}>Previous</Button>
                    <span>Page {appointmentPage} of {appointmentPages}</span>
                    <Button variant="ghost" disabled={appointmentPage>=appointmentPages} onClick={()=>loadAdminAppointments(appointmentPage+1)}>Next</Button>
                  </div>
                </article>
              )}
              {active === "Requests" && (
                <article className="card">
                  <h3>Registration and appointment requests</h3>
                  {(requests?.doctors ?? []).map((d: any) => (
                    <div className="booking-doctor" key={`doctor-${d.id}`}>
                      <Avatar src={uploadUrl(d.user?.avatarUrl)} name={`${d.user?.firstName} ${d.user?.lastName}`} />
                      <div><h3>{d.user?.firstName} {d.user?.lastName}</h3><p>Doctor · {d.user?.email} · {d.user?.phone ?? "No phone"} · {d.qualification} · {d.specialization} · {d.experienceYears} years · {d.licenseNumber} · {d.user?.status}</p><p>{(d.availability??[]).map((slot:any)=>`${weekDays[slot.dayOfWeek]} ${slot.startTime}-${slot.endTime}`).join(", ")}</p></div>
                    </div>
                  ))}
                  {(requests?.patients ?? []).map((p: any) => (
                    <div className="booking-doctor" key={`patient-${p.id}`}>
                      <Avatar src={uploadUrl(p.user?.avatarUrl)} name={`${p.user?.firstName} ${p.user?.lastName}`} />
                      <div><h3>{p.user?.firstName} {p.user?.lastName}</h3><p>Patient · {p.user?.email} · {p.user?.phone ?? "No phone"} · age {p.age ?? "N/A"} · {p.gender ?? "N/A"} · Appointment history {p.appointments?.length ?? 0}</p></div>
                    </div>
                  ))}
                  {(requests?.appointments ?? []).map((a: any) => (
                    <p className="check-line" key={`appointment-${a.id}`}><CalendarDays />Appointment booked · {a.patient?.user?.firstName} · Dr. {a.doctor?.user?.firstName} · {a.status}</p>
                  ))}
                </article>
              )}
              {!["Overview", "Doctors", "Patients", "Appointments", "Requests"].includes(
                active,
              ) && (
                <article className="card">
                  <h3>{active}</h3>
                  <p>
                    Connected admin section. Records and actions are persisted
                    through the backend.
                  </p>
                </article>
              )}
            </>
          )}
        </section>
      </div>
    );
  const doctorAppointments = data?.appointments ?? [];
  const setStatus = async (id: string, status: string) => {
    await api(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const [dashboard, items] = await Promise.all([
      api<any>("/me/dashboard"),
      api<any[]>("/appointments"),
    ]);
    setData({ ...dashboard, appointments: items });
    setMessage(`Appointment ${status.toLowerCase()}.`);
  };
  const cancelAppointment = async (id: string) => {
    await api(`/appointments/${id}/cancel`, { method: "PATCH" });
    const items = await api<any[]>("/appointments");
    setData((current: any) => ({ ...current, appointments: items }));
    setMessage("Appointment cancelled. The queue was updated.");
  };
  const submitConsult = async () => {
    if (!selectedAppointment) return;
    let uploadedReport: any = null;
    if (labReportFile) {
      const form = new FormData();
      form.append("file", labReportFile);
      uploadedReport = await api<any>("/uploads/report", {
        method: "POST",
        body: form,
      });
    }
    const [name, dosage, frequency, duration] = consult.medicines
      .split(",")
      .map((x) => x.trim());
    await api(`/appointments/${selectedAppointment.id}/consultation`, {
      method: "POST",
      body: JSON.stringify({
        diagnosis: consult.diagnosis,
        notes: consult.notes,
        medicines: name
          ? [
              {
                name,
                dosage: dosage || "As directed",
                frequency: frequency || "Daily",
                duration: duration || "7 days",
              },
            ]
          : [],
        labTests: consult.labTests
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        labReports: uploadedReport
          ? [
              {
                testName:
                  consult.labTests.split(",")[0]?.trim() ||
                  "Uploaded lab report",
                fileUrl: uploadedReport.url,
                result: uploadedReport.name,
                status: "UPLOADED",
              },
            ]
          : [],
        dietPlan: consult.dietPlan,
        workoutPlan: consult.workoutPlan,
      }),
    });
    setSelectedAppointment(null);
    setLabReportFile(null);
    setData(await api("/me/dashboard"));
    setMessage("Consultation submitted. Patient portal is updated now.");
  };
  if (role === "doctor")
    return (
      <div className="dashboard">
        <aside>
          <Link to="/" className="auth-logo">
            <HeartPulse /> UHS
          </Link>
          <small>DOCTOR PORTAL</small>
          {["Overview", "Appointments", "Consultation", "Patients"].map((x) => (
            <button
              className={active === x ? "active" : ""}
              onClick={() => setActive(x)}
              key={x}
            >
              <Activity />
              {x}
            </button>
          ))}
        </aside>
        <section>
          <header>
            <div>
              <small>{new Date().toLocaleDateString()}</small>
              <h1>
                Dr. {user?.firstName} {user?.lastName}
              </h1>
              <p>
                Manage patient appointment requests, prescriptions, lab
                requests, and medical records.
              </p>
            </div>
            <Avatar src="" name={user?.firstName ?? "Doctor"} />
          </header>
          {message && (
            <p className="form-error" role="status">
              {message}
            </p>
          )}
          {loading ? (
            <div className="card">
              <h3>Loading doctor portal...</h3>
            </div>
          ) : (
            <>
              <div className="dash-stats">
                <div className="card">
                  <span>
                    <CalendarDays />
                  </span>
                  <small>Appointments</small>
                  <strong>{data?.stats?.appointments ?? 0}</strong>
                  <em>Total requests</em>
                </div>
                <div className="card">
                  <span>
                    <Clock />
                  </span>
                  <small>Pending</small>
                  <strong>{data?.stats?.pending ?? 0}</strong>
                  <em>Need action</em>
                </div>
                <div className="card">
                  <span>
                    <ClipboardPlus />
                  </span>
                  <small>Completed</small>
                  <strong>{data?.stats?.completed ?? 0}</strong>
                  <em>Records written</em>
                </div>
              </div>
              <article className="card">
                <h3>Patient appointments</h3>
                {doctorAppointments.length === 0 ? (
                  <p>No patient appointments yet.</p>
                ) : (
                  doctorAppointments.map((a: any) => (
                    <div className="booking-doctor" key={a.id}>
                      <Avatar
                        src={a.patient?.user?.avatarUrl ?? ""}
                        name={`${a.patient?.user?.firstName ?? ""} ${a.patient?.user?.lastName ?? ""}`}
                      />
                      <div>
                        <h3>
                          {a.patient?.user?.firstName}{" "}
                          {a.patient?.user?.lastName}
                        </h3>
                        <p>
                          {a.appointmentNumber} ·{" "}
                          {new Date(a.startsAt).toLocaleString()} · {a.reason} ·{" "}
                          {a.status}
                        </p>
                        <p>
                          Symptoms:{" "}
                          {Array.isArray(a.symptoms)
                            ? a.symptoms.join(", ")
                            : "None added"}
                        </p>
                        <p>
                          Queue #{a.queuePosition} · booked{" "}
                          {new Date(
                            a.bookingTimestamp ?? a.createdAt,
                          ).toLocaleTimeString()}{" "}
                          · live wait {a.liveWaitMinutes ?? 0} minutes ·{" "}
                          {a.status}
                        </p>
                      </div>
                      {a.status === "PENDING" && (
                        <>
                          <Button onClick={() => setStatus(a.id, "APPROVED")}>
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setStatus(a.id, "REJECTED")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {["PENDING", "APPROVED"].includes(a.status) && (
                        <Button
                          onClick={() => setStatus(a.id, "COMPLETED")}
                        >
                          Complete appointment
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedAppointment(a);
                          setActive("Consultation");
                        }}
                      >
                        Write record
                      </Button>
                    </div>
                  ))
                )}
              </article>
              {selectedAppointment && (
                <article className="consult-record card">
                  <div className="record-head">
                    <div>
                      <span className="pill">Clinical record</span>
                      <h3>
                        Consultation for patient{" "}
                        {selectedAppointment.patient?.user?.firstName}{" "}
                        {selectedAppointment.patient?.user?.lastName}
                      </h3>
                      <p>
                        {selectedAppointment.appointmentNumber} ·{" "}
                        {new Date(
                          selectedAppointment.startsAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <Avatar
                      src={selectedAppointment.patient?.user?.avatarUrl ?? ""}
                      name={`${selectedAppointment.patient?.user?.firstName ?? ""} ${selectedAppointment.patient?.user?.lastName ?? ""}`}
                    />
                  </div>
                  <div className="record-grid">
                    <label>
                      Diagnosis
                      <input
                        value={consult.diagnosis}
                        onChange={(e) =>
                          setConsult({ ...consult, diagnosis: e.target.value })
                        }
                        placeholder="Diagnosis"
                      />
                    </label>
                    <label>
                      Lab tests
                      <input
                        value={consult.labTests}
                        onChange={(e) =>
                          setConsult({ ...consult, labTests: e.target.value })
                        }
                      />
                    </label>
                    <label className="wide">
                      Doctor notes
                      <textarea
                        rows={4}
                        value={consult.notes}
                        onChange={(e) =>
                          setConsult({ ...consult, notes: e.target.value })
                        }
                        placeholder="Clinical notes"
                      />
                    </label>
                    <label className="wide">
                      Medicine: name, dosage, frequency, duration
                      <input
                        value={consult.medicines}
                        onChange={(e) =>
                          setConsult({ ...consult, medicines: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Upload lab report image/PDF
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          setLabReportFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    <label>
                      Selected report
                      <input
                        readOnly
                        value={labReportFile?.name ?? "No file selected"}
                      />
                    </label>
                    <label>
                      Diet plan
                      <textarea
                        rows={3}
                        value={consult.dietPlan}
                        onChange={(e) =>
                          setConsult({ ...consult, dietPlan: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Workout plan
                      <textarea
                        rows={3}
                        value={consult.workoutPlan}
                        onChange={(e) =>
                          setConsult({
                            ...consult,
                            workoutPlan: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  <Button onClick={submitConsult}>
                    Submit to patient record
                  </Button>
                </article>
              )}
            </>
          )}
        </section>
      </div>
    );
  if (role === "patient")
    return (
      <div className="dashboard">
        <aside>
          <Link to="/" className="auth-logo">
            <HeartPulse /> UHS
          </Link>
          <small>PATIENT PORTAL</small>
          {[
            "Overview",
            "Appointments",
            "Medical records",
            "Prescriptions",
            "Lab results",
            "AI Predictions",
            "Diet Plans",
            "Workout Plans",
          ].map((x) => (
            <button
              className={active === x ? "active" : ""}
              onClick={() => setActive(x)}
              key={x}
            >
              <Activity />
              {x}
            </button>
          ))}
        </aside>
        <section>
          <header>
            <div>
              <small>{new Date().toLocaleDateString()}</small>
              <h1>Good morning, {user?.firstName}.</h1>
              <p>Your care updates are loaded from the database.</p>
            </div>
            <Avatar src="" name={user?.firstName ?? "Patient"} />
          </header>
          {loading ? (
            <div className="card">
              <h3>Loading patient portal...</h3>
            </div>
          ) : (
            <>
              <div className="dash-stats">
                <div className="card">
                  <span>
                    <CalendarDays />
                  </span>
                  <small>Appointments</small>
                  <strong>{data?.stats?.appointments ?? 0}</strong>
                  <em>Saved in MySQL</em>
                </div>
                <div className="card">
                  <span>
                    <ClipboardPlus />
                  </span>
                  <small>Prescriptions</small>
                  <strong>{data?.stats?.prescriptions ?? 0}</strong>
                  <em>Doctor submitted</em>
                </div>
                <div className="card">
                  <span>
                    <BrainCircuit />
                  </span>
                  <small>AI Predictions</small>
                  <strong>{data?.stats?.predictions ?? 0}</strong>
                  <em>History saved</em>
                </div>
              </div>
              {active === "Overview" && (
                <div className="dash-grid">
                  <article className="card">
                    <h3>Recent appointments</h3>
                    {(data?.appointments ?? []).slice(0, 5).map((a: any) => (
                      <p className="check-line" key={a.id}>
                        <CalendarDays />
                        {a.appointmentNumber} · Dr. {a.doctor?.user?.firstName}{" "}
                        · {a.status}
                      </p>
                    ))}
                  </article>
                  <article className="card">
                    <h3>Latest care updates</h3>
                    {(data?.notifications ?? []).slice(0, 5).map((n: any) => (
                      <p className="check-line" key={n.id}>
                        <Check />
                        {n.title}
                      </p>
                    ))}
                  </article>
                </div>
              )}
              {active === "Appointments" && (
                <article className="card">
                  <h3>Appointment history</h3>
                  {(data?.appointments ?? []).map((a: any) => (
                    <div className="booking-doctor" key={a.id}>
                      <Avatar
                        src={a.doctor?.user?.avatarUrl ?? ""}
                        name={`Dr. ${a.doctor?.user?.firstName ?? ""}`}
                      />
                      <div>
                        <h3>{a.appointmentNumber}</h3>
                        <p>
                          Dr. {a.doctor?.user?.firstName}{" "}
                          {a.doctor?.user?.lastName} ·{" "}
                          {weekDays[
                            a.selectedDay ?? new Date(a.startsAt).getDay()
                          ]}{" "}
                          · booked{" "}
                          {new Date(
                            a.bookingTimestamp ?? a.createdAt,
                          ).toLocaleTimeString()}{" "}
                          · Queue #{a.queuePosition} · Estimated wait{" "}
                          {a.estimatedWaitMinutes} min · Live wait{" "}
                          {a.liveWaitMinutes ?? 0} min · {a.status}
                        </p>
                      </div>
                      {["PENDING", "APPROVED"].includes(a.status) && (
                        <Button
                          variant="ghost"
                          onClick={() => cancelAppointment(a.id)}
                        >
                          Cancel appointment
                        </Button>
                      )}
                    </div>
                  ))}
                </article>
              )}
              {active === "Medical records" && (
                <article className="card">
                  <h3>Medical records</h3>
                  {(data?.appointments ?? [])
                    .filter((a: any) => a.medicalRecord)
                    .map((a: any) => (
                      <div className="patient-record" key={a.id}>
                        <span className="pill">Consultation</span>
                        <h3>{a.medicalRecord.diagnosis}</h3>
                        <p>{a.medicalRecord.notes}</p>
                        <p>{a.medicalRecord.recommendations}</p>
                      </div>
                    ))}
                </article>
              )}
              {active === "Prescriptions" && (
                <article className="card">
                  <h3>Prescriptions</h3>
                  {(data?.prescriptions ?? []).map((p: any) => (
                    <div key={p.id}>
                      <h3>Dr. {p.doctor?.user?.firstName}</h3>
                      {p.items?.map((i: any) => (
                        <p className="check-line" key={i.id}>
                          <Syringe />
                          {i.medicine?.name} · {i.dosage} · {i.frequency} ·{" "}
                          {i.duration}
                        </p>
                      ))}
                    </div>
                  ))}
                </article>
              )}
              {active === "Lab results" && (
                <article className="card">
                  <h3>Lab reports</h3>
                  {(data?.labReports ?? []).map((r: any) => (
                    <p className="check-line" key={r.id}>
                      <FileHeart />
                      {r.testName} · {r.status}{" "}
                      {r.fileUrl && (
                        <a href={r.fileUrl} target="_blank">
                          Open report
                        </a>
                      )}
                    </p>
                  ))}
                </article>
              )}
              {active === "AI Predictions" && (
                <article className="card">
                  <h3>AI prediction history</h3>
                  {(data?.predictions ?? []).map((p: any) => (
                    <p className="check-line" key={p.id}>
                      <BrainCircuit />
                      {p.result?.disease} ·{" "}
                      {Math.round((p.confidence ?? 0) * 100)}%
                    </p>
                  ))}
                </article>
              )}
              {active === "Diet Plans" && (
                <article className="card">
                  <h3>Diet Plans</h3>
                  {(data?.dietPlans ?? []).map((p: any) => (
                    <p className="check-line" key={p.id}>
                      <Check />
                      {p.title} · {p.content?.plan}
                    </p>
                  ))}
                </article>
              )}
              {active === "Workout Plans" && (
                <article className="card">
                  <h3>Workout Plans</h3>
                  {(data?.workoutPlans ?? []).map((p: any) => (
                    <p className="check-line" key={p.id}>
                      <Activity />
                      {p.title} · {p.content?.plan}
                    </p>
                  ))}
                </article>
              )}
            </>
          )}
        </section>
      </div>
    );
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
