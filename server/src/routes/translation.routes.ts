import {Router} from "express";
import rateLimit from "express-rate-limit";
import {z} from "zod";
import {env} from "../config/env.js";
import {AppError} from "../lib/errors.js";

const router=Router();
const cache=new Map<string,string>();
router.use(rateLimit({windowMs:15*60*1000,limit:60,standardHeaders:"draft-7",legacyHeaders:false}));

router.post("/urdu",async(req,res)=>{
  const {texts}=z.object({
    texts:z.array(z.string().trim().min(1).max(6000)).min(1).max(40),
  }).refine(value=>value.texts.reduce((total,text)=>total+text.length,0)<=16000,"Translation batch is too large.").parse(req.body);
  const missing=[...new Set(texts)].filter(text=>!cache.has(text));
  if(missing.length){
    if(!env.GEMINI_API_KEY)throw new AppError(503,"Urdu translation is temporarily unavailable.");
    const prompt=[
      "Translate each JSON array item from English to natural, clear Pakistani Urdu.",
      "Return only a JSON array of translated strings in the same order and length.",
      "Preserve UHS, email addresses, URLs, numbers, appointment IDs, medicine names, disease names, and people's names exactly where necessary.",
      "Do not add explanations or markdown.",
      JSON.stringify(missing),
    ].join("\n");
    const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",{
      method:"POST",
      headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
      body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.1,responseMimeType:"application/json"}}),
    });
    if(!response.ok)throw new AppError(503,"Urdu translation is temporarily unavailable.");
    const body:any=await response.json();
    const raw=body.candidates?.[0]?.content?.parts?.map((part:any)=>part.text??"").join("")??"";
    let translated:unknown;
    try{translated=JSON.parse(raw)}catch{throw new AppError(503,"Urdu translation returned an invalid response.")}
    if(!Array.isArray(translated)||translated.length!==missing.length)throw new AppError(503,"Urdu translation returned an incomplete response.");
    missing.forEach((text,index)=>cache.set(text,String((translated as unknown[])[index]??text)));
  }
  res.json({success:true,data:texts.map(text=>cache.get(text)??text)});
});

export default router;
