import type {Doctor,Hospital} from '../types';
// Centralized royalty-free remote placeholders. Replace `image` with backend upload URLs later.
export const imageUrls={
 hero:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
 doctors:[
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'],
 hospitals:['https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80']
};
export const doctors:Doctor[]=[
 {id:1,name:'Dr. Sarah Ahmed',specialty:'Cardiologist',hospital:'UHS Medical Center',experience:14,rating:4.9,reviews:184,image:imageUrls.doctors[0],available:'Today, 4:30 PM',gender:'Female',languages:['English','Urdu']},
 {id:2,name:'Dr. Michael Chen',specialty:'Neurologist',hospital:'Central Care Hospital',experience:11,rating:4.8,reviews:132,image:imageUrls.doctors[1],available:'Tomorrow, 10:00 AM',gender:'Male',languages:['English','Mandarin']},
 {id:3,name:'Dr. Amina Yusuf',specialty:'Pediatrician',hospital:'UHS Children’s Clinic',experience:9,rating:4.9,reviews:206,image:imageUrls.doctors[2],available:'Today, 6:00 PM',gender:'Female',languages:['English','Arabic']},
 {id:4,name:'Dr. James Wilson',specialty:'Orthopedic Surgeon',hospital:'Northside Hospital',experience:18,rating:4.7,reviews:98,image:imageUrls.doctors[3],available:'Wed, 11:30 AM',gender:'Male',languages:['English']}
];
export const hospitals:Hospital[]=[
 {name:'UHS Medical Center',location:'Blue Area, Islamabad',distance:'1.2 km',rating:4.9,emergency:true,image:imageUrls.hospitals[0],departments:['Cardiology','Neurology','Emergency']},
 {name:'Central Care Hospital',location:'Gulberg, Lahore',distance:'3.8 km',rating:4.7,emergency:true,image:imageUrls.hospitals[1],departments:['Pediatrics','Orthopedics','Radiology']}
];
export const articles=[{tag:'Wellness',title:'Small habits that protect your heart',read:'6 min read'},{tag:'Nutrition',title:'A practical guide to balanced eating',read:'8 min read'},{tag:'Mental health',title:'Understanding stress before it builds up',read:'5 min read'}];
