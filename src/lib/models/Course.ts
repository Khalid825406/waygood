import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  uniqueId: string;
  courseCode: string;
  name: string;
  universityCode: string;
  universityName: string;
  department?: string;
  discipline?: string;
  specialization?: string;
  level?: string;
  overview?: string;
  summary?: string;
  prerequisites?: string[];
  learningOutcomes?: string[];
  teachingMethodology?: string;
  assessmentMethods?: string[];
  credits?: number;
  durationMonths?: number;
  language?: string;
  syllabusUrl?: string;
  keywords?: string[];
  professorName?: string;
  professorEmail?: string;
  officeLocation?: string;

  openForIntake?: string;
  admissionOpenYears?: string;
  attendanceType?: string;

  tuitionFees?: {
    firstYear?: number;
    total?: number;
    currency?: string;
  };

  applicationFee?: {
    amount?: number;
    currency?: string;
    waived?: boolean;
  };

  admissionRequirements?: string;
  grade12Requirement?: string;
  undergraduateRequirement?: string;

  englishRequirements?: {
    ielts?: number;
    toefl?: number;
    pte?: number;
    duolingo?: number;
    cambridge?: number;
    otherTests?: string;
  };

  gre?: { required: boolean; score?: number };
  gmat?: { required: boolean; score?: number };
  sat?: { required: boolean; score?: number };
  act?: { required: boolean; score?: number };

  waiverOptions?: string;
  partnerCourse?: boolean;
  ftRanking2024?: number;
  acceptanceRate?: number;

  deadlines?: {
    domestic?: string;
    international?: string;
  };

  courseUrl?: string;
}

const CourseSchema = new Schema<ICourse>(
  {
    uniqueId: { type: String, required: true, unique: true },
    courseCode: { type: String, required: true },
    name: { type: String, required: true },
    universityCode: { type: String, required: true },
    universityName: { type: String, required: true },

    department: String,
    discipline: String,
    specialization: String,
    level: String,
    overview: String,
    summary: String,
    prerequisites: [String],
    learningOutcomes: [String],
    teachingMethodology: String,
    assessmentMethods: [String],
    credits: Number,
    durationMonths: Number,
    language: String,
    syllabusUrl: String,
    keywords: [String],
    professorName: String,
    professorEmail: String,
    officeLocation: String,

    openForIntake: String,
    admissionOpenYears: String,
    attendanceType: String,

    tuitionFees: {
      firstYear: Number,
      total: Number,
      currency: String,
    },

    applicationFee: {
      amount: Number,
      currency: String,
      waived: { type: Boolean, default: false },
    },

    admissionRequirements: String,
    grade12Requirement: String,
    undergraduateRequirement: String,

    englishRequirements: {
      ielts: Number,
      toefl: Number,
      pte: Number,
      duolingo: Number,
      cambridge: Number,
      otherTests: String,
    },

    gre: {
      required: { type: Boolean, default: false },
      score: Number,
    },
    gmat: {
      required: { type: Boolean, default: false },
      score: Number,
    },
    sat: {
      required: { type: Boolean, default: false },
      score: Number,
    },
    act: {
      required: { type: Boolean, default: false },
      score: Number,
    },

    waiverOptions: String,
    partnerCourse: { type: Boolean, default: false },
    ftRanking2024: Number,
    acceptanceRate: Number,

    deadlines: {
      domestic: String,
      international: String,
    },

    courseUrl: String,
  },
  { timestamps: true }
);

CourseSchema.index({
  name: 'text',
  universityName: 'text',
  overview: 'text',
  summary: 'text',
  discipline: 'text',
  specialization: 'text',
  keywords: 'text',
});
export const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);