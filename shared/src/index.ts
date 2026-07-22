export type UserRole='PATIENT'|'DOCTOR'|'ADMIN';
export type AppointmentState='PENDING'|'APPROVED'|'REJECTED'|'CANCELLED'|'COMPLETED'|'RESCHEDULED';
export interface ApiResponse<T>{success:boolean;data:T;message?:string}
export interface PredictionRequest{symptoms:string[];age:number;gender:string;weight?:number;height?:number;medicalHistory?:string[];smoking?:boolean;alcohol?:boolean;pregnant?:boolean}
export interface PredictionResult{disease:string;confidence:number;severity:string;specialist:string;recommendedMedicines:string[];diet:{eat:string[];avoid:string[]};workout:string[];suggestedTests:string[];disclaimer:string}
