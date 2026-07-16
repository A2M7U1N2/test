// شكل بيانات المادة الواحدة جوه الترم
export interface Subject {
  id: string;
  name: string;
  grade: string;       // الحرف (A, B+, C...) 
  gradePoint: number;   // القيمة الرقمية المقابلة للحرف (4.0, 3.7...)
  credits: number;
}

// شكل بيانات الترم الواحد
export interface Semester {
  id: string;
  name: string;          // مثلاً "Term 3"
  completed: boolean;
  subjects: Subject[];
}

// شكل بيانات البروفايل الشخصي
export interface Profile {
  university: string;
  faculty: string;
  department: string;
  academicYear: string;
}

// شكل بيانات المحاضرة المتكررة أسبوعياً
export interface ClassSession {
  id: string;
  semesterId: string;
  subjectId: string;
  subjectName: string;   // بنجيبه من جدول subjects عشان العرض
  dayOfWeek: number;     // 0 = الأحد ... 6 = السبت
  startTime: string;
  endTime: string;
  location: string;
  sessionType: "Lecture" | "Section" | "Lab";
  semesterEndDate: string | null;
}

// شكل بيانات الحدث (كويز، تسليم، ميدترم، فاينل)
export interface AcademicEvent {
  id: string;
  semesterId: string;
  subjectId: string;
  subjectName: string;
  title: string;
  eventType: "Quiz" | "Assignment" | "Midterm" | "Final";
  eventDate: string;
  eventTime: string | null;
}