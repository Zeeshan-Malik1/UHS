import {useEffect,useMemo,useState} from "react";
import {Activity,BrainCircuit,CalendarDays,Check,Clock,FileHeart,Search,ShieldCheck,Sparkles,Stethoscope,Trash2,X} from "lucide-react";
import {api} from "../services/api";
import {Button} from "./ui";

export type PredictionReport={id:string;disease:string;confidence:number;topPredictions:Array<{disease:string;confidence:number}>;selectedSymptoms:string[];description:string;diet:string[];medications:string[];precautions:string[];workout:string[];recoveryTips:string[];predictionDatetime:string};

const title=(value:string)=>value.replace(/\b\w/g,letter=>letter.toUpperCase());
const list=(items:string[]|undefined,empty="Not available in the supplied dataset")=>(items?.length?items:[empty]);

export function PredictionReportView({report}:{report:PredictionReport}){
  const date=new Date(report.predictionDatetime);
  const lowConfidence=report.confidence<.5;
  const avoided=report.diet.filter(item=>/\b(avoid|limit)\b/i.test(item));
  const recommended=report.diet.filter(item=>!avoided.includes(item));
  return <div className="ml-report">
    <article className="card ml-result-primary"><span className="pill">MOST LIKELY CONDITION</span><h2>{title(report.disease)}</h2><div className="ml-result-meta"><span><b>{Math.round(report.confidence*10000)/100}%</b> confidence</span><span><CalendarDays/> {date.toLocaleDateString()}</span><span><Clock/> {date.toLocaleTimeString()}</span></div>{lowConfidence&&<p className="low-confidence-note">This symptom combination overlaps with several conditions. Add more relevant, specific symptoms and run the prediction again, or consult a clinician for assessment.</p>}<div className="top-predictions"><h3>Top 3 model probabilities</h3>{report.topPredictions.map((prediction,index)=><div key={prediction.disease}><span>{index+1}. {title(prediction.disease)}</span><b>{Math.round(prediction.confidence*10000)/100}%</b></div>)}</div><div className="selected-symptom-tags">{report.selectedSymptoms.map(symptom=><span key={symptom}><Check/>{title(symptom)}</span>)}</div></article>
    <article className="card ml-report-card"><FileHeart/><div><h3>Disease Description</h3><p>{report.description||"Not available in the supplied dataset"}</p></div></article>
    <article className="card ml-report-card"><Stethoscope/><div><h3>Recommended Medicines</h3>{list(report.medications).map(item=><p className="check-line" key={item}><Check/>{item}</p>)}</div></article>
    <article className="card ml-report-card"><Activity/><div><h3>Recommended Diet</h3>{list(recommended).map(item=><p className="check-line" key={item}><Check/>{item}</p>)}{avoided.length>0&&<><h4>Foods To Avoid or Limit</h4>{avoided.map(item=><p className="check-line" key={item}><X/>{item}</p>)}</>}</div></article>
    <article className="card ml-report-card"><ShieldCheck/><div><h3>Precautions</h3>{list(report.precautions).map(item=><p className="check-line" key={item}><Check/>{item}</p>)}</div></article>
    <article className="card ml-report-card"><Activity/><div><h3>Workout Plan and Recovery Exercise</h3>{list(report.workout).map(item=><p className="check-line" key={item}><Check/>{item}</p>)}{report.recoveryTips?.map(item=><p className="check-line" key={item}><Check/>{item}</p>)}</div></article>
    <p className="ml-disclaimer">This prediction is generated using a trained Machine Learning model and is intended only as a health screening tool. It is not a substitute for professional medical diagnosis. Please consult a qualified healthcare provider.</p>
  </div>
}

export function MlPrediction(){
  const [symptoms,setSymptoms]=useState<string[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [query,setQuery]=useState("");
  const [selectorOpen,setSelectorOpen]=useState(false);
  const [result,setResult]=useState<PredictionReport|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{const selectedQuery=selected.length?`?selected=${encodeURIComponent(selected.join("|"))}`:"";api<string[]>(`/predictions/symptoms${selectedQuery}`).then(setSymptoms).catch(()=>setError("Unable to load symptoms from the trained dataset."))},[selected.join("|")]);
  const matches=useMemo(()=>symptoms.filter(symptom=>(!query.trim()||symptom.includes(query.trim().toLowerCase()))&&!selected.includes(symptom)),[query,symptoms,selected]);
  const add=(symptom:string)=>{if(selected.includes(symptom))return;if(selected.length>=8){setError("You can select a maximum of 8 symptoms.");return}setSelected(items=>[...items,symptom]);setQuery("");setError("")};
  const predict=async()=>{if(selected.length<3)return;setLoading(true);setError("");try{setResult(await api<PredictionReport>("/predictions",{method:"POST",body:JSON.stringify({symptoms:selected})}))}catch{setError("Unable to generate a prediction. Please verify your selected symptoms and try again.")}finally{setLoading(false)}};
  return <div className="prediction-page ml-prediction-page">
    <div className="prediction-intro"><span className="eyebrow"><Sparkles/> UHS Intelligence</span><h1>Understand what your body is telling you.</h1><p>Select 3-8 symptoms and adding more relevant symptoms will provide better results.</p><div><ShieldCheck/>Your prediction is private and saved to your patient history</div></div>
    <div className="prediction-shell">
      <section className="assessment card"><div className="step-head"><div><h2>What are you feeling?</h2></div><span>{selected.length}/8</span></div><div className="progress"><i style={{width:`${selected.length/8*100}%`}}/></div>
        <label>Search symptoms<div className="input"><Search/><input value={query} onFocus={()=>setSelectorOpen(true)} onChange={event=>{setQuery(event.target.value.toLowerCase());setSelectorOpen(true)}} onKeyDown={event=>{if(event.key==="Escape")setSelectorOpen(false)}} placeholder="Click to browse or type a symptom..." autoComplete="off" aria-expanded={selectorOpen} aria-controls="symptom-options"/></div></label>
        {selectorOpen&&matches.length>0&&<div className="symptom-search-results" id="symptom-options"><small>{selected.length?"Related symptoms first":"All dataset symptoms"}</small>{matches.map(symptom=><button type="button" onClick={()=>add(symptom)} key={symptom}>{title(symptom)}</button>)}</div>}
        <div className="selected-symptom-tags">{selected.map(symptom=><span key={symptom}><Check/>{title(symptom)}<button aria-label={`Remove ${symptom}`} onClick={()=>setSelected(items=>items.filter(item=>item!==symptom))}><X/></button></span>)}</div>
        <p className="prediction-help">{selected.length<3?"Please select at least 3 symptoms.":"Choose only symptoms you actually have; 5–8 relevant symptoms can improve differentiation when conditions overlap."}</p>
        {error&&<p role="alert" className="form-error">{error}</p>}
        <Button onClick={predict} disabled={selected.length<3||selected.length>8||loading}>{loading?"Running trained model...":"Predict Disease"} <BrainCircuit/></Button>
      </section>
    </div>
    {result&&<PredictionReportView report={result}/>}
  </div>
}

export function PredictionHistory(){
  const [items,setItems]=useState<PredictionReport[]>([]);
  const [active,setActive]=useState<PredictionReport|null>(null);
  const [deleting,setDeleting]=useState<string|null>(null);
  useEffect(()=>{api<PredictionReport[]>("/predictions/history").then(setItems).catch(()=>setItems([]))},[]);
  useEffect(()=>{if(!active)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setActive(null)};addEventListener("keydown",close);return()=>removeEventListener("keydown",close)},[active]);
  const remove=async(item:PredictionReport)=>{if(!confirm(`Delete the ${title(item.disease)} prediction result?`))return;setDeleting(item.id);try{await api(`/predictions/${item.id}`,{method:"DELETE"});setItems(current=>current.filter(entry=>entry.id!==item.id));if(active?.id===item.id)setActive(null)}finally{setDeleting(null)}};
  return <article className="card"><h3>AI prediction history</h3>{items.length===0?<p>No saved predictions yet.</p>:<div className="prediction-history-grid">{items.map(item=>{const date=new Date(item.predictionDatetime);return <div className="patient-record" key={item.id}><span className="pill">ML Screening</span><h3>{title(item.disease)}</h3><p>{date.toLocaleDateString()} · {date.toLocaleTimeString()}</p><p>Symptoms: {item.selectedSymptoms.map(title).join(", ")}</p><p>Confidence: {Math.round(item.confidence*10000)/100}%</p><div className="prediction-history-actions"><Button variant="ghost" onClick={()=>setActive(item)}>View Details</Button><Button variant="ghost" onClick={()=>remove(item)} disabled={deleting===item.id}><Trash2/>{deleting===item.id?"Deleting...":"Delete"}</Button></div></div>})}</div>}
    {active&&<div className="blog-modal-overlay" onMouseDown={()=>setActive(null)}><article className="prediction-history-modal" role="dialog" aria-modal="true" aria-label={`${active.disease} prediction details`} onMouseDown={event=>event.stopPropagation()}><button className="blog-reader-close" onClick={()=>setActive(null)} aria-label="Close prediction details"><X/></button><PredictionReportView report={active}/></article></div>}
  </article>
}
