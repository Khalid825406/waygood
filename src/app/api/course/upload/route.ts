import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/lib/models/Course";
import csv from "csv-parser";

export const runtime = "nodejs";

// Helper function to parse comma-separated values
const parseArray = (value: string): string[] => {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

// Helper function to parse Yes/No to boolean
const parseBoolean = (value: string): boolean => {
  if (!value) return false;
  return value.trim().toLowerCase() === 'yes';
};

// Helper function to parse numbers
const parseNumber = (value: string): number | undefined => {
  if (!value || value.trim() === '') return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
};

// Transform CSV row to Course schema format
const transformCourseData = (row: any) => {
  // Trim all values
  const trimmedRow: any = {};
  Object.keys(row).forEach(key => {
    trimmedRow[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
  });
  
  console.log("Raw CSV row keys:", Object.keys(trimmedRow));
  console.log("Sample row data:", trimmedRow);
  
  return {
    uniqueId: trimmedRow["Unique ID"] || trimmedRow["unique id"] || trimmedRow["id"],
    name: trimmedRow["Course Name"] || trimmedRow["course name"] || trimmedRow["name"],
    courseCode: trimmedRow["Course Code"] || trimmedRow["course code"] || "",
    universityCode: trimmedRow["University Code"] || trimmedRow["university code"] || "",
    universityName: trimmedRow["University Name"] || trimmedRow["university name"] || "",
    department: trimmedRow["Department/School"] || trimmedRow["department"] || "",
    discipline: trimmedRow["Discipline/Major"] || trimmedRow["discipline"] || "",
    specialization: trimmedRow["Specialization"] || trimmedRow["specialization"] || "",
    level: trimmedRow["Course Level"] || trimmedRow["level"] || "",
    overview: trimmedRow["Overview/Description"] || trimmedRow["overview"] || "",
    prerequisites: parseArray(trimmedRow["Prerequisites (comma-separated)"] || trimmedRow["prerequisites"] || ""),
    learningOutcomes: parseArray(trimmedRow["Learning Outcomes (comma-separated)"] || trimmedRow["learning outcomes"] || ""),
    credits: parseNumber(trimmedRow["Credits"] || trimmedRow["credits"]),
    durationMonths: parseNumber(trimmedRow["Duration (Months)"] || trimmedRow["duration"]),
    language: trimmedRow["Language of Instruction"] || trimmedRow["language"] || "English",
    tuitionFees: {
      firstYear: parseNumber(trimmedRow["1st Year Tuition Fee"] || trimmedRow["first year tuition fee"]),
      total: parseNumber(trimmedRow["Total Tuition Fee"] || trimmedRow["total tuition fee"]),
      currency: trimmedRow["Tuition Fee Currency"] || trimmedRow["currency"] || "USD",
    },
    applicationFee: {
      amount: parseNumber(trimmedRow["Application Fee Amount"] || trimmedRow["application fee amount"]),
      currency: trimmedRow["Application Fee Currency"] || trimmedRow["application fee currency"] || "USD",
      waived: parseBoolean(trimmedRow["Application Fee Waived (Yes/No)"] || trimmedRow["application fee waived"]),
    },
    admissionRequirements: trimmedRow["Required Application Materials"] || trimmedRow["admission requirements"] || "",
    deadlines: {
      domestic: trimmedRow["Domestic Application Deadline"] || trimmedRow["domestic deadline"] || "",
      international: trimmedRow["International Application Deadline"] || trimmedRow["international deadline"] || "",
    },
  };
};

export async function POST(req: Request) {
  try {
    console.log("=== Starting Course Upload ===");
    
    await connectDB();
    console.log("Database connected");
    
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File received:", file.name, "Size:", file.size, "Type:", file.type);

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("Buffer created, size:", buffer.length);
    
    const results: any[] = [];
    const errors: string[] = [];
    let rowCount = 0;

    const stream = require("stream");
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);

    await new Promise<void>((resolve, reject) => {
      readable
        .pipe(csv())
        .on("data", (data: any) => {
          // Skip empty rows
          if (!data || Object.keys(data).length === 0) return;
          if (Object.values(data).every(val => !val || String(val).trim() === '')) return;
          rowCount++;
          console.log(`Processing row ${rowCount}`);
          
          try {
            const transformed = transformCourseData(data);
            
            // Validate required fields
            if (!transformed.uniqueId || !transformed.name) {
              errors.push(`Row ${rowCount}: Missing required fields (uniqueId or name)`);
              console.error(`Row ${rowCount} validation failed:`, transformed);
              return;
            }
            
            results.push(transformed);
          } catch (err) {
            const errorMsg = `Row ${rowCount}: ${err instanceof Error ? err.message : 'Unknown error'}`;
            errors.push(errorMsg);
            console.error(errorMsg, err);
          }
        })
        .on("end", () => {
          console.log(`CSV parsing complete. Total rows: ${rowCount}, Valid: ${results.length}, Errors: ${errors.length}`);
          resolve();
        })
        .on("error", (err: any) => {
          console.error("CSV parsing error:", err);
          reject(err);
        });
    });

    if (results.length === 0) {
      console.error("No valid data found");
      return NextResponse.json({ 
        error: "No valid data found in CSV",
        details: errors.length > 0 ? errors.slice(0, 5) : ["CSV file appears to be empty or improperly formatted"],
        rowsProcessed: rowCount
      }, { status: 400 });
    }

    console.log(`Attempting to save ${results.length} courses to database`);

    // Use bulkWrite for better error handling
    const bulkOps = results.map(course => ({
      updateOne: {
        filter: { uniqueId: course.uniqueId },
        update: { $set: course },
        upsert: true
      }
    }));

    const result = await Course.bulkWrite(bulkOps);
    
    console.log("Database operation complete:", {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      total: results.length
    });

    return NextResponse.json({ 
      message: "Course data uploaded successfully", 
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      total: results.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    });
  } catch (err) {
    console.error("=== Upload error ===", err);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: err instanceof Error ? err.message : "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.stack : undefined) : undefined
    }, { status: 500 });
  }
}



export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().lean();
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch courses" }, { status: 500 });
  }
}
