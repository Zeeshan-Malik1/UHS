import {spawn,type ChildProcessWithoutNullStreams} from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

type ModelReport={disease:string;confidence:number;topPredictions:Array<{disease:string;confidence:number}>;selectedSymptoms:string[];description:string;diet:string[];medications:string[];precautions:string[];workout:string[];recoveryTips:string[];predictionDatetime:string;modelVersion:string};

class MlPredictionService{
  private child:ChildProcessWithoutNullStreams|null=null;
  private nextId=1;
  private pending=new Map<number,{resolve:(value:any)=>void;reject:(error:Error)=>void}>();
  private startPromise:Promise<void>|null=null;

  private start(){
    if(this.startPromise)return this.startPromise;
    this.startPromise=new Promise((resolve,reject)=>{
      const script=path.resolve(process.cwd(),'ml','prediction_worker.py');
      const child=spawn(process.env.PYTHON_COMMAND??'python',[script],{stdio:['pipe','pipe','pipe']});
      this.child=child;
      const output=readline.createInterface({input:child.stdout});
      let ready=false;
      output.on('line',line=>{
        try{
          const message=JSON.parse(line);
          if(message.ready){ready=true;resolve();return}
          const request=this.pending.get(message.id);
          if(!request)return;
          this.pending.delete(message.id);
          message.error?request.reject(new Error(message.error)):request.resolve(message.data);
        }catch(error){if(!ready)reject(error)}
      });
      child.stderr.on('data',chunk=>console.error(`[prediction-model] ${String(chunk).trim()}`));
      child.on('error',error=>{this.startPromise=null;reject(error)});
      child.on('exit',code=>{
        this.child=null;this.startPromise=null;
        const error=new Error(`Prediction model process stopped (${code})`);
        for(const request of this.pending.values())request.reject(error);
        this.pending.clear();
      });
    });
    return this.startPromise;
  }

  private async request<T>(payload:Record<string,unknown>):Promise<T>{
    await this.start();
    const id=this.nextId++;
    return new Promise<T>((resolve,reject)=>{
      this.pending.set(id,{resolve,reject});
      this.child!.stdin.write(`${JSON.stringify({id,...payload})}\n`);
    });
  }

  symptoms(selected:string[]=[]){return this.request<string[]>({action:'symptoms',selected})}
  predict(symptoms:string[]){return this.request<ModelReport>({action:'predict',symptoms})}
}

export const mlPredictionService=new MlPredictionService();
