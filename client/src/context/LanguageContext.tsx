import {createContext,useContext,useEffect,useMemo,useRef,useState} from "react";

export type Language="en"|"ur";
type LanguageValue={language:Language;setLanguage:(language:Language)=>void};
const LanguageContext=createContext<LanguageValue|null>(null);

const urdu:Record<string,string>={
  "Home":"ہوم","Find Doctors":"ڈاکٹر تلاش کریں","AI Prediction":"اے آئی تشخیص","Nearby Hospitals":"قریبی ہسپتال",
  "Health Library":"صحت کی لائبریری","About":"ہمارے بارے میں","Contact":"رابطہ","Patient Portal":"مریض پورٹل",
  "Doctor Panel":"ڈاکٹر پینل","Admin Panel":"ایڈمن پینل","Patient/Doctor":"مریض/ڈاکٹر","Admin":"ایڈمن",
  "Get started":"شروع کریں","Logout":"لاگ آؤٹ","Patient/Doctor login":"مریض/ڈاکٹر لاگ اِن","Admin login":"ایڈمن لاگ اِن",
  "Create account":"اکاؤنٹ بنائیں","Search":"تلاش","Toggle theme":"تھیم تبدیل کریں","Menu":"مینو","Website language":"ویب سائٹ کی زبان",
  "English":"انگریزی",
  "Healthcare that understands you. One intelligent platform for a healthier life.":"صحت کی دیکھ بھال جو آپ کو سمجھتی ہے۔ بہتر صحت کے لیے ایک ذہین پلیٹ فارم۔",
  "Universal Standard for":"عالمی معیار برائے","Modern Healthcare":"جدید صحت کی دیکھ بھال",
  "One secure platform to understand your health, find trusted doctors, and access better care wherever life takes you.":"اپنی صحت سمجھنے، قابل اعتماد ڈاکٹر تلاش کرنے اور ہر جگہ بہتر نگہداشت حاصل کرنے کے لیے ایک محفوظ پلیٹ فارم۔",
  "Check your symptoms":"اپنی علامات چیک کریں","Patient rating":"مریضوں کی درجہ بندی","People supported":"لوگوں کی معاونت",
  "Care access":"نگہداشت تک رسائی","Care without complexity":"آسان نگہداشت",
  "Everything your health needs, in one place":"آپ کی صحت کی ہر ضرورت، ایک ہی جگہ",
  "From first question to follow-up, UHS helps you move forward with clarity and confidence.":"پہلے سوال سے فالو اپ تک، یو ایچ ایس وضاحت اور اعتماد کے ساتھ آگے بڑھنے میں مدد کرتا ہے۔",
  "AI health insights":"اے آئی صحت بصیرت","Understand symptoms with intelligent, responsible guidance.":"ذہین اور ذمہ دار رہنمائی کے ساتھ علامات سمجھیں۔",
  "Easy appointments":"آسان اپائنٹمنٹس","Book trusted specialists in just a few thoughtful steps.":"چند آسان مراحل میں قابل اعتماد ماہر سے وقت لیں۔",
  "Verified doctors":"تصدیق شدہ ڈاکٹر","Discover experienced professionals across every specialty.":"ہر تخصص میں تجربہ کار ماہرین تلاش کریں۔",
  "Nearby care":"قریبی نگہداشت","Locate hospitals, emergency care and clinics near you.":"اپنے قریب ہسپتال، ایمرجنسی نگہداشت اور کلینک تلاش کریں۔",
  "Health records":"صحت کے ریکارڈ","Keep your medical journey organized in one secure place.":"اپنا طبی سفر ایک محفوظ جگہ منظم رکھیں۔",
  "Health analytics":"صحت کا تجزیہ","Follow meaningful trends and make better daily decisions.":"اہم رجحانات دیکھیں اور بہتر روزمرہ فیصلے کریں۔",
  "Explore":"مزید دیکھیں","UHS Intelligence":"یو ایچ ایس ذہانت","Clarity when your health feels uncertain.":"جب صحت غیر یقینی لگے تو واضح رہنمائی۔",
  "Share what you’re experiencing and receive an easy-to-understand health assessment, recommended next steps, and the right specialist in minutes.":"اپنی کیفیت بتائیں اور چند منٹ میں آسان صحت جانچ، اگلے اقدامات اور مناسب ماہر کی رہنمائی حاصل کریں۔",
  "Private and secure by design":"بنیادی طور پر نجی اور محفوظ","Clear, evidence-aware guidance":"واضح اور شواہد پر مبنی رہنمائی",
  "Connected to real clinical care":"حقیقی طبی نگہداشت سے منسلک",
  "Quick links":"فوری روابط","Services":"خدمات","Contact us":"ہم سے رابطہ کریں","Privacy":"رازداری",
  "Terms":"شرائط","All rights reserved.":"جملہ حقوق محفوظ ہیں۔",
  "Understand what your body is telling you.":"سمجھیں کہ آپ کا جسم آپ کو کیا بتا رہا ہے۔",
  "Select 3-8 symptoms and adding more relevant symptoms will provide better results.":"3 سے 8 علامات منتخب کریں، مزید متعلقہ علامات بہتر نتائج فراہم کریں گی۔",
  "Your prediction is private and saved to your patient history":"آپ کی پیش گوئی نجی ہے اور مریض کی ہسٹری میں محفوظ ہوتی ہے",
  "What are you feeling?":"آپ کیا محسوس کر رہے ہیں؟","Search symptoms":"علامات تلاش کریں",
  "Click to browse or type a symptom...":"فہرست دیکھنے کے لیے کلک کریں یا علامت لکھیں۔۔۔",
  "All dataset symptoms":"تمام علامات","Related symptoms first":"متعلقہ علامات پہلے",
  "Please select at least 3 symptoms.":"کم از کم 3 علامات منتخب کریں۔",
  "Choose only symptoms you actually have; 5–8 relevant symptoms can improve differentiation when conditions overlap.":"صرف وہ علامات منتخب کریں جو واقعی موجود ہوں؛ 5 سے 8 متعلقہ علامات ملتی جلتی بیماریوں میں بہتر فرق کر سکتی ہیں۔",
  "Predict Disease":"بیماری کی پیش گوئی کریں","Running trained model...":"تجزیہ جاری ہے۔۔۔",
  "MOST LIKELY CONDITION":"سب سے زیادہ ممکنہ کیفیت","Top 3 model probabilities":"تین سب سے زیادہ ممکنہ نتائج",
  "Disease Description":"بیماری کی تفصیل","Recommended Medicines":"تجویز کردہ ادویات","Recommended Diet":"تجویز کردہ غذا",
  "Foods To Avoid or Limit":"پرہیز یا محدود کرنے والی غذائیں","Precautions":"احتیاطی تدابیر",
  "Workout Plan and Recovery Exercise":"ورزش اور بحالی کا منصوبہ",
  "This prediction is generated using a trained Machine Learning model and is intended only as a health screening tool. It is not a substitute for professional medical diagnosis. Please consult a qualified healthcare provider.":"یہ نتیجہ مشین لرننگ کے ذریعے صرف ابتدائی صحت جانچ کے لیے تیار کیا گیا ہے۔ یہ پیشہ ورانہ طبی تشخیص کا متبادل نہیں۔ مستند ڈاکٹر سے رجوع کریں۔",
  "This symptom combination overlaps with several conditions. Add more relevant, specific symptoms and run the prediction again, or consult a clinician for assessment.":"یہ علامات کئی بیماریوں سے ملتی ہیں۔ مزید مخصوص متعلقہ علامات شامل کریں یا طبی معائنے کے لیے ڈاکٹر سے رجوع کریں۔",
  "AI prediction history":"اے آئی پیش گوئی کی ہسٹری","No saved predictions yet.":"ابھی کوئی محفوظ پیش گوئی نہیں۔",
  "View Details":"تفصیل دیکھیں","Delete":"حذف کریں","Deleting...":"حذف ہو رہا ہے۔۔۔","ML Screening":"مشین لرننگ جانچ",
  "Book an appointment":"اپائنٹمنٹ بک کریں","Simple, secure booking":"آسان اور محفوظ بکنگ","Doctor":"ڈاکٹر",
  "Date & time":"تاریخ اور وقت","Details":"تفصیلات","Confirmed":"تصدیق شدہ","Choose your doctor":"اپنا ڈاکٹر منتخب کریں",
  "Select a day and time":"دن اور وقت منتخب کریں","Day":"دن","Time":"وقت","Tell us what brings you in":"اپنی آمد کی وجہ بتائیں",
  "Reason for appointment":"اپائنٹمنٹ کی وجہ","New health concern":"صحت کا نیا مسئلہ","Follow-up":"فالو اپ",
  "Routine checkup":"معمول کا معائنہ","Symptoms or notes":"علامات یا نوٹس","Describe your symptoms briefly...":"اپنی علامات مختصراً لکھیں۔۔۔",
  "Back":"واپس","Continue":"جاری رکھیں","Confirm appointment":"اپائنٹمنٹ کی تصدیق کریں","Appointment confirmed":"اپائنٹمنٹ کی تصدیق ہوگئی",
  "Queue position":"قطار میں نمبر","Estimated wait":"متوقع انتظار","Status":"حالت","Appointment Confirmed":"اپائنٹمنٹ تصدیق شدہ",
  "View my appointments":"میری اپائنٹمنٹس دیکھیں","No doctors available":"کوئی ڈاکٹر دستیاب نہیں",
  "No approved doctors are registered yet.":"ابھی کوئی منظور شدہ ڈاکٹر رجسٹرڈ نہیں۔","View doctors":"ڈاکٹر دیکھیں",
  "Live queue":"لائیو قطار","Updates every 15 seconds":"ہر 15 سیکنڈ بعد تازہ کاری","Your appointment":"آپ کی اپائنٹمنٹ",
  "Patients ahead":"آگے موجود مریض","Queue status":"قطار کی حالت","Scheduled":"مقررہ وقت","Enable queue alerts":"قطار کے الرٹس فعال کریں",
  "Appointment time reached":"اپائنٹمنٹ کا وقت ہوگیا","You are next":"اب آپ کی باری ہے","Awaiting approval":"منظوری کا انتظار",
  "Overview":"جائزہ","Appointments":"اپائنٹمنٹس","Consultation":"معائنہ","Patients":"مریض","Doctors":"ڈاکٹر",
  "Medical records":"طبی ریکارڈ","Prescriptions":"نسخے","Lab results":"لیب نتائج","AI Predictions":"اے آئی پیش گوئیاں",
  "Diet Plans":"غذائی منصوبے","Workout Plans":"ورزش کے منصوبے","Requests":"درخواستیں","Notifications":"اطلاعات","Settings":"ترتیبات",
  "PATIENT PORTAL":"مریض پورٹل","DOCTOR PORTAL":"ڈاکٹر پورٹل","ADMIN PORTAL":"ایڈمن پورٹل",
  "Loading patient portal...":"مریض پورٹل لوڈ ہو رہا ہے۔۔۔","Loading doctor portal...":"ڈاکٹر پورٹل لوڈ ہو رہا ہے۔۔۔",
  "Loading admin data...":"ایڈمن ڈیٹا لوڈ ہو رہا ہے۔۔۔","Recent appointments":"حالیہ اپائنٹمنٹس",
  "Latest care updates":"تازہ نگہداشت اپ ڈیٹس","Appointment history":"اپائنٹمنٹ ہسٹری","Cancel appointment":"اپائنٹمنٹ منسوخ کریں",
  "Patient appointments":"مریضوں کی اپائنٹمنٹس","No patient appointments yet.":"ابھی مریضوں کی کوئی اپائنٹمنٹ نہیں۔",
  "Accept":"قبول کریں","Reject":"مسترد کریں","Complete appointment":"اپائنٹمنٹ مکمل کریں","Write record":"ریکارڈ لکھیں",
  "Admin control center":"ایڈمن کنٹرول سینٹر","Registered doctors":"رجسٹرڈ ڈاکٹر","Registered patients":"رجسٹرڈ مریض",
  "All appointments":"تمام اپائنٹمنٹس","Registration and appointment requests":"رجسٹریشن اور اپائنٹمنٹ درخواستیں",
  "Approve":"منظور کریں","Approved doctors":"منظور شدہ ڈاکٹر","Pending doctors":"زیر التوا ڈاکٹر",
  "Registered accounts":"رجسٹرڈ اکاؤنٹس","Can access portal":"پورٹل تک رسائی حاصل ہے","Search appointment, patient, or doctor":"اپائنٹمنٹ، مریض یا ڈاکٹر تلاش کریں",
  "All statuses":"تمام حالتیں","Previous":"پچھلا","Next":"اگلا","Page":"صفحہ",
  "Sign in":"سائن اِن","Create an account":"اکاؤنٹ بنائیں","Forgot password?":"پاس ورڈ بھول گئے؟",
  "New to UHS?":"یو ایچ ایس پر نئے ہیں؟","Already have an account?":"پہلے سے اکاؤنٹ موجود ہے؟",
  "Email address":"ای میل ایڈریس","Password":"پاس ورڈ","Full name":"پورا نام","Phone":"فون","Age":"عمر",
  "Weight":"وزن","Height":"قد","Gender":"جنس","Specialization":"تخصص","Qualification":"قابلیت",
  "Availability":"دستیابی","Please wait...":"براہ کرم انتظار کریں۔۔۔","Send reset link":"ری سیٹ لنک بھیجیں",
  "Find the right doctor for you":"اپنے لیے موزوں ڈاکٹر تلاش کریں","Search doctor, specialty or hospital":"ڈاکٹر، تخصص یا ہسپتال تلاش کریں",
  "All specializations":"تمام تخصص","All days":"تمام دن",
  "Book appointment":"اپائنٹمنٹ بک کریں","View profile":"پروفائل دیکھیں","Available":"دستیاب",
  "Nearby hospitals":"قریبی ہسپتال","Search any hospital by name or filter nearby results":"نام سے ہسپتال تلاش کریں یا قریبی نتائج فلٹر کریں",
  "Emergency":"ایمرجنسی","Open now":"ابھی کھلا ہے","Directions":"راستہ","Call":"کال",
  "About UHS":"یو ایچ ایس کے بارے میں","Contact UHS":"یو ایچ ایس سے رابطہ","Your name":"آپ کا نام",
  "Your email":"آپ کی ای میل","Subject":"موضوع","Message":"پیغام","Send message":"پیغام بھیجیں",
  "Search by title, category, or keyword":"عنوان، زمرہ یا کلیدی لفظ سے تلاش کریں","All":"تمام","Read article":"مضمون پڑھیں",
  "Close article":"مضمون بند کریں","Health articles":"صحت کے مضامین","No articles found.":"کوئی مضمون نہیں ملا۔",
  "Read More":"مزید پڑھیں","Close":"بند کریں","Close Article":"مضمون بند کریں","Updated":"تازہ کاری",
  "Article overview":"مضمون کا خلاصہ","Read full article on Google":"گوگل پر مکمل مضمون پڑھیں",
  "This article is educational and does not replace advice from a qualified clinician.":"یہ مضمون تعلیمی مقصد کے لیے ہے اور مستند معالج کے مشورے کا متبادل نہیں۔",
  "UHS AI Assistant":"یو ایچ ایس اے آئی معاون","Healthcare & platform support":"صحت اور پلیٹ فارم معاونت",
  "Ask about UHS or your health…":"یو ایچ ایس یا اپنی صحت کے بارے میں پوچھیں۔۔۔",
  "Educational guidance only — not a diagnosis or emergency care.":"صرف تعلیمی رہنمائی—یہ تشخیص یا ہنگامی نگہداشت نہیں۔",
  "Close chat":"چیٹ بند کریں","Open UHS AI Assistant":"یو ایچ ایس اے آئی معاون کھولیں","Close UHS AI Assistant":"یو ایچ ایس اے آئی معاون بند کریں",
  "Monday":"پیر","Tuesday":"منگل","Wednesday":"بدھ","Thursday":"جمعرات","Friday":"جمعہ","Saturday":"ہفتہ","Sunday":"اتوار",
  "PENDING":"زیر التوا","APPROVED":"منظور شدہ","COMPLETED":"مکمل","CANCELLED":"منسوخ","REJECTED":"مسترد"
};

const fragments:Record<string,string>={
  "Loading":"لوڈ ہو رہا ہے","Search":"تلاش","Confidence":"اعتماد","Symptoms":"علامات","minutes":"منٹ","minute":"منٹ",
  "Estimated wait":"متوقع انتظار","Queue position":"قطار میں نمبر","Live wait":"موجودہ انتظار","Status":"حالت",
  "Starts in":"شروع ہونے میں","patient ahead":"مریض آگے","patients ahead":"مریض آگے","Queue":"قطار","booked":"بک کیا گیا",
  "with Dr.":"ڈاکٹر کے ساتھ","Dr.":"ڈاکٹر","years":"سال","registered":"رجسٹرڈ","created":"بنایا گیا",
  "No phone":"فون نہیں","Not provided":"فراہم نہیں کیا گیا","None added":"کچھ شامل نہیں","Results":"نتائج"
};

export function translate(value:string){
  const trimmed=value.trim();
  if(!trimmed)return value;
  let translated=urdu[trimmed];
  if(!translated){
    translated=trimmed;
    for(const [english,urduValue] of Object.entries(fragments).sort((a,b)=>b[0].length-a[0].length))
      translated=translated.replace(new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),urduValue);
  }
  return `${value.match(/^\s*/)?.[0]??""}${translated}${value.match(/\s*$/)?.[0]??""}`;
}

export function LanguageProvider({children}:{children:React.ReactNode}){
  const [language,setLanguageState]=useState<Language>(()=>localStorage.getItem("uhs-language")==="ur"?"ur":"en");
  const setLanguage=(next:Language)=>{localStorage.setItem("uhs-language",next);setLanguageState(next)};
  useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==="ur"?"rtl":"ltr"},[language]);
  const value=useMemo(()=>({language,setLanguage}),[language]);
  return <LanguageContext.Provider value={value}><TranslationLayer language={language}/>{children}</LanguageContext.Provider>;
}

function TranslationLayer({language}:{language:Language}){
  const textOriginal=useRef(new WeakMap<Text,string>()).current;
  const attributeOriginal=useRef(new WeakMap<Element,Map<string,string>>()).current;
  useEffect(()=>{
    const processText=(node:Text)=>{
      const current=node.nodeValue??"";
      const stored=textOriginal.get(node);
      if(language==="en"){if(stored!==undefined&&current!==stored)node.nodeValue=stored;return}
      if(stored===undefined)textOriginal.set(node,current);
      else if(current!==stored&&current!==translate(stored))textOriginal.set(node,current);
      const source=textOriginal.get(node)??current,output=translate(source);
      if(node.nodeValue!==output)node.nodeValue=output;
    };
    const processElement=(element:Element)=>{
      for(const name of ["placeholder","aria-label","title"]){
        const current=element.getAttribute(name);if(!current)continue;
        let originals=attributeOriginal.get(element);if(!originals){originals=new Map();attributeOriginal.set(element,originals)}
        const stored=originals.get(name);
        if(language==="en"){if(stored!==undefined&&current!==stored)element.setAttribute(name,stored);continue}
        if(stored===undefined)originals.set(name,current);
        else if(current!==stored&&current!==translate(stored))originals.set(name,current);
        const output=translate(originals.get(name)??current);if(current!==output)element.setAttribute(name,output);
      }
    };
    const process=(root:Node)=>{
      if(root.nodeType===Node.TEXT_NODE){processText(root as Text);return}
      if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
      if(root.nodeType===Node.ELEMENT_NODE)processElement(root as Element);
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
      let node:Node|null;while((node=walker.nextNode()))node.nodeType===Node.TEXT_NODE?processText(node as Text):processElement(node as Element);
    };
    process(document.body);
    const observer=new MutationObserver(records=>records.forEach(record=>{
      if(record.type==="characterData")processText(record.target as Text);
      record.addedNodes.forEach(process);
    }));
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    return()=>observer.disconnect();
  },[language]);
  return null;
}

export function useLanguage(){
  const value=useContext(LanguageContext);
  if(!value)throw new Error("useLanguage must be inside LanguageProvider");
  return value;
}
