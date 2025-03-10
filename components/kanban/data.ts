import { Column as ColumnType, Priority, User } from "./types";

export const initialColumns: ColumnType[] = [
  {
    id: "column-todo",
    title: "للقيام",
    tasks: [
      {
        id: "task-1",
        content: "إنشاء صفحة تسجيل الدخول",
        priority: Priority.High,
        dueDate: new Date(),
        description:
          "<p>تنفيذ صفحة تسجيل دخول آمنة مع حقول البريد الإلكتروني وكلمة المرور.</p><ul><li>تصميم واجهة المستخدم</li><li>تنفيذ التحقق من النموذج</li></ul>",
        assignedTo: "user1",
        checklist: [
          { id: "check1", content: "تصميم واجهة المستخدم", isCompleted: false },
          { id: "check2", content: "تنفيذ التحقق من النموذج", isCompleted: false },
        ],
      },
      {
        id: "task-2",
        content: "تصميم مخطط قاعدة البيانات",
        priority: Priority.Low,
        description: "<p>إنشاء مخطط قاعدة بيانات فعال للتطبيق.</p>",
        assignedTo: "user3",
        checklist: [
          { id: "check7", content: "تحديد الكيانات", isCompleted: true },
          { id: "check8", content: "تصميم العلاقات", isCompleted: false },
        ],
      },
      {
        id: "task-5",
        content: "إعداد واجهة برمجية للبحث",
        priority: Priority.Medium,
        description: "<p>تطوير API للبحث في قاعدة البيانات.</p>",
        assignedTo: "user4",
        checklist: [
          { id: "check9", content: "كتابة استعلامات SQL", isCompleted: false },
          { id: "check10", content: "اختبار الأداء", isCompleted: false },
        ],
      },
      {
        id: "task-6",
        content: "تصميم شعار التطبيق",
        priority: Priority.Low,
        description: "<p>إنشاء شعار جذاب للتطبيق.</p>",
        assignedTo: "user5",
        checklist: [],
      },
    ],
    limit: 6,
  },
  {
    id: "in-progress",
    title: "قيد التنفيذ",
    tasks: [
      {
        id: "task-3",
        content: "تنفيذ مصادقة المستخدم",
        priority: Priority.High,
        description:
          "<p>إعداد مصادقة المستخدم باستخدام رموز JWT.</p><ol><li>تنفيذ إنشاء JWT</li><li>إعداد مسارات محمية</li></ol>",
        assignedTo: "user2",
        checklist: [
          { id: "check3", content: "تنفيذ إنشاء JWT", isCompleted: true },
          { id: "check4", content: "إعداد مسارات محمية", isCompleted: false },
        ],
      },
      {
        id: "task-7",
        content: "تطوير واجهة المستخدم لصفحة الملف الشخصي",
        priority: Priority.Medium,
        description: "<p>تصميم وتطوير صفحة الملف الشخصي.</p>",
        assignedTo: "user6",
        checklist: [
          { id: "check11", content: "تصميم الواجهة", isCompleted: true },
          { id: "check12", content: "ربط البيانات", isCompleted: false },
          { id: "check13", content: "اختبار التجاوب", isCompleted: false },
        ],
      },
      {
        id: "task-8",
        content: "إعداد خادم النسخ الاحتياطي",
        priority: Priority.High,
        description: "<p>إعداد نظام نسخ احتياطي تلقائي.</p>",
        assignedTo: "user7",
        checklist: [
          { id: "check14", content: "تكوين الخادم", isCompleted: true },
          { id: "check15", content: "اختبار النسخ", isCompleted: false },
        ],
      },
    ],
    limit: 5,
  },
  {
    id: "review",
    title: "تحت المراجعة",
    tasks: [
      {
        id: "task-9",
        content: "مراجعة كود واجهة المستخدم",
        priority: Priority.Medium,
        description: "<p>مراجعة الكود للتأكد من الجودة.</p>",
        assignedTo: "user8",
        checklist: [
          { id: "check16", content: "فحص الأخطاء", isCompleted: true },
          { id: "check17", content: "تحسين الأداء", isCompleted: false },
        ],
      },
      {
        id: "task-10",
        content: "اختبار التطبيق على الأجهزة المحمولة",
        priority: Priority.High,
        description: "<p>اختبار التطبيق على أجهزة مختلفة.</p>",
        assignedTo: "user9",
        checklist: [
          { id: "check18", content: "اختبار iOS", isCompleted: true },
          { id: "check19", content: "اختبار Android", isCompleted: false },
          { id: "check20", content: "تقرير الأخطاء", isCompleted: false },
        ],
      },
    ],
    limit: 4,
  },
  {
    id: "done",
    title: "منتهي",
    tasks: [
      {
        id: "task-4",
        content: "إعداد المشروع",
        priority: Priority.Low,
        description:
          "<p>تهيئة المشروع وإعداد بيئة التطوير.</p><ul><li>تثبيت التبعيات</li><li>تهيئة عملية البناء</li></ul>",
        checklist: [
          { id: "check5", content: "تثبيت التبعيات", isCompleted: true },
          { id: "check6", content: "تهيئة عملية البناء", isCompleted: true },
        ],
      },
      {
        id: "task-11",
        content: "نشر النسخة الأولية",
        priority: Priority.High,
        description: "<p>نشر النسخة الأولية على الخادم.</p>",
        assignedTo: "user10",
        checklist: [
          { id: "check21", content: "إعداد الخادم", isCompleted: true },
          { id: "check22", content: "اختبار النشر", isCompleted: true },
        ],
      },
      {
        id: "task-12",
        content: "كتابة وثائق المشروع",
        priority: Priority.Low,
        description: "<p>إعداد الوثائق التقنية للمشروع.</p>",
        assignedTo: "user11",
        checklist: [
          { id: "check23", content: "كتابة دليل المستخدم", isCompleted: true },
          { id: "check24", content: "كتابة وثائق API", isCompleted: true },
        ],
      },
      {
        id: "task-13",
        content: "إعداد نظام الإشعارات",
        priority: Priority.Medium,
        description: "<p>تنفيذ إشعارات البريد الإلكتروني.</p>",
        assignedTo: "user12",
        checklist: [
          { id: "check25", content: "تكوين SMTP", isCompleted: true },
          { id: "check26", content: "اختبار الإشعارات", isCompleted: true },
        ],
      },
    ],
    limit: 6,
  },
];

export const users: User[] = [
  { id: "user1", name: "أليس", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user2", name: "بوب", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user3", name: "تشارلي", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user4", name: "ديانا", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user5", name: "إدوارد", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user6", name: "فاطمة", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user7", name: "جورج", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user8", name: "هناء", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user9", name: "إبراهيم", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user10", name: "جميلة", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user11", name: "خالد", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user12", name: "ليلى", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user13", name: "محمد", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user14", name: "نور", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "user15", name: "عمر", avatar: "/placeholder.svg?height=32&width=32" },
];