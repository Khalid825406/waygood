export interface University {
  universityName: string;
  uniqueCode: string;
  imageUrl?: string;
  locationCity: string;
  locationCountry: string;
  fullAddress: string;
  establishedYear: number;
  type: 'Public' | 'Private' | 'Other';
  partnerUniversity: boolean;
  description: string;
  longDescription: string;
  officialWebsite: string;
  email: string;
  contactNumber: string;
  applicationFeeWaived: boolean;
  usNewsWorldReport?: number;
  qsRanking?: number;
  theRanking?: number;
  arwuRanking?: number;
  ourRanking?: number;
  fieldsOfStudy: string[];
  programOfferings: string[];
  tuitionFeesMin: number;
  tuitionFeesMax: number;
  tuitionFeesCurrency: string;
  tuitionFeesNotes?: string;
  admissionRequirements: string;
  campusLife: string;
}

export interface Course {
  _id?: string;         
  uniqueId: string;
  courseName: string;
  courseCode: string;
  universityCode: string;
  universityName: string;
  departmentSchool: string;
  disciplineMajor: string;
  specialization?: string;
  courseLevel: 'Undergraduate' | 'Postgraduate' | 'Doctorate' | 'Diploma' | 'Certificate';
  overviewDescription: string;
  summary: string;
  prerequisites: string[];
  learningOutcomes: string[];
  teachingMethodology: string;
  assessmentMethods: string[];
  credits: number;
  durationMonths: number;
  languageOfInstruction: string;
  syllabusUrl?: string;
  keywords: string[];
  professorName?: string;
  professorEmail?: string;
  officeLocation?: string;
  openForIntake?: string;
  admissionOpenYears: string;
  attendanceType: 'Full-time' | 'Part-time' | 'Online';
  firstYearTuitionFee: number;
  totalTuitionFee: number;
  tuitionFeeCurrency: string;
  applicationFeeAmount: number;
  applicationFeeCurrency: string;
  applicationFeeWaived: boolean;
  requiredApplicationMaterials: string;
  twelfthGradeRequirement?: string;
  undergraduateDegreeRequirement?: string;
  minimumIELTSScore?: number;
  minimumTOEFLScore?: number;
  minimumPTEScore?: number;
  minimumDuolingoScore?: number;
  minimumCambridgeEnglishScore?: string;
  otherEnglishTestsAccepted?: string;
  greRequired: boolean;
  greScore?: string;
  gmatRequired: boolean;
  gmatScore?: string;
  satRequired: boolean;
  satScore?: string;
  actRequired: boolean;
  actScore?: string;
  waiverOptions?: string;
  partnerCourse: boolean;
  ftRanking2024?: number;
  acceptanceRate?: number;
  domesticApplicationDeadline: string;
  internationalApplicationDeadline: string;
  courseUrl: string;
}

export interface CourseApiType {
  _id: string;
  uniqueId: string;
  __v?: number;

  name: string;
  overview: string;
  level: string;
  specialization?: string;

  universityCode: string;
  universityName: string;

  department: string;
  discipline: string;
  durationMonths: number;
  credits: number;

  language: string;
  partnerCourse: boolean;

  admissionRequirements: string;

  tuitionFees: {
    amount: number;
    currency: string;
  };

  deadlines?: {
    international?: string;
    domestic?: string;
  };

  applicationFee?: {
    amount?: number;
    currency?: string;
    waived?: boolean;
  };

  gre?: {
    required?: boolean;
    score?: string;
  };

  gmat?: {
    required?: boolean;
    score?: string;
  };

  sat?: {
    required?: boolean;
    score?: string;
  };

  act?: {
    required?: boolean;
    score?: string;
  };

  prerequisites?: string[];
  learningOutcomes?: string[];
  assessmentMethods?: string[];
  keywords?: string[];

  createdAt: string;
  updatedAt: string;
}
