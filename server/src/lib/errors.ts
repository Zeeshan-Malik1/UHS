import type {ErrorRequestHandler,RequestHandler} from 'express';
import {ZodError} from 'zod';
export class AppError extends Error{constructor(public status:number,message:string,public code='APP_ERROR'){super(message)}}
export const notFound:RequestHandler=(req,_res,next)=>next(new AppError(404,`Route ${req.method} ${req.path} not found`,'NOT_FOUND'));
export const errorHandler:ErrorRequestHandler=(error,_req,res,_next)=>{if(error instanceof ZodError){res.status(422).json({success:false,message:'Validation failed',issues:error.issues});return}const status=error instanceof AppError?error.status:500;res.status(status).json({success:false,message:status===500?'An unexpected error occurred':error.message,code:error.code??'INTERNAL_ERROR'});};
