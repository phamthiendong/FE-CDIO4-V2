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

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: 'patient' | 'doctor' | 'admin' | 'staff';
  phone?: string;
  address?: string;
  insuranceNumber?: string;
  medicalHistorySummary?: string;
  relatives?: { id: string; name: string; relationship: string; }[];
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: Specialty | string;
  experience: number;
  rating: number;
  imageUrl: string;
  consultationFee: number; 
  bio: string;
  education: string[];
  certificateUrl?: string;
  languages: string[];
  reviews: Review[];       
  schedule: TimeSlot[];  
}

export type LightweightDoctor = Pick<Doctor, 'id' | 'name' | 'specialty' | 'reviews'>;

export interface SpecialtySuggestion {
  specialty: string;
  reason: string;
  riskLevel: 'Thấp' | 'Trung bình' | 'Cao';
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
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: Prescription[];
  consultationSummary?: string;
  date: string;
  attachments?: { name: string; url: string; }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string; 
  doctor?: Doctor;
  slotId?: string;
  date: string;
  time: string;
  status: 'Sắp diễn ra' | 'Đã hoàn thành' | 'Đã hủy' | 'Chờ xác nhận' | 'Đã xác nhận' | 'Hoàn thành';
  type: 'online' | 'offline';
  price?: number;
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
  specialty: Specialty | string;
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
  recommendedSpecialty: Specialty | string;
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
  userId?: string;
  type: NotificationType | 'info' | 'warning';
  message: string;
  timestamp?: string;
  read?: boolean;
  relatedId?: string;
}

export interface UiNotification {
  id: string;
  message: string;
  type: 'info' | 'warning';
}

export interface Service {
  specialty: Specialty | string;
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

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxPatients: number;
  bookedCount: number;
  status: 'available' | 'full' | 'cancelled';
  type: 'online' | 'offline';
}