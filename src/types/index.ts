export type DepartmentCategory = 'Employment' | 'ASAP' | 'KASE' | 'ITD';

export interface EmployabilityCentrePreset {
  id: string;
  name: string;
  address: string;
  phone1: string;
  phone2?: string;
  email: string;
  district: string;
}

export interface StandardizedSubmission {
  id: string;
  submittedAt: string;
  department: DepartmentCategory;
  centreName: string;
  district: string;
  // Standardized facility metrics
  classrooms: number;
  classroomAreas?: number[]; // Sq ft area of each individual classroom
  classroomAreasFormatted?: string; // Formatted summary e.g. "CR 1: 450 sq ft, CR 2: 500 sq ft"
  computers: number;
  totalAreaSqFt: number; // Total square feet of the space / facility
  // Contact & location details
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

export const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
] as const;

export const DEPARTMENT_METADATA: Record<
  DepartmentCategory,
  {
    name: string;
    fullName: string;
    shortDesc: string;
    badgeColor: string;
    lightBg: string;
  }
> = {
  Employment: {
    name: 'Department of Employment',
    fullName: 'Department of Employment',
    shortDesc: 'Employability Centres & Career Development Centres',
    badgeColor: 'text-[#0e5774]',
    lightBg: 'bg-[#0e5774]/10',
  },
  ASAP: {
    name: 'ASAP',
    fullName: 'Additional Skill Acquisition Programme',
    shortDesc: 'Community Skill Parks & Advanced Skill Training Centres',
    badgeColor: 'text-emerald-700',
    lightBg: 'bg-emerald-50',
  },
  KASE: {
    name: 'KASE',
    fullName: 'Kerala Academy for Skills Excellence',
    shortDesc: 'Centres of Excellence & State Skill Parks',
    badgeColor: 'text-amber-800',
    lightBg: 'bg-amber-50',
  },
  ITD: {
    name: 'ITD',
    fullName: 'Industrial Training Department',
    shortDesc: 'Government Industrial Training Institutes (ITIs)',
    badgeColor: 'text-cyan-800',
    lightBg: 'bg-cyan-50',
  },
};
