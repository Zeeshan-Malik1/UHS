import {useEffect,useMemo,useRef,useState} from "react";
import {AnimatePresence,motion} from "framer-motion";
import {CalendarDays,Clock,Search,X} from "lucide-react";
import {healthBlogCategories,healthBlogs,type HealthBlog} from "../data/healthBlogs";
import {Button} from "./ui";

function usePageSize(){
  const read=()=>window.innerWidth<640?2:window.innerWidth<1024?4:6;
  const [size,setSize]=useState(read);
  useEffect(()=>{const update=()=>setSize(read());addEventListener("resize",update);return()=>removeEventListener("resize",update)},[]);
  return size;
}

export function BlogModal({blog,onClose}:{blog:HealthBlog|null;onClose:()=>void}){
  const dialogRef=useRef<HTMLElement>(null);
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
  return <AnimatePresence>{blog&&<motion.div className="blog-modal-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={onClose}>
    <motion.article ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="blog-modal-title" className="blog-reader" initial={{opacity:0,y:30,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20,scale:.98}} onMouseDown={event=>event.stopPropagation()}>
      <button className="blog-reader-close" onClick={onClose} aria-label="Close article"><X/></button>
      <img src={blog.coverImage} alt={blog.alt}/>
      <div className="blog-reader-content">
        <span className="pill">{blog.category}</span>
        <h1 id="blog-modal-title">{blog.title}</h1>
        <div className="blog-byline"><span>{blog.author}</span><span><CalendarDays/> {new Date(blog.publishDate).toLocaleDateString()}</span><span><Clock/> {blog.readingTime}</span></div>
        <p className="blog-disclaimer">Educational information only. It does not replace diagnosis or treatment from a qualified healthcare professional.</p>
        {blog.sections.map(section=><section key={section.heading}><h2>{section.heading}</h2>{section.blocks.map((block,index)=><p key={index}>{block}</p>)}</section>)}
      </div>
    </motion.article>
  </motion.div>}</AnimatePresence>
}

export function HealthLibrary(){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [page,setPage]=useState(1);
  const [active,setActive]=useState<HealthBlog|null>(null);
  const perPage=usePageSize();
  const filtered=useMemo(()=>{
    const term=query.trim().toLowerCase();
    return healthBlogs.filter(blog=>(category==="All"||blog.category===category)&&(!term||[blog.title,blog.category,blog.keywords.join(" ")].join(" ").toLowerCase().includes(term)));
  },[query,category]);
  const pages=Math.max(1,Math.ceil(filtered.length/perPage));
  const visible=filtered.slice((page-1)*perPage,page*perPage);
  useEffect(()=>setPage(1),[query,category,perPage]);
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
    {visible.length?<div className="health-blog-grid">{visible.map(blog=><motion.article whileHover={{y:-6}} className="health-blog-card card" tabIndex={0} role="button" aria-label={`Read ${blog.title}`} onClick={()=>setActive(blog)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setActive(blog)}}} key={blog.id}>
      <img src={blog.coverImage} alt={blog.alt} loading="lazy" decoding="async"/>
      <div className="health-blog-card-body"><span className="pill">{blog.category}</span><h2>{blog.title}</h2><p>{blog.description}</p><div className="blog-card-meta"><span><Clock/> {blog.readingTime}</span><span><CalendarDays/> {new Date(blog.publishDate).toLocaleDateString()}</span></div><Button variant="ghost" onClick={()=>setActive(blog)}>Read More</Button></div>
    </motion.article>)}</div>:<p className="library-empty">No health blogs match your search.</p>}
    {pages>1&&<nav className="pagination blog-pagination" aria-label="Blog pagination">
      <Button variant="secondary" disabled={page===1} onClick={()=>setPage(value=>Math.max(1,value-1))}>Previous</Button>
      <div>{Array.from({length:pages},(_,index)=>index+1).map(number=><button className={page===number?"active":""} aria-current={page===number?"page":undefined} onClick={()=>setPage(number)} key={number}>{number}</button>)}</div>
      <Button variant="secondary" disabled={page===pages} onClick={()=>setPage(value=>Math.min(pages,value+1))}>Next</Button>
    </nav>}
    <BlogModal blog={active} onClose={()=>setActive(null)}/>
  </div>
}
