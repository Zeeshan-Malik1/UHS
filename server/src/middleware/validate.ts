import type {RequestHandler} from 'express';import type {ZodType} from 'zod';
export const validate=(schema:ZodType):RequestHandler=>(req,_res,next)=>{const value=schema.parse({body:req.body,params:req.params,query:req.query}) as {body:unknown;params:any;query:any};req.body=value.body;req.params=value.params;req.query=value.query;next()};
