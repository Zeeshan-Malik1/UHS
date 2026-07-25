import {useEffect,useMemo,useRef,useState} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {CalendarDays,Clock,Search,X} from "lucide-react";
import {healthBlogCategories,healthBlogs,type HealthBlog} from "../data/healthBlogs";
import {Button} from "./ui";
import {useLanguage} from "../context/LanguageContext";
import {api} from "../services/api";

const urduBlogCache=new Map<string,HealthBlog>();
const urduBlogCardCache=new Map<string,HealthBlog>();
export async function translateBlogCards(blogs:HealthBlog[]){
  const missing=blogs.filter(blog=>!urduBlogCardCache.has(blog.id));
  const source=missing.flatMap(blog=>[blog.title,blog.category,blog.description,blog.readingTime,blog.alt]);
  const translated:string[]=[];
  for(let offset=0;offset<source.length;){
    const batch=source.slice(offset,offset+40);offset+=batch.length;
    translated.push(...await api<string[]>("/translation/urdu",{method:"POST",body:JSON.stringify({texts:batch})}));
  }
  let index=0;
  missing.forEach(blog=>urduBlogCardCache.set(blog.id,{
    ...blog,title:translated[index++],category:translated[index++],description:translated[index++],
    readingTime:translated[index++],alt:translated[index++],
  }));
  return new Map(blogs.map(blog=>[blog.id,urduBlogCardCache.get(blog.id)??blog]));
}
async function translateBlog(blog:HealthBlog){
  const cached=urduBlogCache.get(blog.id);if(cached)return cached;
  const source=[
    blog.title,blog.category,blog.description,blog.metaDescription,blog.readingTime,
    blog.author,blog.alt,...blog.sections.flatMap(section=>[section.heading,...section.blocks]),
  ];
  const translated:string[]=[];
  for(let offset=0;offset<source.length;){
    const batch:string[]=[];let characters=0;
    while(offset<source.length&&batch.length<40){
      const value=source[offset];
      if(batch.length&&characters+value.length>12000)break;
      batch.push(value);characters+=value.length;offset+=1;
    }
    translated.push(...await api<string[]>("/translation/urdu",{method:"POST",body:JSON.stringify({texts:batch})}));
  }
  let index=0;
  const result:HealthBlog={
    ...blog,title:translated[index++],category:translated[index++],description:translated[index++],
    metaDescription:translated[index++],readingTime:translated[index++],author:translated[index++],
    alt:translated[index++],sections:blog.sections.map(section=>({
      heading:translated[index++],blocks:section.blocks.map(()=>translated[index++]),
    })),
  };
  urduBlogCache.set(blog.id,result);return result;
}

function usePageSize(){
  const read=()=>window.innerWidth<640?2:window.innerWidth<1024?4:6;
  const [size,setSize]=useState(read);
  useEffect(()=>{const update=()=>setSize(read());addEventListener("resize",update);return()=>removeEventListener("resize",update)},[]);
  return size;
}

export function BlogModal({blog,onClose}:{blog:HealthBlog|null;onClose:()=>void}){
  const dialogRef=useRef<HTMLElement>(null);
  const {language}=useLanguage();
  const [urduBlog,setUrduBlog]=useState<HealthBlog|null>(null);
  useEffect(()=>{
    let active=true;
    if(!blog||language==="en"){setUrduBlog(null);return()=>{active=false}}
    setUrduBlog(urduBlogCache.get(blog.id)??null);
    translateBlog(blog).then(value=>{if(active)setUrduBlog(value)}).catch(()=>{});
    return()=>{active=false};
  },[blog?.id,language]);
  useEffect(()=>{
    if(!blog)return;
    const previous=document.activeElement as HTMLElement|null;
    const handle=(event:KeyboardEvent)=>{
      if(event.key==="Escape")onClose();
      if(event.key!=="Tab"||!dialogRef.current)return;
      const focusable=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(element=>!element.hasAttribute("disabled"));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    };
    document.body.style.overflow="hidden";
    addEventListener("keydown",handle);
    requestAnimationFrame(()=>dialogRef.current?.querySelector<HTMLElement>("button")?.focus());
    return()=>{document.body.style.overflow="";removeEventListener("keydown",handle);previous?.focus()}
  },[blog,onClose]);
  const visibleBlog=language==="ur"?urduBlog:blog;
  return <AnimatePresence>{blog&&<motion.div className="blog-modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={onClose}>
    <motion.article ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="blog-modal-title" className="blog-reader" initial={{opacity:0,y:30,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:.98}} onMouseDown={event=>event.stopPropagation()}>
      <button className="blog-reader-close" onClick={onClose} aria-label="Close article"><X/></button>
      <img src={blog.coverImage} alt={visibleBlog?.alt??"صحت کا تعلیمی مضمون"}/>
      {visibleBlog?<div className="blog-reader-content">
        <span className="pill">{visibleBlog.category}</span>
        <h1 id="blog-modal-title">{visibleBlog.title}</h1>
        <div className="blog-byline"><span>{visibleBlog.author}</span><span><CalendarDays/> {new Date(blog.publishDate).toLocaleDateString(language==="ur"?"ur-PK":undefined)}</span><span><Clock/> {visibleBlog.readingTime}</span></div>
        <p className="blog-disclaimer">Educational information only. It does not replace diagnosis or treatment from a qualified healthcare professional.</p>
        {visibleBlog.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2>{section.blocks.map((block,index)=><p key={index}>{block}</p>)}</section>)}
      </div>:<div className="blog-reader-content blog-translation-loading" dir="rtl"><h2>اردو مضمون تیار ہو رہا ہے۔۔۔</h2><p>براہ کرم چند لمحے انتظار کریں۔</p></div>}
    </motion.article>
  </motion.div>}</AnimatePresence>
}

export function HealthLibrary(){
  const {language}=useLanguage();
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [page,setPage]=useState(1);
  const [active,setActive]=useState<HealthBlog|null>(null);
  const [urduCards,setUrduCards]=useState<Map<string,HealthBlog>>(()=>new Map(urduBlogCardCache));
  const perPage=usePageSize();
  const filtered=useMemo(()=>{
    const term=query.trim().toLowerCase();
    return healthBlogs.filter(blog=>(category==="All"||blog.category===category)&&(!term||[blog.title,blog.category,blog.keywords.join(" ")].join(" ").toLowerCase().includes(term)));
  },[query,category]);
  const pages=Math.max(1,Math.ceil(filtered.length/perPage));
  const visible=filtered.slice((page-1)*perPage,page*perPage);
  useEffect(()=>setPage(1),[query,category,perPage]);
  useEffect(()=>{
    let active=true;
    if(language==="en")return()=>{active=false};
    setUrduCards(new Map(urduBlogCardCache));
    translateBlogCards(healthBlogs).then(cards=>{if(active)setUrduCards(cards)}).catch(()=>{});
    return()=>{active=false};
  },[language]);
  return <div className="page health-blog-page">
    <div className="page-hero">
      <span className="eyebrow">UHS Health Library</span>
      <h1>Health knowledge for everyday life</h1>
      <p>Original, practical medical education written for informed everyday decisions.</p>
      <div className="big-search"><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by title, category, or keyword" aria-label="Search health blogs"/><Button>Search</Button></div>
    </div>
    <div className="blog-categories" aria-label="Filter health blogs by category">
      {healthBlogCategories.map(item=><button className={category===item?"active":""} aria-pressed={category===item} onClick={()=>setCategory(item)} key={item}>{item}</button>)}
    </div>
    <div className="library-tools"><span>{filtered.length} health blog{filtered.length===1?"":"s"}</span><span>Showing {visible.length} on this page</span></div>
    {visible.length?<div className="health-blog-grid">{visible.map(blog=>{const localized=language==="ur"?urduCards.get(blog.id):blog;return <motion.article whileHover={{y:-6}} className="health-blog-card card" tabIndex={0} role="button" aria-label={localized?`Read ${localized.title}`:"اردو بلاگ تیار ہو رہا ہے"} onClick={()=>setActive(blog)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setActive(blog)}}} key={blog.id}>
      <img src={blog.coverImage} alt={localized?.alt??"صحت کا تعلیمی مضمون"} loading="lazy" decoding="async"/>
      <div className="health-blog-card-body">{localized?<><span className="pill">{localized.category}</span><h2>{localized.title}</h2><p>{localized.description}</p><div className="blog-card-meta"><span><Clock/> {localized.readingTime}</span><span><CalendarDays/> {new Date(blog.publishDate).toLocaleDateString(language==="ur"?"ur-PK":undefined)}</span></div><Button variant="ghost" onClick={()=>setActive(blog)}>Read More</Button></>:<><span className="pill">صحت</span><h2>اردو عنوان تیار ہو رہا ہے۔۔۔</h2><p>براہ کرم چند لمحے انتظار کریں۔</p></>}</div>
    </motion.article>})}</div>:<p className="library-empty">No health blogs match your search.</p>}
    {pages>1&&<nav className="pagination blog-pagination" aria-label="Blog pagination">
      <Button variant="secondary" disabled={page===1} onClick={()=>setPage(value=>Math.max(1,value-1))}>Previous</Button>
      <div>{Array.from({length:pages},(_,index)=>index+1).map(number=><button className={page===number?"active":""} aria-current={page===number?"page":undefined} onClick={()=>setPage(number)} key={number}>{number}</button>)}</div>
      <Button variant="secondary" disabled={page===pages} onClick={()=>setPage(value=>Math.min(pages,value+1))}>Next</Button>
    </nav>}
    <BlogModal blog={active} onClose={()=>setActive(null)}/>
  </div>
}
