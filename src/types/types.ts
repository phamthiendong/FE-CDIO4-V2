// Unified and cleaned TypeScript types for the project

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

// Single, unified User type (merged fields from both versions)
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string; // optional so both UI and backend shapes work
  role?: "patient" | "doctor" | "admin" | "staff";

  // optional patient profile fields
  phone?: string;
  address?: string;
  insuranceNumber?: string;
  medicalHistorySummary?: string;
  relatives?: { id: string; name: string; relationship: string }[];
}

// Full Doctor model used across the app
export interface Doctor {
  id: string;
  userId?: string; // optional if you sometimes reference doctor by userId
  name: string;
  specialty: Specialty | string;
  experience?: number;
  rating?: number;
  imageUrl?: string;
  consultationFee?: number;
  bio?: string;
  education?: string[];
  certificateUrl?: string;
  languages?: string[];
  reviews?: Review[];
  schedule?: string[];
}

// Lightweight doctor shape used in lists/cards (keeps backward compatibility)
export type LightweightDoctor = Pick<
  Doctor,
  "id" | "name" | "specialty" | "reviews"
>;

export interface SpecialtySuggestion {
  specialty: string;
  reason: string;
  riskLevel: "Thấp" | "Trung bình" | "Cao";
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
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: Prescription[];
  consultationSummary?: string;
  date: string;
  attachments?: { name: string; url: string }[];
}

// Combined Appointment type that supports both backend shapes seen in file
export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string; // keep optional if doctor object is used instead
  doctor?: Doctor; // some code expects a full doctor object
  slotId?: string;
  date: string;
  time: string;
  status:
    | "Sắp diễn ra"
    | "Đã hoàn thành"
    | "Đã hủy"
    | "Chờ xác nhận"
    | "Đã xác nhận"
    | "Chờ xác nhận"
    | "Đã xác nhận"
    | "Hoàn thành";
  type: "online" | "offline";
  price?: number;
  medicalRecordId?: string;
}

export interface PendingAppointment {
  doctor: Doctor;
  date: string;
  time: string;
  type: "online" | "offline";
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
  status: "pending" | "resolved";
}

export type NotificationType =
  | "appointment"
  | "prescription"
  | "followUp"
  | "aiResult"
  | "human_response"
  | "admin_alert";

// Unified Notification used by backend + a simpler UI notification alias
export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType | "info" | "warning";
  message: string;
  timestamp?: string;
  read?: boolean;
  relatedId?: string;
}

export interface UiNotification {
  id: string;
  message: string;
  type: "info" | "warning";
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
  status: "answered" | "needs_human_review";
}

export interface RecentActivity {
  id: string;
  type: "new_user" | "new_appointment";
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
  status: "available" | "full" | "cancelled";
  type: "online" | "offline";
}
