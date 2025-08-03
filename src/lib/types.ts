

import type { TranslationKey } from "@/lib/translations";

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  parent: string;
  parentEmail: string;
  parentPhone: string;
  photo: string;
  medicalConditions?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  previousPreschool: 'yes' | 'no';
  additionalNotes?: string;
  program?: 'preschool' | 'afterschool';
  updatedByParentAt?: any; // For Firestore serverTimestamp
}

export interface LinkedChildInfo {
  id: string;
  name: string;
  program: 'preschool' | 'afterschool';
}

export interface Parent {
  email: string;
  name: string;
  phone: string;
  children: LinkedChildInfo[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  aiHint?: string;
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  createdAt: any; // For Firestore timestamp
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
  createdAt: any; // For Firestore timestamp
  updatedAt?: any; // For Firestore timestamp
  aiHint?: string;
}

export interface Teacher {
  id: string; // This will now be the Firebase Auth UID
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  photo?: string;
  contactNumber?: string;
  homeAddress?: string;
}

export interface Document {
    id: string;
    title: string;
    fileUrl: string;
    createdAt: any;
}

export interface DailyReport {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  mood: 'happy' | 'calm' | 'sad' | 'energetic' | 'tired';
  activities: string;
  meals: string;
  naps: string;
  notes?: string;
  photoUrl?: string;
  createdAt: any; // Firestore timestamp
}

export interface Invoice {
  id: string;
  childId: string;
  parentId: string; // parent email
  childName: string;
  description: string;
  amount: number; // in cents
  status: 'unpaid' | 'paid' | 'pending' | 'cancelled';
  invoiceNumber: string;
  createdAt: any; // Firestore timestamp
  paidAt?: any; // Firestore timestamp
}
