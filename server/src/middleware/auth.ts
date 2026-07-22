import type {RequestHandler} from 'express';
import jwt from 'jsonwebtoken';
import type {Role} from '@prisma/client';
import {env} from '../config/env.js';
import {AppError} from '../lib/errors.js';
type Claims={sub:string;role:Role;type:'access'};
export const authenticate:RequestHandler=(req,_res,next)=>{const token=req.headers.authorization?.replace(/^Bearer\s+/i,'');if(!token)return next(new AppError(401,'Authentication required','AUTH_REQUIRED'));try{const claims=jwt.verify(token,env.JWT_ACCESS_SECRET) as Claims;if(claims.type!=='access')throw new Error();req.auth={userId:claims.sub,role:claims.role};next()}catch{next(new AppError(401,'Access token is invalid or expired','INVALID_TOKEN'))}};
export const authorize=(...roles:Role[]):RequestHandler=>(req,_res,next)=>req.auth&&roles.includes(req.auth.role)?next():next(new AppError(403,'You do not have access to this resource','FORBIDDEN'));
