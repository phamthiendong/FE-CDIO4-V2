import type { Doctor, User, Appointment, KnowledgeBaseItem, LearningRequest, MedicalRecord, Notification, Service, AiInteractionLog, RecentActivity } from './types/types';
import { Specialty } from './types/types';

// Helper để lấy ngày trong tương lai
const getFutureDate = (daysToAdd: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
};

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    userId: 'user-doc1',
    name: 'Dr. Evelyn Reed',
    specialty: Specialty.Cardiology,
    experience: 15,
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/doc1/200/200',
    consultationFee: 700000,
    bio: 'Dr. Evelyn Reed is a board-certified cardiologist with over 15 years of experience in treating complex heart conditions. She is dedicated to providing compassionate and comprehensive care.',
    education: ['MD, Harvard Medical School', 'Residency in Internal Medicine, Johns Hopkins Hospital', 'Fellowship in Cardiology, Mayo Clinic'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English'],
    reviews: [
      { id: 'rev1', author: 'An Nguyen', rating: 5, comment: 'Dr. Reed was very thorough and explained everything clearly. Highly recommended.' },
      { id: 'rev2', author: 'Binh Tran', rating: 4.8, comment: 'Excellent doctor, very knowledgeable.' },
    ],
    // ========== SỬA LẠI HOÀN TOÀN PHẦN NÀY ==========
    schedule: [
      { id: 'ts1-1', doctorId: 'doc1', date: getFutureDate(1), startTime: '09:00', endTime: '09:30', maxPatients: 1, bookedCount: 0, status: 'available', type: 'online' },
      { id: 'ts1-2', doctorId: 'doc1', date: getFutureDate(1), startTime: '09:30', endTime: '10:00', maxPatients: 1, bookedCount: 1, status: 'available', type: 'offline' },
      { id: 'ts1-3', doctorId: 'doc1', date: getFutureDate(2), startTime: '14:00', endTime: '14:30', maxPatients: 2, bookedCount: 0, status: 'available', type: 'online' },
    ],
  },
  {
    id: 'doc2',
    userId: 'user-doc2',
    name: 'Dr. Samuel Chen',
    specialty: Specialty.Dermatology,
    experience: 12,
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/doc2/200/200',
    consultationFee: 600000,
    bio: 'Dr. Samuel Chen specializes in both medical and cosmetic dermatology. He is known for his patient-centered approach and expertise in treating skin cancer and acne.',
    education: ['MD, Stanford University School of Medicine', 'Residency in Dermatology, UCSF'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English', 'Mandarin'],
    reviews: [
      { id: 'rev3', author: 'Chi Pham', rating: 5, comment: 'My skin has never looked better! Thank you, Dr. Chen.' },
    ],
    schedule: [
      { id: 'ts2-1', doctorId: 'doc2', date: getFutureDate(1), startTime: '09:00', endTime: '09:30', maxPatients: 1, bookedCount: 0, status: 'available', type: 'offline' },
    ],
  },
  {
    id: 'doc3',
    userId: 'user-doc3',
    name: 'Dr. Maria Garcia',
    specialty: Specialty.Pediatrics,
    experience: 20,
    rating: 5.0,
    imageUrl: 'https://picsum.photos/seed/doc3/200/200',
    consultationFee: 500000,
    bio: 'With 20 years of experience, Dr. Maria Garcia is a beloved pediatrician. She has a wonderful way with children and provides exceptional care from infancy through adolescence.',
    education: ['MD, University of Pennsylvania', 'Residency in Pediatrics, Children\'s Hospital of Philadelphia'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English', 'Spanish'],
    reviews: [
        { id: 'rev4', author: 'Dung Le', rating: 5, comment: 'Dr. Garcia is amazing with kids. She is patient and kind.' },
        { id: 'rev5', author: 'Edison Vu', rating: 5, comment: 'The best pediatrician we have ever had.' },
    ],
    schedule: [], // Bác sĩ này chưa có lịch, để mảng rỗng
  },
  // ... Các bác sĩ khác cũng cần được cập nhật tương tự hoặc để schedule: []
  {
    id: 'doc4',
    userId: 'user-doc4',
    name: 'Dr. Ben Carter',
    specialty: Specialty.Neurology,
    experience: 18,
    rating: 4.7,
    imageUrl: 'https://picsum.photos/seed/doc4/200/200',
    consultationFee: 800000,
    bio: 'Dr. Ben Carter is a leading neurologist, focusing on stroke, epilepsy, and Alzheimer\'s disease. He is involved in cutting-edge research to advance neurological treatments.',
    education: ['MD, PhD, Columbia University', 'Residency in Neurology, NewYork-Presbyterian Hospital'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English'],
    reviews: [],
    schedule: [],
  },
  {
    id: 'doc5',
    userId: 'user-doc5',
    name: 'Dr. Aisha Khan',
    specialty: Specialty.Orthopedics,
    experience: 10,
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/doc5/200/200',
    consultationFee: 650000,
    bio: 'Dr. Aisha Khan is an orthopedic surgeon specializing in sports medicine and joint replacement. She is committed to helping patients regain mobility and return to their active lifestyles.',
    education: ['MD, Duke University School of Medicine', 'Residency in Orthopedic Surgery, Hospital for Special Surgery'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English', 'Urdu'],
    reviews: [
        { id: 'rev6', author: 'Phuong Mai', rating: 5, comment: 'My knee surgery went perfectly. Dr. Khan is a fantastic surgeon.' },
    ],
    schedule: [],
  },
  {
    id: 'doc6',
    userId: 'user-doc6',
    name: 'Dr. Leo Martinez',
    specialty: Specialty.Gastroenterology,
    experience: 14,
    rating: 4.8,
    imageUrl: 'https://picsum.photos/seed/doc6/200/200',
    consultationFee: 600000,
    bio: 'Dr. Leo Martinez is an expert in digestive health, treating conditions like IBS, Crohn\'s disease, and acid reflux. He emphasizes a holistic approach to patient wellness.',
    education: ['MD, University of Chicago', 'Fellowship in Gastroenterology, Cleveland Clinic'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English', 'Spanish'],
    reviews: [],
    schedule: [],
  },
  {
    id: 'doc7',
    userId: 'user-doc7',
    name: 'Dr. Olivia White',
    specialty: Specialty.GeneralPractice,
    experience: 8,
    rating: 4.9,
    imageUrl: 'https://picsum.photos/seed/doc7/200/200',
    consultationFee: 400000,
    bio: 'Dr. Olivia White is a friendly and approachable general practitioner who provides primary care for patients of all ages. She focuses on preventative medicine and building long-term patient relationships.',
    education: ['MD, Georgetown University School of Medicine', 'Residency in Family Medicine, Brown University'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English'],
    reviews: [],
    schedule: [],
  },
   {
    id: 'doc8',
    userId: 'user-doc8',
    name: 'Dr. Kenji Tanaka',
    specialty: Specialty.Cardiology,
    experience: 22,
    rating: 5.0,
    imageUrl: 'https://picsum.photos/seed/doc8/200/200',
    consultationFee: 900000,
    bio: 'Dr. Kenji Tanaka is a highly respected senior cardiologist known for his expertise in interventional cardiology and preventative heart care. He is a frequent speaker at international conferences.',
    education: ['MD, University of Tokyo', 'Fellowship in Interventional Cardiology, Stanford University'],
    certificateUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    languages: ['Vietnamese', 'English', 'Japanese'],
    reviews: [
        { id: 'rev7', author: 'Huy Hoang', rating: 5, comment: 'Dr. Tanaka saved my life. An incredible doctor with immense knowledge.' },
    ],
    schedule: [],
  },
];

// PHẦN CÒN LẠI CỦA FILE GIỮ NGUYÊN
export const USERS: User[] = [
  { 
    id: 'user-patient1', 
    name: 'An Nguyen', 
    email: 'an.nguyen@example.com', 
    role: 'patient',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    insuranceNumber: 'DN4791234567890',
    medicalHistorySummary: 'Tiền sử hen suyễn, dị ứng phấn hoa.',
    relatives: [
      { id: 'rel1', name: 'Binh Tran', relationship: 'Chồng' },
      { id: 'rel2', name: 'Minh Nguyen', relationship: 'Con trai' },
    ]
  },
  { id: 'user-admin1', name: 'Admin ClinicAI', email: 'admin@clinicai.com', role: 'admin' },
  { id: 'user-staff1', name: 'Nhan Vien CSKH', email: 'staff@clinicai.com', role: 'staff' },
  { id: 'user-doc1', name: 'Dr. Evelyn Reed', email: 'evelyn.reed@clinicai.com', role: 'doctor' },
  { id: 'user-doc2', name: 'Dr. Samuel Chen', email: 'samuel.chen@clinicai.com', role: 'doctor' },
  { id: 'user-doc3', name: 'Dr. Maria Garcia', email: 'maria.garcia@clinicai.com', role: 'doctor' },
  { id: 'user-doc4', name: 'Dr. Ben Carter', email: 'ben.carter@clinicai.com', role: 'doctor' },
  { id: 'user-doc5', name: 'Dr. Aisha Khan', email: 'aisha.khan@clinicai.com', role: 'doctor' },
  { id: 'user-doc6', name: 'Dr. Leo Martinez', email: 'leo.martinez@clinicai.com', role: 'doctor' },
  { id: 'user-doc7', name: 'Dr. Olivia White', email: 'olivia.white@clinicai.com', role: 'doctor' },
  { id: 'user-doc8', name: 'Dr. Kenji Tanaka', email: 'kenji.tanaka@clinicai.com', role: 'doctor' },
];

export const APPOINTMENTS: Appointment[] = [
    {
        id: 'apt1',
        patientId: 'user-patient1',
        doctor: INITIAL_DOCTORS[0],
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        time: '10:00',
        status: 'Đã hoàn thành',
        type: 'online',
        medicalRecordId: 'mr1',
    },
    {
        id: 'apt2',
        patientId: 'user-patient1',
        doctor: INITIAL_DOCTORS[2],
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In 2 days
        time: '14:30',
        status: 'Đã xác nhận',
        type: 'online',
    },
    {
        id: 'apt3',
        patientId: 'user-patient1',
        doctor: INITIAL_DOCTORS[1],
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In 3 days
        time: '09:00',
        status: 'Chờ xác nhận',
        type: 'offline',
    },
    {
        id: 'apt4',
        patientId: 'user-patient1',
        doctor: INITIAL_DOCTORS[3], // Dr. Ben Carter
        date: new Date().toISOString().split('T')[0], // Today
        time: '10:00',
        status: 'Đã xác nhận',
        type: 'online',
    },
    {
        id: 'apt5',
        patientId: 'user-patient1',
        doctor: INITIAL_DOCTORS[4], // Dr. Aisha Khan
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        time: '11:00',
        status: 'Chờ xác nhận',
        type: 'offline',
    },
    {
        id: 'apt6',
        patientId: 'user-patient1',
        doctor: INITIAL_DOCTORS[0], // Dr. Evelyn Reed
        date: new Date().toISOString().split('T')[0], // Today
        time: '09:00',
        status: 'Đã hoàn thành',
        type: 'online',
        medicalRecordId: 'mr2',
    },
];

export const MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'mr1',
    appointmentId: 'apt1',
    patientId: 'user-patient1',
    doctorId: 'doc1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    consultationSummary: '**Triệu chứng đã thảo luận**: Đau họng, sốt nhẹ.\n**Chẩn đoán sơ bộ của bác sĩ**: Viêm họng cấp.\n**Các bước tiếp theo được đề xuất**: Nghỉ ngơi, uống nhiều nước, dùng viên ngậm.',
    subjective: 'Bệnh nhân than phiền đau họng 2 ngày nay, kèm sốt nhẹ, mệt mỏi.',
    objective: 'Niêm mạc họng đỏ, amidan sưng to, không có giả mạc. Thân nhiệt 37.8°C.',
    assessment: 'Viêm họng cấp (J02.9)',
    plan: 'Nghỉ ngơi, súc họng nước muối sinh lý. Uống nhiều nước ấm. Theo dõi nhiệt độ.',
    prescriptions: [
      { id: 'presc1', drugName: 'Paracetamol 500mg', dosage: '1 viên', frequency: '3 lần/ngày', duration: '5 ngày' },
      { id: 'presc2', drugName: 'Alpha Choay', dosage: '2 viên', frequency: '2 lần/ngày', duration: '5 ngày' },
    ],
    attachments: [
        { name: 'ket_qua_xet_nghiem.pdf', url: '#' }
    ]
  },
  {
    id: 'mr2',
    appointmentId: 'apt6',
    patientId: 'user-patient1',
    doctorId: 'doc1',
    date: new Date().toISOString().split('T')[0],
    consultationSummary: '**Triệu chứng đã thảo luận**: Tim đập nhanh, hồi hộp.\n**Chẩn đoán sơ bộ của bác sĩ**: Rối loạn nhịp tim.\n**Các bước tiếp theo được đề xuất**: Đo điện tâm đồ (ECG).',
    subjective: 'Bệnh nhân cảm thấy hồi hộp, tim đập nhanh không rõ nguyên nhân trong 1 tuần nay.',
    objective: 'Mạch 110 lần/phút, huyết áp 130/80 mmHg. Tim đều, không có tiếng thổi bất thường.',
    assessment: 'Rối loạn nhịp tim nhanh (I47)',
    plan: 'Yêu cầu bệnh nhân thực hiện ECG. Hạn chế sử dụng chất kích thích. Tái khám sau khi có kết quả ECG.',
    prescriptions: [],
  }
];

export const KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
    { id: 'kb1', symptom: 'Đau đầu, buồn nôn, nhạy cảm ánh sáng', diagnosis: 'Đau nửa đầu (Migraine)', recommendedSpecialty: Specialty.Neurology, treatmentSuggestion: 'Nghỉ ngơi trong phòng tối, yên tĩnh. Uống thuốc giảm đau không kê đơn. Nếu triệu chứng không cải thiện, hãy tham khảo ý kiến bác sĩ.' },
    { id: 'kb2', symptom: 'Phát ban đỏ, ngứa, có vảy', diagnosis: 'Viêm da cơ địa (Eczema)', recommendedSpecialty: Specialty.Dermatology, treatmentSuggestion: 'Giữ ẩm da thường xuyên bằng kem dưỡng không mùi. Tránh các tác nhân gây kích ứng như xà phòng mạnh. Bác sĩ có thể kê toa kem steroid.' },
];

export const LEARNING_REQUESTS: LearningRequest[] = [
    { id: 'lr1', question: 'Tôi bị đau lưng dưới lan xuống chân, đó là bệnh gì?', count: 5, status: 'pending' },
    { id: 'lr2', question: 'Mất ngủ kéo dài có nguy hiểm không?', count: 8, status: 'pending' },
    { id: 'lr3', question: 'Làm sao để giảm triệu chứng trào ngược dạ dày?', count: 3, status: 'resolved' },
];

export const NOTIFICATIONS: Notification[] = [
    {
        id: 'notif1',
        userId: 'user-patient1',
        type: 'appointment',
        message: "Bạn có lịch hẹn với BS. Maria Garcia vào ngày mai lúc 14:30.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        read: false,
    },
    {
        id: 'notif2',
        userId: 'user-patient1',
        type: 'followUp',
        message: "Đã đến lúc tái khám với BS. Evelyn Reed.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        read: true,
    }
];

export const SERVICES: Service[] = [
  { specialty: Specialty.Cardiology, price: 700000 },
  { specialty: Specialty.Dermatology, price: 600000 },
  { specialty: Specialty.Pediatrics, price: 500000 },
  { specialty: Specialty.Neurology, price: 800000 },
  { specialty: Specialty.Orthopedics, price: 650000 },
  { specialty: Specialty.Gastroenterology, price: 600000 },
  { specialty: Specialty.GeneralPractice, price: 400000 },
];

export const AI_INTERACTION_LOGS: AiInteractionLog[] = [
  {
    id: 'ai-log-1',
    userId: 'user-patient1',
    userQuery: 'Làm thế nào để phân biệt giữa cảm lạnh và cúm?',
    aiResponse: 'Cả cảm lạnh và cúm đều là bệnh về đường hô hấp nhưng do các loại virus khác nhau gây ra. Cúm thường nghiêm trọng hơn, với các triệu chứng như sốt cao, đau nhức cơ thể và mệt mỏi cực độ, trong khi cảm lạnh thường chỉ có sổ mũi và đau họng.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'answered',
  },
  {
    id: 'ai-log-2',
    userId: 'user-patient1',
    userQuery: 'Tôi bị nổi mẩn đỏ ở tay sau khi đi bộ trong rừng, đó có phải là do cây thường xuân độc không?',
    aiResponse: 'Tôi không chắc về điều này. Tôi sẽ chuyển câu hỏi của bạn đến một chuyên gia để trả lời.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'needs_human_review',
  }
];

export const ACTIVITIES: RecentActivity[] = [
    { id: 'act1', type: 'new_appointment', message: 'An Nguyen đã đặt lịch hẹn với Dr. Samuel Chen.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: 'act2', type: 'new_user', message: 'Người dùng mới "Binh Tran" đã đăng ký.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
];