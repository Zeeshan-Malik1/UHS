import nodemailer from 'nodemailer';import {env} from '../config/env.js';
const transport=env.SMTP_HOST?nodemailer.createTransport({host:env.SMTP_HOST,port:env.SMTP_PORT,secure:env.SMTP_PORT===465,auth:env.SMTP_USER?{user:env.SMTP_USER,pass:env.SMTP_PASS}:undefined}):null;
export const emailService={async send(to:string,subject:string,html:string){if(!transport){if(env.NODE_ENV==='development')console.info(`[email preview] ${to}: ${subject}`);return}await transport.sendMail({from:env.SMTP_FROM,to,subject,html})}};
