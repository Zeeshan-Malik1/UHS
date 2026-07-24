import {Router} from 'express';
import {z} from 'zod';
import {env} from '../config/env.js';
import {AppError} from '../lib/errors.js';

const router=Router();
const systemInstruction=`You are UHS AI Assistant, a friendly, concise general-purpose assistant for Universal Health System visitors and members. You can answer everyday questions on any topic as well as explain UHS features and educational healthcare information. Be accurate, helpful, and clear. Never diagnose, prescribe, or claim to replace a licensed clinician. For emergency symptoms (chest pain, stroke signs, severe breathing difficulty, severe bleeding, collapse, suicidal thoughts), urge immediate emergency services or emergency department care. Keep responses under 180 words and use simple language. End each response with: "Is there anything else I can help you with?"`;

router.post('/chat',async(req,res)=>{
  const data=z.object({message:z.string().trim().min(1).max(2000),history:z.array(z.object({role:z.enum(['user','model']),text:z.string().max(4000)})).max(12).default([])}).parse(req.body);
  if(!env.GEMINI_API_KEY)throw new AppError(503,'AI Assistant is not configured');
  const contents=[...data.history.map(item=>({role:item.role,parts:[{text:item.text}]})),{role:'user' as const,parts:[{text:data.message}]}];
  const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:systemInstruction}]},contents,generationConfig:{maxOutputTokens:384}})});
  if(!response.ok){console.error('Gemini assistant error',response.status,await response.text());throw new AppError(response.status===429?429:502,response.status===429?'UHS AI Assistant is temporarily at capacity. Please try again shortly.':'UHS AI Assistant is temporarily unavailable. Please try again shortly.');}
  const body=await response.json() as {candidates?:Array<{content?:{parts?:Array<{text?:string}>}}>};
  const text=body.candidates?.[0]?.content?.parts?.map(part=>part.text??'').join('').trim();
  if(!text)throw new AppError(502,'UHS AI Assistant returned an empty response. Please try again.');
  res.json({success:true,data:{text}});
});
export default router;
