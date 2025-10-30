import mongoose, { Schema, Document } from "mongoose";

export interface IUniversity extends Document {
  name: string;
  uniqueCode: string;
  imageUrl?: string;
  location?: {
    city?: string;
    country?: string;
  };
  address?: string;
  establishedYear?: number;
  type?: string;
  partnerUniversity?: boolean;
  description?: string;
  longDescription?: string;
  website?: string;
  email?: string;
  contactNumber?: string;
  applicationFeeWaived?: boolean;

  rankings?: {
    usNews?: number;
    qs?: number;
    the?: number;
    arwu?: number;
    ourRanking?: number;
  };

  fieldsOfStudy?: string[];
  programOfferings?: string[];

  tuitionFees?: {
    min?: number;
    max?: number;
    currency?: string;
    notes?: string;
  };

  admissionRequirements?: string;
  campusLife?: string;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true },
    uniqueCode: { type: String, required: true, unique: true },

    imageUrl: String,

    location: {
      city: String,
      country: String,
    },

    address: String,
    establishedYear: Number,
    type: String,
    partnerUniversity: { type: Boolean, default: false },

    description: String,
    longDescription: String,
    website: String,
    email: String,
    contactNumber: String,

    applicationFeeWaived: { type: Boolean, default: false },

    rankings: {
      usNews: Number,
      qs: Number,
      the: Number,
      arwu: Number,
      ourRanking: Number,
    },

    fieldsOfStudy: [String],
    programOfferings: [String],

    tuitionFees: {
      min: Number,
      max: Number,
      currency: String,
      notes: String,
    },

    admissionRequirements: String,
    campusLife: String,
  },
  { timestamps: true }
);

export const University =
  mongoose.models.University ||
  mongoose.model<IUniversity>("University", UniversitySchema);
