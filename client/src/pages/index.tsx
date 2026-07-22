import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
import { api } from "../services/api";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
const mapDoctor=(d:any)=>({id:d.id,name:`Dr. ${d.user?.firstName??''} ${d.user?.lastName??''}`.trim(),specialty:d.specialization??'General Medicine',hospital:d.hospital?.name??d.hospital??'UHS Clinic',experience:d.experienceYears??0,rating:d.averageRating??4.8,reviews:d.reviews?.length??0,image:d.user?.avatarUrl??'',available:d.availability?.[0]?`${d.availability[0].startTime}-${d.availability[0].endTime}`:'Available today'});
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
  const [liveDoctors,setLiveDoctors]=useState<any[]>([]);
  useEffect(()=>{api<any[]>('/doctors').then(x=>setLiveDoctors(x.map(mapDoctor))).catch(()=>setLiveDoctors([]))},[]);
  const source=liveDoctors.length?liveDoctors:doctors;
  const filtered = source.filter((d) =>
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
type OsmHospital={id:string;name:string;address:string;lat:number;lon:number;distanceKm:number;emergency:boolean};
const userLocationIcon=new L.Icon({iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});
const hospitalIcon=new L.Icon({iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});
function haversineKm(a:{lat:number;lon:number},b:{lat:number;lon:number}){const r=6371,p=Math.PI/180,dLat=(b.lat-a.lat)*p,dLon=(b.lon-a.lon)*p;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLon/2)**2;return 2*r*Math.asin(Math.sqrt(x))}
function RecenterMap({center,zoom}:{center:[number,number];zoom:number}){const map=useMap();useEffect(()=>{map.setView(center,zoom)},[center,zoom,map]);return null}
export function Prediction() {
  const [selected, setSelected] = useState<string[]>([]),
    [result, setResult] = useState<{disease:string;confidence:number;severity:string;specialist:string;recommendedMedicines:string[];suggestedTests:string[]}|null>(null),
    [age, setAge] = useState(28),
    [gender, setGender] = useState("Female"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const analyze=async()=>{setLoading(true);setError("");try{setResult(await api('/predictions',{method:'POST',body:JSON.stringify({symptoms:selected,age,gender})}))}catch(e){setError(e instanceof Error?e.message:'Assessment failed')}finally{setLoading(false)}};
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
              <input type="number" value={age} onChange={(event)=>setAge(Number(event.target.value))} min="0" max="120" />
            </label>
            <label>
              Gender
              <select value={gender} onChange={(event)=>setGender(event.target.value)}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          {error&&<p role="alert" className="form-error">{error}</p>}
          <Button onClick={analyze} disabled={!selected.length||loading}>
            {loading?'Analyzing securely...':'Analyze my symptoms'} <Sparkles />
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
                <b>{Math.round(result.confidence*100)}%</b>
                <i>
                  <em style={{width:`${result.confidence*100}%`}} />
                </i>
              </div>
              <div className="severity">
                <span>Severity</span>
                <b>{result.severity.replaceAll('_',' ').toLowerCase()}</b>
              </div>
              <h3>Recommended next steps</h3>
              {[`Consult a ${result.specialist}`,...result.suggestedTests].map((x) => (
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
  const fallback={lat:33.6844,lon:73.0479};
  const [location,setLocation]=useState<{lat:number;lon:number}|null>(null);
  const [items,setItems]=useState<OsmHospital[]>([]);
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [mode,setMode]=useState<'nearby'|'search'>('nearby');
  const [mapZoom,setMapZoom]=useState(13);
  const center=location??fallback;
  const fetchHospitals=async(pos:{lat:number;lon:number})=>{setLoading(true);setError("");setMode('nearby');try{const body=`[out:json][timeout:25];(node["amenity"~"hospital|clinic"](around:10000,${pos.lat},${pos.lon});way["amenity"~"hospital|clinic"](around:10000,${pos.lat},${pos.lon});relation["amenity"~"hospital|clinic"](around:10000,${pos.lat},${pos.lon}););out center tags 80;`;let res:Response|null=null;for(const endpoint of ['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']){res=await fetch(endpoint,{method:'POST',body}).catch(()=>null);if(res?.ok)break}if(!res?.ok)throw new Error('Nearby hospital refresh is temporarily unavailable. Showing the last results.');const json=await res.json();const mapped=(json.elements??[]).map((x:any)=>{const lat=x.lat??x.center?.lat,lon=x.lon??x.center?.lon,t=x.tags??{};if(!lat||!lon)return null;const address=[t['addr:housenumber'],t['addr:street'],t['addr:city']].filter(Boolean).join(', ')||t['addr:full']||'Address not available';return{id:String(x.id),name:t.name||'Unnamed hospital/clinic',address,lat,lon,distanceKm:haversineKm(pos,{lat,lon}),emergency:t.emergency==='yes'||t.healthcare==='hospital'}}).filter(Boolean).sort((a:OsmHospital,b:OsmHospital)=>a.distanceKm-b.distanceKm) as OsmHospital[];setItems(mapped)}catch(e){if(items.length===0)setError(e instanceof Error?e.message:'Unable to search nearby hospitals')}finally{setLoading(false)}};
  const searchAnyHospital=async()=>{const term=query.trim();if(!term){fetchHospitals(center);return}setLoading(true);setError("");try{const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=20&addressdetails=1&q=${encodeURIComponent(`${term} hospital`)}`;const res=await fetch(url,{headers:{Accept:'application/json'}});if(!res.ok)throw new Error('Search is unavailable right now.');const json=await res.json();const mapped=(json??[]).map((x:any)=>{const lat=Number(x.lat),lon=Number(x.lon);if(!lat||!lon)return null;return{id:String(x.place_id),name:x.name||x.display_name?.split(',')[0]||term,address:x.display_name||'Address not available',lat,lon,distanceKm:haversineKm(center,{lat,lon}),emergency:false}}).filter(Boolean) as OsmHospital[];setMode('search');setItems(mapped.sort((a,b)=>a.distanceKm-b.distanceKm));if(mapped[0]){setLocation({lat:mapped[0].lat,lon:mapped[0].lon});setMapZoom(13)}}catch(e){setError(e instanceof Error?e.message:'Unable to search hospital by name')}finally{setLoading(false)}};
  const refreshLocation=()=>{setLoading(true);setError("");if(!navigator.geolocation){setError('Geolocation is not supported by this browser.');setLoading(false);return}navigator.geolocation.getCurrentPosition(({coords})=>{const pos={lat:coords.latitude,lon:coords.longitude};setLocation(pos);setMapZoom(13);fetchHospitals(pos)},()=>{setError('Location permission was denied. Enable location access or use search from the default map area.');setLocation(fallback);fetchHospitals(fallback)},{enableHighAccuracy:true,timeout:15000,maximumAge:60000})};
  useEffect(()=>{refreshLocation()},[]);
  const filtered=mode==='nearby'?items.filter(h=>(h.name+h.address).toLowerCase().includes(query.toLowerCase())):items;
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
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')searchAnyHospital()}} placeholder="Search any hospital by name or filter nearby results" />
          <Button onClick={searchAnyHospital}>Search hospitals</Button>
        </div>
      </div>
      <div className="osm-layout page-cards">
        <section className="osm-map-card card">
          <div className="osm-toolbar">
            <div><b>{mode==='nearby'?'Hospitals within 10 km':'Hospital search results'}</b><small>{mode==='nearby'?(location?'Using your current location':'Using default map area'):'Search is free through OpenStreetMap Nominatim'}</small></div>
            <div><Button variant="secondary" onClick={refreshLocation}>Refresh location</Button><Button variant="ghost" onClick={()=>{setMapZoom(15);}}>Zoom to current location</Button></div>
          </div>
          {error&&<p className="form-error" role="alert">{error}</p>}
          {loading&&<div className="map-loading"><span/> Searching nearby hospitals...</div>}
          <MapContainer center={[center.lat,center.lon]} zoom={mapZoom} className="osm-map" scrollWheelZoom>
            <RecenterMap center={[center.lat,center.lon]} zoom={mapZoom}/>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <Marker position={[center.lat,center.lon]} icon={userLocationIcon}><Popup>Your current location<br/>{center.lat.toFixed(5)}, {center.lon.toFixed(5)}</Popup></Marker>
            {filtered.map(h=><Marker key={h.id} position={[h.lat,h.lon]} icon={hospitalIcon}><Popup><strong>{h.name}</strong><br/>{h.address}<br/>Distance: {h.distanceKm.toFixed(2)} km<br/>Lat/Lon: {h.lat.toFixed(5)}, {h.lon.toFixed(5)}<br/><a target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`}>Open in Google Maps</a><br/><a target="_blank" href={`https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lon}#map=17/${h.lat}/${h.lon}`}>Open in OpenStreetMap</a></Popup></Marker>)}
          </MapContainer>
        </section>
        <aside className="osm-results">
          {filtered.length===0&&!loading?<article className="card osm-hospital-card"><h3>No hospitals found</h3><p>Try refreshing location or searching a different term.</p></article>:filtered.map(h=><article className="card osm-hospital-card" key={h.id}><span className="pill">{h.emergency?'Emergency':'Hospital / Clinic'}</span><h3>{h.name}</h3><p><MapPin size={15}/>{h.address}</p><p>{h.distanceKm.toFixed(2)} km away · {h.lat.toFixed(5)}, {h.lon.toFixed(5)}</p><div className="card-actions"><a className="btn btn-secondary" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`}>Google Maps</a><a className="btn btn-ghost" target="_blank" href={`https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lon}#map=17/${h.lat}/${h.lon}`}>OpenStreetMap</a></div></article>)}
        </aside>
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
  const location=useLocation();
  const selectedDoctorId=new URLSearchParams(location.search).get('doctor');
  const [availableDoctors,setAvailableDoctors]=useState<any[]>([]);
  const [date,setDate]=useState(new Date(Date.now()+86400000).toISOString().slice(0,10));
  const [time,setTime]=useState('10:30');
  const [reason,setReason]=useState('New health concern');
  const [notes,setNotes]=useState('');
  const [created,setCreated]=useState<any>(null);
  const [error,setError]=useState('');
  useEffect(()=>{api<any[]>('/doctors').then(x=>setAvailableDoctors(x.map(mapDoctor))).catch(()=>setAvailableDoctors([]))},[]);
  const d = availableDoctors.find(x=>String(x.id)===String(selectedDoctorId))??availableDoctors[0]??doctors[0];
  const confirm=async()=>{setError('');try{const startsAt=new Date(`${date}T${time}:00`).toISOString();const appt=await api<any>('/appointments',{method:'POST',body:JSON.stringify({doctorId:d.id,startsAt,reason,symptoms:notes.split(',').map(x=>x.trim()).filter(Boolean)})});setCreated(appt);setStep(4)}catch(e){setError(e instanceof Error?e.message:'Unable to book appointment')}};
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
            <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
            <div className="time-grid">
              {[
                "09:00 AM",
                "10:30 AM",
                "12:00 PM",
                "02:30 PM",
                "04:00 PM",
                "05:30 PM",
              ].map((x) => (
                <button className={time===x.slice(0,5)?"selected":""} onClick={()=>setTime(x.slice(0,5))} key={x}>{x}</button>
              ))}
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Tell us what brings you in</h2>
            <label>
              Reason for appointment
              <select value={reason} onChange={e=>setReason(e.target.value)}>
                <option>New health concern</option>
                <option>Follow-up</option>
                <option>Routine checkup</option>
              </select>
            </label>
            <label>
              Symptoms or notes
              <textarea value={notes} onChange={e=>setNotes(e.target.value)}
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
            <p>{date} at {time} with {d.name}</p>
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
            {error&&<p className="form-error" role="alert">{error}</p>}
            <Button onClick={() => step===3?confirm():setStep(step + 1)}>
              {step === 3 ? "Confirm appointment" : "Continue"} <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
export function Auth({ mode, adminOnly=false }: { mode: "login" | "register" | "forgot"; adminOnly?: boolean }) {
  const navigate=useNavigate(),location=useLocation(),{login}=useAuth();
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[fullName,setFullName]=useState(''),[role,setRole]=useState<'PATIENT'|'DOCTOR'>('PATIENT'),[authError,setAuthError]=useState(''),[submitting,setSubmitting]=useState(false);
  const [licenseNumber,setLicenseNumber]=useState(''),[specialization,setSpecialization]=useState('Gynaecology'),[qualification,setQualification]=useState(''),[phone,setPhone]=useState('');
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setAuthError('');setSubmitting(true);try{if(mode==='login'){const user=await login(email,password);if(adminOnly&&user.role!=='ADMIN'){await authApi.logout();throw new Error('This portal is only for administrators. Use Patient/Doctor login instead.')}if(!adminOnly&&user.role==='ADMIN')throw new Error('Admins must use the separate Admin login portal.');const requested=(location.state as {from?:string}|null)?.from;navigate(requested??`/dashboard/${user.role.toLowerCase()}`,{replace:true})}else if(mode==='register'){const [firstName,...rest]=fullName.trim().split(/\s+/);await authApi.register({email,password,firstName,lastName:rest.join(' ')||'User',phone,role,...(role==='DOCTOR'?{licenseNumber,specialization,qualification}:{})});setAuthError(role==='DOCTOR'?'Doctor registration submitted. Your account is pending until admin approval.':'Patient registration complete. You can login now.');if(role==='PATIENT')navigate('/login',{replace:true})}}catch(error){setAuthError(error instanceof Error?error.message:'Unable to continue')}finally{setSubmitting(false)}};
  const title =
    mode === "login"
      ? adminOnly ? "Admin portal login" : "Welcome back"
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
              <button type="button" className={role===x.toUpperCase()?'selected':''} onClick={()=>setRole(x.toUpperCase() as 'PATIENT'|'DOCTOR')} key={x}>
                {x}
              </button>
            ))}
          </div>
        )}
        {mode !== "forgot" && (
          <label>
            Full name
            {mode === "register" && (
              <input value={fullName} onChange={event=>setFullName(event.target.value)} required placeholder="Enter your full name" />
            )}
          </label>
        )}
        <label>
          Email address
          <input type="email" value={email} onChange={event=>setEmail(event.target.value)} required placeholder="you@example.com" />
        </label>
        {mode === "register" && <label>Phone<input value={phone} onChange={event=>setPhone(event.target.value)} placeholder="+92..." /></label>}
        {mode === "register" && role === "DOCTOR" && (
          <>
            <div className="form-row"><label>PMDC registration number<input value={licenseNumber} onChange={event=>setLicenseNumber(event.target.value)} required placeholder="PMDC-12345" /></label><label>Specialization<select value={specialization} onChange={event=>setSpecialization(event.target.value)}><option>Gynaecology</option><option>Orthopedics</option><option>Cardiology</option><option>Dermatology</option><option>Pediatrics</option><option>General Medicine</option></select></label></div>
            <label>Qualification<input value={qualification} onChange={event=>setQualification(event.target.value)} required placeholder="MBBS, FCPS" /></label>
            <p>After signup, admin must approve your account before you can login.</p>
          </>
        )}
        {mode !== "forgot" && (
          <label>
            Password
            <input type="password" value={password} onChange={event=>setPassword(event.target.value)} required minLength={8} placeholder="••••••••" />
          </label>
        )}
        {authError&&<p className="form-error" role="alert">{authError}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Please wait..." : mode === "login"
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
  const { user } = useAuth();
  const [active,setActive]=useState("Overview");
  const [data,setData]=useState<any>(null);
  const [patients,setPatients]=useState<any[]>([]);
  const [doctorsList,setDoctorsList]=useState<any[]>([]);
  const [appointments,setAppointments]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [selectedAppointment,setSelectedAppointment]=useState<any>(null);
  const [consult,setConsult]=useState({diagnosis:'',notes:'',medicines:'Paracetamol, 500mg, twice daily, 3 days',labTests:'CBC',dietPlan:'Light meals and fluids',workoutPlan:'Rest for 48 hours'});
  const [labReportFile,setLabReportFile]=useState<File|null>(null);
  const loadAdmin=async()=>{const [dash,ps,ds,as]=await Promise.all([api<any>('/me/dashboard'),api<any[]>('/admin/patients'),api<any[]>('/admin/doctors'),api<any[]>('/admin/appointments')]);setData(dash);setPatients(ps);setDoctorsList(ds);setAppointments(as)};
  useEffect(()=>{setLoading(true);(role==='admin'?loadAdmin():api<any>('/me/dashboard').then(setData)).catch(e=>setMessage(e instanceof Error?e.message:'Unable to load dashboard')).finally(()=>setLoading(false))},[role]);
  const updateDoctor=async(id:string,status:'ACTIVE'|'REJECTED')=>{setMessage('');await api(`/admin/doctors/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});await loadAdmin();setMessage(status==='ACTIVE'?'Doctor approved and can login now.':'Doctor rejected.')};
  if(role==='admin')return <div className="dashboard"><aside><Link to="/" className="auth-logo"><HeartPulse/> UHS</Link><small>ADMIN PORTAL</small>{["Overview","Patients","Doctors","Appointments","Notifications","Settings"].map(x=><button className={active===x?"active":""} onClick={()=>setActive(x)} key={x}><Activity/>{x}</button>)}</aside><section><header><div><small>{new Date().toLocaleDateString()}</small><h1>Admin control center</h1><p>Approve doctors, review patients, and monitor registrations from MySQL.</p></div><Avatar src="" name={user?.firstName??"Admin"}/></header>{message&&<p className="form-error" role="status">{message}</p>}{loading?<div className="card"><h3>Loading admin data...</h3></div>:<><div className="dash-stats"><div className="card"><span><Users/></span><small>Patients</small><strong>{data?.stats?.patients??patients.length}</strong><em>Registered accounts</em></div><div className="card"><span><Stethoscope/></span><small>Approved doctors</small><strong>{data?.stats?.doctors??doctorsList.filter(d=>d.user?.status==='ACTIVE').length}</strong><em>Can access portal</em></div><div className="card"><span><ShieldCheck/></span><small>Pending doctors</small><strong>{data?.stats?.pendingDoctors??doctorsList.filter(d=>d.user?.status==='PENDING').length}</strong><em>Awaiting approval</em></div></div>{active==="Overview"&&<div className="dash-grid"><article className="card"><h3>Recent doctors</h3>{doctorsList.slice(0,5).map(d=><p className="check-line" key={d.id}><Stethoscope/>{d.user?.firstName} {d.user?.lastName} · {d.specialization} · {d.user?.status}</p>)}</article><article className="card"><h3>Recent patients</h3>{patients.slice(0,5).map(p=><p className="check-line" key={p.id}><Users/>{p.user?.firstName} {p.user?.lastName} · {p.user?.email}</p>)}</article></div>}{active==="Doctors"&&<article className="card"><h3>Registered doctors</h3>{doctorsList.map(d=><div className="booking-doctor" key={d.id}><Avatar src={d.user?.avatarUrl??""} name={`${d.user?.firstName??""} ${d.user?.lastName??""}`}/><div><h3>{d.user?.firstName} {d.user?.lastName}</h3><p>{d.user?.email} · {d.specialization} · PMDC {d.licenseNumber} · {d.user?.status}</p></div>{d.user?.status==='PENDING'?<><Button onClick={()=>updateDoctor(d.id,'ACTIVE')}>Approve</Button><Button variant="ghost" onClick={()=>updateDoctor(d.id,'REJECTED')}>Reject</Button></>:<span className="pill">{d.user?.status}</span>}</div>)}</article>}{active==="Patients"&&<article className="card"><h3>Registered patients</h3>{patients.map(p=><div className="booking-doctor" key={p.id}><Avatar src={p.user?.avatarUrl??""} name={`${p.user?.firstName??""} ${p.user?.lastName??""}`}/><div><h3>{p.user?.firstName} {p.user?.lastName}</h3><p>{p.user?.email} · {p.user?.phone??'No phone'} · {p.user?.status} · Appointments {p.appointments?.length??0}</p></div><span className="pill">{p.bloodType??'Patient'}</span></div>)}</article>}{active==="Appointments"&&<article className="card"><h3>All appointments</h3>{appointments.map(a=><p className="check-line" key={a.id}><CalendarDays/>{a.appointmentNumber} · {a.patient?.user?.firstName} with Dr. {a.doctor?.user?.firstName} · {a.status}</p>)}</article>}{!["Overview","Doctors","Patients","Appointments"].includes(active)&&<article className="card"><h3>{active}</h3><p>Connected admin section. Records and actions are persisted through the backend.</p></article>}</>}</section></div>;
  const doctorAppointments=data?.appointments??[];
  const setStatus=async(id:string,status:string)=>{await api(`/appointments/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});setData(await api('/me/dashboard'));setMessage(`Appointment ${status.toLowerCase()}.`)};
  const submitConsult=async()=>{if(!selectedAppointment)return;let uploadedReport:any=null;if(labReportFile){const form=new FormData();form.append('file',labReportFile);uploadedReport=await api<any>('/uploads/report',{method:'POST',body:form})}const [name,dosage,frequency,duration]=consult.medicines.split(',').map(x=>x.trim());await api(`/appointments/${selectedAppointment.id}/consultation`,{method:'POST',body:JSON.stringify({diagnosis:consult.diagnosis,notes:consult.notes,medicines:name?[{name,dosage:dosage||'As directed',frequency:frequency||'Daily',duration:duration||'7 days'}]:[],labTests:consult.labTests.split(',').map(x=>x.trim()).filter(Boolean),labReports:uploadedReport?[{testName:consult.labTests.split(',')[0]?.trim()||'Uploaded lab report',fileUrl:uploadedReport.url,result:uploadedReport.name,status:'UPLOADED'}]:[],dietPlan:consult.dietPlan,workoutPlan:consult.workoutPlan})});setSelectedAppointment(null);setLabReportFile(null);setData(await api('/me/dashboard'));setMessage('Consultation submitted. Patient portal is updated now.')};
  if(role==='doctor')return <div className="dashboard"><aside><Link to="/" className="auth-logo"><HeartPulse/> UHS</Link><small>DOCTOR PORTAL</small>{["Overview","Appointments","Consultation","Patients"].map(x=><button className={active===x?"active":""} onClick={()=>setActive(x)} key={x}><Activity/>{x}</button>)}</aside><section><header><div><small>{new Date().toLocaleDateString()}</small><h1>Dr. {user?.firstName} {user?.lastName}</h1><p>Manage patient appointment requests, prescriptions, lab requests, and medical records.</p></div><Avatar src="" name={user?.firstName??"Doctor"}/></header>{message&&<p className="form-error" role="status">{message}</p>}{loading?<div className="card"><h3>Loading doctor portal...</h3></div>:<><div className="dash-stats"><div className="card"><span><CalendarDays/></span><small>Appointments</small><strong>{data?.stats?.appointments??0}</strong><em>Total requests</em></div><div className="card"><span><Clock/></span><small>Pending</small><strong>{data?.stats?.pending??0}</strong><em>Need action</em></div><div className="card"><span><ClipboardPlus/></span><small>Completed</small><strong>{data?.stats?.completed??0}</strong><em>Records written</em></div></div><article className="card"><h3>Patient appointments</h3>{doctorAppointments.length===0?<p>No patient appointments yet.</p>:doctorAppointments.map((a:any)=><div className="booking-doctor" key={a.id}><Avatar src={a.patient?.user?.avatarUrl??""} name={`${a.patient?.user?.firstName??""} ${a.patient?.user?.lastName??""}`}/><div><h3>{a.patient?.user?.firstName} {a.patient?.user?.lastName}</h3><p>{a.appointmentNumber} · {new Date(a.startsAt).toLocaleString()} · {a.reason} · {a.status}</p><p>Symptoms: {Array.isArray(a.symptoms)?a.symptoms.join(', '):'None added'}</p></div>{a.status==='PENDING'&&<><Button onClick={()=>setStatus(a.id,'APPROVED')}>Accept</Button><Button variant="ghost" onClick={()=>setStatus(a.id,'REJECTED')}>Reject</Button></>}<Button variant="secondary" onClick={()=>{setSelectedAppointment(a);setActive('Consultation')}}>Write record</Button></div>)}</article>{selectedAppointment&&<article className="consult-record card"><div className="record-head"><div><span className="pill">Clinical record</span><h3>Consultation for patient {selectedAppointment.patient?.user?.firstName} {selectedAppointment.patient?.user?.lastName}</h3><p>{selectedAppointment.appointmentNumber} · {new Date(selectedAppointment.startsAt).toLocaleString()}</p></div><Avatar src={selectedAppointment.patient?.user?.avatarUrl??""} name={`${selectedAppointment.patient?.user?.firstName??""} ${selectedAppointment.patient?.user?.lastName??""}`}/></div><div className="record-grid"><label>Diagnosis<input value={consult.diagnosis} onChange={e=>setConsult({...consult,diagnosis:e.target.value})} placeholder="Diagnosis"/></label><label>Lab tests<input value={consult.labTests} onChange={e=>setConsult({...consult,labTests:e.target.value})}/></label><label className="wide">Doctor notes<textarea rows={4} value={consult.notes} onChange={e=>setConsult({...consult,notes:e.target.value})} placeholder="Clinical notes"/></label><label className="wide">Medicine: name, dosage, frequency, duration<input value={consult.medicines} onChange={e=>setConsult({...consult,medicines:e.target.value})}/></label><label>Upload lab report image/PDF<input type="file" accept="image/*,.pdf" onChange={e=>setLabReportFile(e.target.files?.[0]??null)}/></label><label>Selected report<input readOnly value={labReportFile?.name??'No file selected'}/></label><label>Diet plan<textarea rows={3} value={consult.dietPlan} onChange={e=>setConsult({...consult,dietPlan:e.target.value})}/></label><label>Workout plan<textarea rows={3} value={consult.workoutPlan} onChange={e=>setConsult({...consult,workoutPlan:e.target.value})}/></label></div><Button onClick={submitConsult}>Submit to patient record</Button></article>}</>}</section></div>;
  if(role==='patient')return <div className="dashboard"><aside><Link to="/" className="auth-logo"><HeartPulse/> UHS</Link><small>PATIENT PORTAL</small>{["Overview","Appointments","Medical records","Prescriptions","Lab results","AI Predictions","Diet Plans","Workout Plans"].map(x=><button className={active===x?"active":""} onClick={()=>setActive(x)} key={x}><Activity/>{x}</button>)}</aside><section><header><div><small>{new Date().toLocaleDateString()}</small><h1>Good morning, {user?.firstName}.</h1><p>Your care updates are loaded from the database.</p></div><Avatar src="" name={user?.firstName??"Patient"}/></header>{loading?<div className="card"><h3>Loading patient portal...</h3></div>:<><div className="dash-stats"><div className="card"><span><CalendarDays/></span><small>Appointments</small><strong>{data?.stats?.appointments??0}</strong><em>Saved in MySQL</em></div><div className="card"><span><ClipboardPlus/></span><small>Prescriptions</small><strong>{data?.stats?.prescriptions??0}</strong><em>Doctor submitted</em></div><div className="card"><span><BrainCircuit/></span><small>AI Predictions</small><strong>{data?.stats?.predictions??0}</strong><em>History saved</em></div></div>{active==="Overview"&&<div className="dash-grid"><article className="card"><h3>Recent appointments</h3>{(data?.appointments??[]).slice(0,5).map((a:any)=><p className="check-line" key={a.id}><CalendarDays/>{a.appointmentNumber} · Dr. {a.doctor?.user?.firstName} · {a.status}</p>)}</article><article className="card"><h3>Latest care updates</h3>{(data?.notifications??[]).slice(0,5).map((n:any)=><p className="check-line" key={n.id}><Check/>{n.title}</p>)}</article></div>}{active==="Appointments"&&<article className="card"><h3>Appointment history</h3>{(data?.appointments??[]).map((a:any)=><div className="booking-doctor" key={a.id}><Avatar src={a.doctor?.user?.avatarUrl??""} name={`Dr. ${a.doctor?.user?.firstName??""}`}/><div><h3>{a.appointmentNumber}</h3><p>Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName} · {new Date(a.startsAt).toLocaleString()} · {a.status}</p></div></div>)}</article>}{active==="Medical records"&&<article className="card"><h3>Medical records</h3>{(data?.appointments??[]).filter((a:any)=>a.medicalRecord).map((a:any)=><div className="patient-record" key={a.id}><span className="pill">Consultation</span><h3>{a.medicalRecord.diagnosis}</h3><p>{a.medicalRecord.notes}</p><p>{a.medicalRecord.recommendations}</p></div>)}</article>}{active==="Prescriptions"&&<article className="card"><h3>Prescriptions</h3>{(data?.prescriptions??[]).map((p:any)=><div key={p.id}><h3>Dr. {p.doctor?.user?.firstName}</h3>{p.items?.map((i:any)=><p className="check-line" key={i.id}><Syringe/>{i.medicine?.name} · {i.dosage} · {i.frequency} · {i.duration}</p>)}</div>)}</article>}{active==="Lab results"&&<article className="card"><h3>Lab reports</h3>{(data?.labReports??[]).map((r:any)=><p className="check-line" key={r.id}><FileHeart/>{r.testName} · {r.status} {r.fileUrl&&<a href={r.fileUrl} target="_blank">Open report</a>}</p>)}</article>}{active==="AI Predictions"&&<article className="card"><h3>AI prediction history</h3>{(data?.predictions??[]).map((p:any)=><p className="check-line" key={p.id}><BrainCircuit/>{p.result?.disease} · {Math.round((p.confidence??0)*100)}%</p>)}</article>}{active==="Diet Plans"&&<article className="card"><h3>Diet Plans</h3>{(data?.dietPlans??[]).map((p:any)=><p className="check-line" key={p.id}><Check/>{p.title} · {p.content?.plan}</p>)}</article>}{active==="Workout Plans"&&<article className="card"><h3>Workout Plans</h3>{(data?.workoutPlans??[]).map((p:any)=><p className="check-line" key={p.id}><Activity/>{p.title} · {p.content?.plan}</p>)}</article>}</>}</section></div>;
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
