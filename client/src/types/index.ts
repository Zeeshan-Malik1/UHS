export type Doctor={id:string|number;name:string;specialty:string;hospital:string;experience:number;rating:number;reviews:number;image:string;available:string;gender?:'Male'|'Female';languages?:string[]};
export type Hospital={name:string;location:string;distance:string;rating:number;emergency:boolean;image:string;departments:string[]};
