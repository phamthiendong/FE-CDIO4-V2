


export enum Specialty {
  Cardiology = "Cardiology",
  Dermatology = "Dermatology",
  Pediatrics = "Pediatrics",
  Neurology = "Neurology",
  Orthopedics = "Orthopedics",
  Gastroenterology = "Gastroenterology",
  GeneralPractice = "General Practice",
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: Specialty;
  experience: number;
  rating: number;
  imageUrl: string;
  consultationFee: number;
  bio: string;
  education: string[];
  certificateUrl?: string;
  languages: string[];
  reviews: Review[];
  schedule?: string[];
}

export interface SpecialtySuggestion {
  specialty: string;
  reason: string;
  riskLevel: 'Thấp' | 'Trung bình' | 'Cao';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  // Patient Profile fields
  phone?: string;
  address?: string;
  insuranceNumber?: string;
  medicalHistorySummary?: string;
  relatives?: { id: string; name: string; relationship: string; }[];
}

export interface Prescription {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  // SOAP notes
  subjective: string; // What the patient reports
  objective: string; // Doctor's observations
  assessment: string; // Diagnosis, ICD-10 codes
  plan: string; // Treatment plan notes
  
  prescriptions: Prescription[];
  consultationSummary: string; // AI Summary
  date: string;
  attachments?: { name: string; url: string; }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctor: Doctor;
  date: string;
  time: string;
  status: 'Sắp diễn ra' | 'Đã hoàn thành' | 'Đã hủy' | 'Chờ xác nhận' | 'Đã xác nhận';
  type: 'online' | 'offline';
  medicalRecordId?: string;
}

export interface PendingAppointment {
  doctor: Doctor;
  date: string;
  time: string;
  type: 'online' | 'offline';
}

export interface NewDoctorData {
    name: string;
    email: string;
    specialty: Specialty;
    experience: number;
    consultationFee: number;
    bio: string;
    education: string;
    imageUrl: File | null;
    certificate: File | null;
}

export interface KnowledgeBaseItem {
  id: string;
  symptom: string;
  diagnosis: string;
  recommendedSpecialty: Specialty;
  treatmentSuggestion: string;
}

export interface LearningRequest {
  id: string;
  question: string;
  count: number;
  status: 'pending' | 'resolved';
}

export type NotificationType = 'appointment' | 'prescription' | 'followUp' | 'aiResult' | 'human_response' | 'admin_alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export interface Service {
  specialty: Specialty;
  price: number;
}

export interface AiInteractionLog {
  id: string;
  userId: string;
  userQuery: string;
  aiResponse: string;
  humanResponse?: string;
  timestamp: string;
  status: 'answered' | 'needs_human_review';
}

export interface RecentActivity {
  id: string;
  type: 'new_user' | 'new_appointment';
  message: string;
  timestamp: string;
}