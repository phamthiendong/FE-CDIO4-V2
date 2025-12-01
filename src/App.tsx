import React, { useState, useMemo, useCallback } from "react";
// 1. Import React Router
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import { GoogleGenAI, Chat } from "@google/genai";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { NotificationToast } from "@/components/ui/NotificationToast";
import { StethoscopeIcon } from "@/components/icons/StethoscopeIcon";

// Pages
import { AboutPage } from "@/pages/AboutPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AppointmentsPage } from "@/pages/patient/AppointmentsPage";
import { ChatPage } from "@/pages/consultation/ChatPage";
import { DoctorDashboard } from "@/pages/doctor/DoctorDashboard";
import { DoctorProfileManagementPage } from "@/pages/doctor/DoctorProfileManagementPage";
import { DoctorProfilePage } from "@/pages/doctor/DoctorProfilePage";
import { DoctorScheduleManager } from "@/pages/doctor/DoctorScheduleManager";
import { FindDoctorPage } from "@/pages/FindDoctorPage";
import { HomePage } from "@/pages/HomePage";
import { PatientDashboard } from "@/pages/patient/PatientDashboard";
import { PatientProfilePage } from "@/pages/patient/PatientProfilePage";
import { PostConsultationPage } from "@/pages/consultation/PostConsultationPage";
import { VideoCallPage } from "@/pages/consultation/VideoCallPage";

// Feature Components
import { LoginModal } from "@/features/authentication/components/LoginModal";
import { PaymentModal } from "@/features/booking/components/PaymentModal";
import { AddDoctorModal } from "@/features/doctor/components/AddDoctorModal";
import { DoctorList } from "@/features/doctor/components/DoctorList";
import { ReviewModal } from "@/features/doctor/components/ReviewModal";
import { SpecialtySuggestions } from "@/features/doctor/components/SpecialtySuggestions";
import { KnowledgeBaseModal } from "@/features/consultation/components/KnowledgeBaseModal";
import { ResponseViewModal } from "@/features/consultation/components/ResponseViewModal";
import { SymptomChecker } from "@/features/consultation/components/SymptomChecker";
import { MedicalRecordForm } from "@/features/patient/components/MedicalRecordForm";
import { MedicalRecordViewModal } from "@/features/patient/components/MedicalRecordViewModal";
import { PatientHistoryModal } from "@/features/patient/components/PatientHistoryModal";
import { UserEditModal } from "@/features/patient/components/UserEditModal";

import {
  getIcd10Suggestions,
  getSpecialtySuggestions,
} from "@/services/geminiService";
import {
  INITIAL_DOCTORS,
  USERS,
  APPOINTMENTS as INITIAL_APPOINTMENTS,
  MEDICAL_RECORDS as INITIAL_MEDICAL_RECORDS,
  KNOWLEDGE_BASE as INITIAL_KNOWLEDGE_BASE,
  LEARNING_REQUESTS as INITIAL_LEARNING_REQUESTS,
  NOTIFICATIONS as INITIAL_NOTIFICATIONS,
  SERVICES as INITIAL_SERVICES,
  AI_INTERACTION_LOGS as INITIAL_AI_LOGS,
  ACTIVITIES as INITIAL_ACTIVITIES,
} from "@/constants";
import type {
  SpecialtySuggestion,
  Doctor,
  User,
  Appointment,
  PendingAppointment,
  NewDoctorData,
  KnowledgeBaseItem,
  LearningRequest,
  MedicalRecord,
  Notification,
  Service,
  Specialty,
  AiInteractionLog,
  RecentActivity,
  MedicalHistoryRecord,
} from "@/types/types";

// Init AI
let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export default function App() {
  // KHỞI TẠO NAVIGATE
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState("");
  const [suggestions, setSuggestions] = useState<SpecialtySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(
    INITIAL_MEDICAL_RECORDS
  );
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>(
    INITIAL_KNOWLEDGE_BASE
  );
  const [learningRequests, setLearningRequests] = useState<LearningRequest[]>(
    INITIAL_LEARNING_REQUESTS
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [aiInteractionLogs, setAiInteractionLogs] =
    useState<AiInteractionLog[]>(INITIAL_AI_LOGS);
  const [activities, setActivities] =
    useState<RecentActivity[]>(INITIAL_ACTIVITIES);

  // App flow state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [pendingAppointment, setPendingAppointment] =
    useState<PendingAppointment | null>(null);
  const [appointmentToReview, setAppointmentToReview] =
    useState<Appointment | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [activeAppointment, setActiveAppointment] =
    useState<Appointment | null>(null);
  const [consultationSummary, setConsultationSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [editingKnowledgeItem, setEditingKnowledgeItem] =
    useState<KnowledgeBaseItem | null>(null);
  const [appointmentForRecord, setAppointmentForRecord] =
    useState<Appointment | null>(null);
  const [isPatientHistoryModalOpen, setIsPatientHistoryModalOpen] =
    useState(false);
  const [patientHistory, setPatientHistory] = useState<{
    patient: User;
    records: MedicalRecord[];
  } | null>(null);
  const [recordToView, setRecordToView] = useState<MedicalRecord | null>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [logToView, setLogToView] = useState<AiInteractionLog | null>(null);
  const [callAttachments, setCallAttachments] = useState<
    { name: string; url: string }[]
  >([]);

  const isLoggedIn = !!currentUser;

  // --- QUAN TRỌNG: Hàm lấy thông tin Bác sĩ dùng chung cho mọi trang ---
  // Hàm này đảm bảo các trang Dashboard, Lịch, Profile đều nhận được dữ liệu
  const getCurrentDoctor = useCallback((): Doctor | null => {
    if (!currentUser || currentUser.role !== "doctor") return null;

    // 1. Tìm trong danh sách có sẵn
    const existingDoc = doctors.find((d) => d.userId === currentUser.id);
    if (existingDoc) return existingDoc;

    // 2. Nếu không có (TK từ Backend), tạo object tạm
    // Lấy tên từ firstName + lastName nếu có, hoặc name
    const doctorName = (currentUser as any).firstName
      ? `${(currentUser as any).firstName} ${
          (currentUser as any).lastName || ""
        }`.trim()
      : currentUser.name || "Bác sĩ";

    // Trả về object bác sĩ tạm thời
    return {
      id: `doc-backend-${currentUser.id}`,
      userId: currentUser.id,
      name: doctorName,
      specialty: "Đa khoa",
      experience: 5,
      rating: 5.0,
      imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        doctorName
      )}&background=0D9488&color=fff`,
      consultationFee: 300000,
      bio: "Bác sĩ chuyên khoa.",
      education: ["Đại học Y Dược"],
      languages: ["Tiếng Việt"],
      reviews: [],
      schedule: [], // Lịch trống
    } as Doctor;
  }, [currentUser, doctors]);

  // --- Handlers ---

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms before analyzing.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await getSpecialtySuggestions(symptoms);
      setSuggestions(result);
      if (currentUser) {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          userId: currentUser.id,
          type: "aiResult",
          message: "Kết quả phân tích AI của bạn đã sẵn sàng.",
          timestamp: new Date().toISOString(),
          read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
      }
    } catch (err) {
      setError(
        "Sorry, we encountered an error while analyzing your symptoms. Please try again."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = useCallback(() => {
    if (!ai) {
      setNotification(
        "AI Service not available. Please configure the API key."
      );
      return;
    }
    const newChat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction:
          'You are ClinicAI, a helpful and friendly medical assistant. Provide informative, general-purpose health advice. You are not a substitute for a real doctor. Always advise users to consult with a healthcare professional for diagnosis and treatment. If you do not know the answer to a medical question, respond with "Tôi không chắc về điều này. Tôi sẽ chuyển câu hỏi của bạn đến một chuyên gia để trả lời.".',
      },
    });
    setChatSession(newChat);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    navigate("/doctor-profile");
  };

  const handleBookAppointment = (
    doctor: Doctor,
    slot: { date: string; time: string },
    type: "online" | "offline"
  ) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setPendingAppointment({ doctor, date: slot.date, time: slot.time, type });
  };

  const handleConfirmBooking = () => {
    if (pendingAppointment && currentUser) {
      const newAppointment: Appointment = {
        id: `apt${Date.now()}`,
        patientId: currentUser.id,
        doctor: pendingAppointment.doctor,
        date: pendingAppointment.date,
        time: pendingAppointment.time,
        type: pendingAppointment.type,
        status: "Chờ xác nhận",
      };
      setAppointments((prev) => [...prev, newAppointment]);
      setPendingAppointment(null);
      setNotification(
        `Yêu cầu đặt hẹn với ${pendingAppointment.doctor.name} đã được gửi.`
      );
      navigate("/appointments");

      const newActivity: RecentActivity = {
        id: `act-${Date.now()}`,
        type: "new_appointment",
        message: `${currentUser.name} đã đặt lịch hẹn với ${pendingAppointment.doctor.name}.`,
        timestamp: new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev]);
    }
  };

  const handleSignUp = (name: string, email: string) => {
    const newUser: User = {
      id: `user${Date.now()}`,
      name,
      email,
      role: "patient",
      relatives: [],
      age: 0,
      gender: "Nam",
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoginModalOpen(false);
    setNotification(`Chào mừng, ${name}! Tài khoản của bạn đã được tạo.`);
    navigate("/dashboard");

    const newActivity: RecentActivity = {
      id: `act-${Date.now()}`,
      type: "new_user",
      message: `Người dùng mới "${name}" đã đăng ký.`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleStartConsultation = (appointment: Appointment) => {
    if (
      appointment.status !== "Đã xác nhận" &&
      appointment.status !== "Sắp diễn ra"
    ) {
      setNotification("Lịch hẹn này chưa được bác sĩ xác nhận.");
      return;
    }
    setActiveAppointment(appointment);
    navigate("/video-call");
  };

  const handleFileUploadInCall = (file: { name: string; url: string }) => {
    setCallAttachments((prev) => [...prev, file]);
  };

  const handleEndCall = async (transcript: string) => {
    const updatedAppointment = {
      ...activeAppointment!,
      status: "Đã hoàn thành" as const,
    };
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === activeAppointment?.id ? updatedAppointment : apt
      )
    );

    setIsSummarizing(true);
    const summary = await summarizeTranscript(transcript);
    setConsultationSummary(summary);

    setAppointmentForRecord(updatedAppointment);
    setActiveAppointment(null);

    // Điều hướng dựa trên role
    if (currentUser?.role === "doctor") {
      navigate("/create-record");
    } else {
      navigate("/post-consultation");
    }
  };

  const summarizeTranscript = async (transcript: string): Promise<string> => {
    if (!ai) {
      setNotification("AI Service not available.");
      return "AI service is not configured.";
    }
    const prompt = `You are a medical assistant. Summarize the following consultation transcript... Transcript: "${transcript}"`;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    } catch (err) {
      console.error(err);
      return "Error creating summary.";
    }
  };

  const handleSaveMedicalRecord = (recordData: any) => {
    if (!appointmentForRecord) return;
    const newRecord: MedicalRecord = {
      id: `mr${Date.now()}`,
      appointmentId: appointmentForRecord.id,
      patientId: appointmentForRecord.patientId,
      doctorId: appointmentForRecord.doctor.id,
      date: appointmentForRecord.date,
      attachments: callAttachments,
      ...recordData,
    };

    setMedicalRecords((prev) => [...prev, newRecord]);
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentForRecord.id
          ? { ...apt, medicalRecordId: newRecord.id }
          : apt
      )
    );

    const patientNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: appointmentForRecord.patientId,
      type: "prescription",
      message: `Đơn thuốc và bệnh án từ BS. ${appointmentForRecord.doctor.name} đã sẵn sàng.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [patientNotification, ...prev]);

    setAppointmentForRecord(null);
    setConsultationSummary("");
    setCallAttachments([]);
    setNotification("Hồ sơ bệnh án đã được lưu thành công.");

    if (currentUser?.role === "doctor") {
      navigate("/doctor/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleViewPatientHistory = (patientId: string) => {
    const patient = users.find((u) => u.id === patientId);
    if (patient) {
      const records = medicalRecords.filter((r) => r.patientId === patientId);
      setPatientHistory({ patient, records });
      setIsPatientHistoryModalOpen(true);
    }
  };

  const handleViewMedicalRecord = (recordId: string) => {
    const record = medicalRecords.find((r) => r.id === recordId);
    if (record) setRecordToView(record);
  };

  const handleSubmitReview = (
    appointment: Appointment,
    rating: number,
    comment: string
  ) => {
    const review = {
      id: `rev${Date.now()}`,
      author: currentUser?.name || "Anonymous",
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
    };

    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id === appointment.doctor.id) {
          const updatedReviews = [...doc.reviews, review];
          const newRating =
            updatedReviews.length > 0
              ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) /
                updatedReviews.length
              : rating;
          return { ...doc, reviews: updatedReviews, rating: newRating };
        }
        return doc;
      })
    );
    setAppointmentToReview(null);
    setNotification("Cảm ơn bạn đã đánh giá!");
  };

  const handleAddNewDoctor = (data: NewDoctorData) => {
    const newUser: User = {
      id: `user-doc${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "doctor",
    };
    const newDoctor: Doctor = {
      id: `doc${Date.now()}`,
      userId: newUser.id,
      name: data.name,
      specialty: data.specialty,
      experience: data.experience,
      rating: 5,
      imageUrl: data.imageUrl
        ? URL.createObjectURL(data.imageUrl)
        : "https://picsum.photos/seed/newdoc/200/200",
      consultationFee: data.consultationFee,
      bio: data.bio,
      education: data.education.split("\n"),
      certificateUrl: data.certificate
        ? URL.createObjectURL(data.certificate)
        : undefined,
      languages: ["Vietnamese"],
      reviews: [],
      schedule: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setDoctors((prev) => [...prev, newDoctor]);
    setIsAddDoctorModalOpen(false);
    setNotification(`${newDoctor.name} has been added.`);
  };

  const handleUpdateDoctorProfile = (updatedProfile: Partial<Doctor>) => {
    if (!currentUser) return;
    const doctorToUpdate = doctors.find((d) => d.userId === currentUser.id);
    if (!doctorToUpdate) return;
    const updatedDoctor = { ...doctorToUpdate, ...updatedProfile };
    setDoctors((prev) =>
      prev.map((d) => (d.id === updatedDoctor.id ? updatedDoctor : d))
    );
    setNotification("Hồ sơ đã cập nhật.");
  };

  const handleOpenKnowledgeModal = (item: KnowledgeBaseItem | null) => {
    setEditingKnowledgeItem(item);
    setIsKnowledgeModalOpen(true);
  };
  const handleKnowledgeSubmit = (
    data: Omit<KnowledgeBaseItem, "id">,
    id?: string
  ) => {
    if (id) {
      setKnowledgeBase((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
      setNotification("Kiến thức đã được cập nhật.");
    } else {
      setKnowledgeBase((prev) => [...prev, { id: `kb${Date.now()}`, ...data }]);
      setNotification("Kiến thức mới đã được thêm vào cơ sở tri thức.");
    }
    setIsKnowledgeModalOpen(false);
  };
  const handleDeleteKnowledgeItem = (itemId: string) => {
    if (
      window.confirm("Are you sure you want to delete this knowledge item?")
    ) {
      setKnowledgeBase((prev) => prev.filter((item) => item.id !== itemId));
      setNotification("Kiến thức đã được xóa.");
    }
  };
  const handleResolveLearningRequest = (
    requestId: string,
    question: string
  ) => {
    handleOpenKnowledgeModal({
      id: "",
      symptom: question,
      diagnosis: "",
      recommendedSpecialty: "General Practice" as any,
      treatmentSuggestion: "",
    });
    setLearningRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "resolved" } : req
      )
    );
  };
  const handleUpdateUser = (updatedData: Partial<User> & { id: string }) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedData.id ? { ...u, ...updatedData } : u))
    );
    const doctorToUpdate = doctors.find((d) => d.userId === updatedData.id);
    if (doctorToUpdate && updatedData.name) {
      setDoctors((prev) =>
        prev.map((d) =>
          d.userId === updatedData.id ? { ...d, name: updatedData.name! } : d
        )
      );
    }
    setEditingUser(null);
    setNotification("Thông tin người dùng đã được cập nhật.");
  };
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (
      userToDelete &&
      window.confirm(`Bạn có chắc muốn xóa người dùng ${userToDelete.name}?`)
    ) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (userToDelete.role === "doctor") {
        setDoctors((prev) => prev.filter((d) => d.userId !== userId));
      }
      setNotification(`${userToDelete.name} đã được xóa.`);
    }
  };
  const handleUpdateUserProfile = (updatedProfile: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedProfile };
    setCurrentUser(updatedUser);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedUser : u))
    );
    setNotification("Hồ sơ của bạn đã được cập nhật.");
  };
  const handleConfirmAppointmentByDoctor = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "Đã xác nhận" } : apt
      )
    );
    setNotification("Lịch hẹn đã được xác nhận.");
  };
  const handleCancelAppointmentByDoctor = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: "Đã hủy" } : apt))
      );
      setNotification("Lịch hẹn đã được hủy.");
    }
  };
  const handleUpdateServicePrice = (specialty: Specialty, newPrice: number) => {
    setServices((prev) =>
      prev.map((s) =>
        s.specialty === specialty ? { ...s, price: newPrice } : s
      )
    );
    setDoctors((prev) =>
      prev.map((d) =>
        d.specialty === specialty ? { ...d, consultationFee: newPrice } : d
      )
    );
    setNotification(`Giá cho chuyên khoa ${specialty} đã được cập nhật.`);
  };
  const handleDeleteReview = (docId: string, revId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? { ...doc, reviews: doc.reviews.filter((r) => r.id !== revId) }
            : doc
        )
      );
      setNotification("Đánh giá đã được xóa.");
    }
  };
  const handleLogAiInteraction = (q: string, a: string) => {
    if (!currentUser) return;
    const needsReview = a.includes("Tôi không chắc về điều này");
    setAiInteractionLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        userQuery: q,
        aiResponse: a,
        timestamp: new Date().toISOString(),
        status: needsReview ? "needs_human_review" : "answered",
        userId: currentUser.id,
      },
    ]);
    if (needsReview)
      setNotification("Câu hỏi của bạn đã được chuyển đến chuyên gia.");
  };
  const handleSendHumanResponse = (logId: string, response: string) => {
    const log = aiInteractionLogs.find((l) => l.id === logId);
    if (!log) return;
    setAiInteractionLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, status: "answered", humanResponse: response }
          : l
      )
    );
    const patientNotification: Notification = {
      id: `notif-hr-${Date.now()}`,
      userId: log.userId,
      type: "human_response",
      message: `Một chuyên gia đã trả lời câu hỏi của bạn.`,
      timestamp: new Date().toISOString(),
      read: false,
      relatedId: logId,
    };
    setNotifications((prev) => [patientNotification, ...prev]);
    setNotification("Phản hồi đã được gửi tới người dùng.");
  };
  const handleSendAdminNotification = (doctorId: string, message: string) => {
    const doctorUser = doctors.find((d) => d.id === doctorId)?.userId;
    if (!doctorUser) return;
    const newNotification: Notification = {
      id: `notif-admin-${Date.now()}`,
      userId: doctorUser,
      type: "admin_alert",
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setNotification("Thông báo đã được gửi tới bác sĩ.");
  };

  // Helpers UI
  const suggestedSpecialties = useMemo(
    () => suggestions.map((s) => s.specialty.toLowerCase()),
    [suggestions]
  );
  const filteredDoctors = useMemo(() => {
    if (suggestedSpecialties.length === 0) return [];
    return doctors.filter((doctor) =>
      suggestedSpecialties.includes(doctor.specialty.toLowerCase())
    );
  }, [doctors, suggestedSpecialties]);

  const handleToggleNotificationPanel = () =>
    setIsNotificationPanelOpen((prev) => !prev);
  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    if (notification.type === "human_response" && notification.relatedId) {
      const log = aiInteractionLogs.find(
        (l) => l.id === notification.relatedId
      );
      if (log) {
        setLogToView(log);
        setIsNotificationPanelOpen(false);
      }
    } else if (
      notification.type === "prescription" ||
      notification.type === "appointment"
    ) {
      navigate("/appointments");
      setIsNotificationPanelOpen(false);
    }
  };
  const handleMarkAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadNotificationCount = useMemo(
    () =>
      !currentUser
        ? 0
        : notifications.filter((n) => !n.read && n.userId === currentUser.id)
            .length,
    [notifications, currentUser]
  );
  const userNotifications = useMemo(
    () =>
      !currentUser
        ? []
        : notifications.filter((n) => n.userId === currentUser.id),
    [notifications, currentUser]
  );

  const handleProfileClick = () => {
    if (currentUser?.role === "patient") navigate("/patient-profile");
    else if (currentUser?.role === "doctor")
      navigate("/doctor-profile-management");
  };

  const goHome = useCallback(() => {
    if (currentUser?.role === "admin") navigate("/admin/dashboard");
    else if (currentUser?.role === "doctor") navigate("/doctor/dashboard");
    else if (currentUser?.role === "patient") navigate("/dashboard");
    else navigate("/");
  }, [currentUser, navigate]);

  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleChatClick = () => {
    if (!chatSession) startNewChat();
    navigate("/chat");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Header
        onGoHome={goHome}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
        onAppointmentsClick={() => navigate("/appointments")}
        onChatClick={handleChatClick}
        onAboutClick={() => navigate("/about")}
        onDashboardClick={() => navigate("/admin/dashboard")}
        onScheduleClick={() => navigate("/doctor-schedule")}
        onFindDoctorClick={() => navigate("/find-doctor")}
        onProfileClick={handleProfileClick}
        unreadNotificationCount={unreadNotificationCount}
        onToggleNotificationPanel={handleToggleNotificationPanel}
      />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Routes>
          <Route
            path="/"
            element={<HomePage onStart={() => navigate("/symptoms")} />}
          />

          <Route
            path="/symptoms"
            element={
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <StethoscopeIcon className="w-16 h-16 mx-auto mb-4 text-cyan-600" />
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                    AI-Powered Health Assistant
                  </h1>
                  <p className="mt-4 text-lg text-slate-600">
                    Describe your symptoms for suggestions.
                  </p>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
                  <SymptomChecker
                    symptoms={symptoms}
                    setSymptoms={setSymptoms}
                    onAnalyze={handleAnalyzeSymptoms}
                    isLoading={isLoading}
                  />
                </div>
                {error && (
                  <div className="mt-6 text-center text-red-600 bg-red-100 p-4 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="mt-10">
                  <SpecialtySuggestions
                    suggestions={suggestions}
                    isLoading={isLoading}
                  />
                </div>
                {filteredDoctors.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
                      Recommended Doctors
                    </h2>
                    <DoctorList onSelectDoctor={handleSelectDoctor} />
                  </div>
                )}
              </div>
            }
          />

          <Route
            path="/find-doctor"
            element={<FindDoctorPage onSelectDoctor={handleSelectDoctor} />}
          />

          <Route path="/doctors/:id" element={<DoctorProfilePage />} />

          <Route
            path="/appointments"
            element={
              <AppointmentsPage
                appointments={appointments.filter(
                  (a) => a.patientId === currentUser?.id
                )}
                onStartConsultation={handleStartConsultation}
                onInitiateReview={(apt) => setAppointmentToReview(apt)}
                onViewMedicalRecord={handleViewMedicalRecord}
                doctors={doctors}
                currentUser={currentUser}
              />
            }
          />

          <Route
            path="/chat"
            element={
              chatSession ? (
                <ChatPage
                  chatSession={chatSession}
                  onNewChat={startNewChat}
                  onLogInteraction={handleLogAiInteraction}
                />
              ) : (
                <div />
              )
            }
          />

          <Route
            path="/video-call"
            element={
              activeAppointment && currentUser ? (
                <VideoCallPage
                  appointment={activeAppointment}
                  currentUser={currentUser}
                  patient={
                    users.find((u) => u.id === activeAppointment.patientId) ||
                    null
                  }
                  onEndCall={handleEndCall}
                  onFileUpload={handleFileUploadInCall}
                />
              ) : (
                <p>Error: No active call.</p>
              )
            }
          />

          <Route
            path="/about"
            element={<AboutPage onStart={() => navigate("/symptoms")} />}
          />

          {/* DASHBOARDS */}
          <Route
            path="/dashboard"
            element={
              !currentUser ? (
                <Navigate to="/" />
              ) : (
                <PatientDashboard
                  currentUser={currentUser}
                  appointments={appointments.filter(
                    (a) => a.patientId === currentUser?.id
                  )}
                  notifications={userNotifications}
                  onFindDoctor={() => navigate("/find-doctor")}
                  onViewAppointments={() => navigate("/appointments")}
                />
              )
            }
          />

          {/* --- DOCTOR ROUTES (SỬ DỤNG HÀM getCurrentDoctor CHO MỌI TRANG) --- */}
          <Route
            path="/doctor/dashboard"
            element={(() => {
              const currentDoctorForDash = getCurrentDoctor();
              if (!currentDoctorForDash)
                return (
                  <p className="text-center mt-10">
                    Đang tải thông tin bác sĩ...
                  </p>
                );

              const revenue = appointments
                .filter(
                  (apt) =>
                    apt.doctor.id === currentDoctorForDash?.id &&
                    apt.status === "Đã hoàn thành"
                )
                .reduce((sum, apt) => sum + apt.doctor.consultationFee, 0);

              // Map thêm tên bệnh nhân vào hồ sơ bệnh án để tránh lỗi
              const safeMedicalHistory = medicalRecords.map((record) => {
                const p = users.find((u) => u.id === record.patientId);
                return { ...record, patientName: p ? p.name : "Unknown" };
              });

              return (
                <DoctorDashboard
                  doctor={currentDoctorForDash}
                  appointments={appointments.filter(
                    (a) => a.doctor.id === currentDoctorForDash?.id
                  )}
                  users={users}
                  userNotifications={userNotifications.filter(
                    (n) => n.type === "admin_alert"
                  )}
                  onStartConsultation={handleStartConsultation}
                  onConfirmAppointment={handleConfirmAppointmentByDoctor}
                  onCancelAppointment={handleCancelAppointmentByDoctor}
                  onViewSchedule={() => navigate("/doctor-schedule")}
                  totalRevenue={revenue}
                  medicalHistory={safeMedicalHistory as any}
                />
              );
            })()}
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminDashboard
                users={users}
                appointments={appointments}
                doctors={doctors}
                onInitiateAddDoctor={() => setIsAddDoctorModalOpen(true)}
                knowledgeBase={knowledgeBase}
                learningRequests={learningRequests}
                onOpenKnowledgeModal={handleOpenKnowledgeModal}
                onDeleteKnowledgeItem={handleDeleteKnowledgeItem}
                onResolveLearningRequest={handleResolveLearningRequest}
                onAdminViewPatientHistory={handleViewPatientHistory}
                onInitiateUserEdit={(u) => setEditingUser(u)}
                onDeleteUser={handleDeleteUser}
                services={services}
                onUpdateServicePrice={handleUpdateServicePrice}
                onDeleteReview={handleDeleteReview}
                aiInteractionLogs={aiInteractionLogs}
                onSendHumanResponse={handleSendHumanResponse}
                activities={activities}
                onSendAdminNotification={handleSendAdminNotification}
              />
            }
          />

          {/* Doctor Management Routes - Dùng chung logic getCurrentDoctor */}
          <Route
            path="/doctor-schedule"
            element={
              currentUser && currentUser.role === "doctor" ? (
                <DoctorScheduleManager
                  // QUAN TRỌNG: Truyền User ID (ví dụ: 3) vào đây.
                  // Component bên trong sẽ tự gọi API để tìm ra Doctor ID (ví dụ: 2).
                  currentDoctorId={Number(currentUser.id)}
                  onGoBack={() => navigate("/doctor/dashboard")}
                />
              ) : (
                <div className="text-center mt-10">
                  <p className="text-slate-500">
                    Vui lòng đăng nhập bằng tài khoản Bác sĩ để truy cập.
                  </p>
                </div>
              )
            }
          />

          <Route
            path="/doctor-profile-management"
            element={(() => {
              const doc = getCurrentDoctor();
              if (!doc) return <p>Not found</p>;
              return (
                <DoctorProfileManagementPage
                  doctor={doc}
                  onUpdateProfile={handleUpdateDoctorProfile}
                />
              );
            })()}
          />

          <Route
            path="/patient-profile"
            element={
              currentUser ? (
                <PatientProfilePage
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateUserProfile}
                  appointments={appointments.filter(
                    (a) => a.patientId === currentUser?.id
                  )}
                  onViewMedicalRecord={handleViewMedicalRecord}
                  doctors={doctors}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Consultation Flow Routes */}
          <Route
            path="/create-record"
            element={
              appointmentForRecord && consultationSummary ? (
                <MedicalRecordForm
                  appointment={appointmentForRecord}
                  aiSummary={consultationSummary}
                  isSummarizing={isSummarizing}
                  onSave={handleSaveMedicalRecord}
                  getIcd10Suggestions={getIcd10Suggestions}
                />
              ) : (
                <p>Error: Missing data.</p>
              )
            }
          />

          <Route
            path="/post-consultation"
            element={
              consultationSummary ? (
                <PostConsultationPage
                  summary={consultationSummary}
                  isSummarizing={isSummarizing}
                  onDone={() => navigate("/appointments")}
                />
              ) : (
                <p>Loading...</p>
              )
            }
          />
        </Routes>
      </main>
      <Footer />

      {/* GLOBAL MODALS */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={(user) => {
            setCurrentUser(user);
            setIsLoginModalOpen(false);
            if (user.role === "admin") navigate("/admin/dashboard");
            else if (user.role === "doctor") navigate("/doctor/dashboard");
            else navigate("/dashboard");
          }}
          users={users}
          doctors={doctors}
          onSignUp={handleSignUp}
        />
      )}

      {notification && (
        <NotificationToast
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
      {pendingAppointment && (
        <PaymentModal
          appointment={pendingAppointment}
          onClose={() => setPendingAppointment(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
      {appointmentToReview && (
        <ReviewModal
          appointment={appointmentToReview}
          onClose={() => setAppointmentToReview(null)}
          onSubmit={handleSubmitReview}
        />
      )}
      {isAddDoctorModalOpen && (
        <AddDoctorModal
          onClose={() => setIsAddDoctorModalOpen(false)}
          onSubmit={handleAddNewDoctor}
        />
      )}
      {isKnowledgeModalOpen && (
        <KnowledgeBaseModal
          onClose={() => setIsKnowledgeModalOpen(false)}
          onSubmit={handleKnowledgeSubmit}
          initialData={editingKnowledgeItem}
        />
      )}
      {isPatientHistoryModalOpen && patientHistory && (
        <PatientHistoryModal
          patient={patientHistory.patient}
          records={patientHistory.records}
          onClose={() => setIsPatientHistoryModalOpen(false)}
        />
      )}
      {recordToView && (
        <MedicalRecordViewModal
          record={recordToView}
          doctor={doctors.find((d) => d.id === recordToView.doctorId)}
          onClose={() => setRecordToView(null)}
        />
      )}
      {isLoggedIn && isNotificationPanelOpen && (
        <NotificationPanel
          notifications={userNotifications}
          onClose={() => setIsNotificationPanelOpen(false)}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />
      )}
      {logToView && (
        <ResponseViewModal log={logToView} onClose={() => setLogToView(null)} />
      )}
    </div>
  );
}
