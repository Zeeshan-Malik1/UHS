import {Router} from 'express';
import {z} from 'zod';
import {authenticate,authorize} from '../middleware/auth.js';
import {prisma} from '../lib/prisma.js';
import {AppError} from '../lib/errors.js';
import {mlPredictionService} from '../services/ml-prediction.service.js';

const router=Router();
const symptomSchema=z.array(z.string().min(1)).min(3).max(8).refine(items=>new Set(items.map(item=>item.trim().toLowerCase())).size===items.length,'Duplicate symptoms are not allowed');

router.get('/symptoms',authenticate,authorize('PATIENT'),async(req,res)=>{
  const selected=typeof req.query.selected==='string'?req.query.selected.split('|').map(item=>item.trim()).filter(Boolean):[];
  try{res.json({success:true,data:await mlPredictionService.symptoms(selected)})}
  catch{throw new AppError(503,'Unable to load the trained prediction model.')}
});

router.post('/',authenticate,authorize('PATIENT'),async(req,res)=>{
  const symptoms=symptomSchema.parse(req.body.symptoms);
  try{
    const available=new Set((await mlPredictionService.symptoms()).map(item=>item.toLowerCase()));
    if(symptoms.some(item=>!available.has(item.trim().toLowerCase())))throw new AppError(422,'One or more selected symptoms are not available in the trained dataset.');
    const report=await mlPredictionService.predict(symptoms);
    const patient=await prisma.patient.findUniqueOrThrow({where:{userId:req.auth!.userId}});
    const record=await prisma.aiPrediction.create({data:{
      patientId:patient.id,input:{symptoms:report.selectedSymptoms},result:report as any,
      confidence:report.confidence,severity:'SCREENING_RESULT',modelVersion:report.modelVersion,
      predictedDisease:report.disease,selectedSymptoms:report.selectedSymptoms,
      description:report.description,diet:report.diet,medications:report.medications,
      precautions:report.precautions,workout:report.workout,recoveryTips:report.recoveryTips,
      predictionDatetime:new Date(report.predictionDatetime),
    }});
    res.status(201).json({success:true,data:{id:record.id,...report}});
  }catch(error){
    if(error instanceof AppError)throw error;
    console.error('ML prediction failed',error);
    throw new AppError(503,'Unable to generate a prediction. Please verify your selected symptoms and try again.');
  }
});

router.get('/history',authenticate,authorize('PATIENT'),async(req,res)=>{
  const patient=await prisma.patient.findUniqueOrThrow({where:{userId:req.auth!.userId}});
  const records=await prisma.aiPrediction.findMany({where:{patientId:patient.id},orderBy:{createdAt:'desc'}});
  res.json({success:true,data:records.map(record=>({
    id:record.id,disease:record.predictedDisease??(record.result as any)?.disease,
    topPredictions:(record.result as any)?.topPredictions??[{disease:record.predictedDisease??(record.result as any)?.disease,confidence:record.confidence}],
    confidence:record.confidence,selectedSymptoms:record.selectedSymptoms??(record.input as any)?.symptoms??[],
    description:record.description??(record.result as any)?.description??'',
    diet:record.diet??(record.result as any)?.diet??[],medications:record.medications??(record.result as any)?.medications??[],
    precautions:record.precautions??(record.result as any)?.precautions??[],workout:record.workout??(record.result as any)?.workout??[],
    recoveryTips:record.recoveryTips??[],predictionDatetime:record.predictionDatetime??record.createdAt,createdAt:record.createdAt,
  }))});
});

router.delete('/:id',authenticate,authorize('PATIENT'),async(req,res)=>{
  const id=z.string().min(1).parse(req.params.id);
  const patient=await prisma.patient.findUniqueOrThrow({where:{userId:req.auth!.userId}});
  const record=await prisma.aiPrediction.findFirst({where:{id,patientId:patient.id},select:{id:true}});
  if(!record)throw new AppError(404,'Prediction result not found.');
  await prisma.aiPrediction.delete({where:{id:record.id}});
  res.json({success:true,message:'Prediction result deleted.'});
});

export default router;
