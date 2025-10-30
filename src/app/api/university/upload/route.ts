import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { University } from "@/lib/models/University";
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

// Transform CSV row to University schema format
const transformUniversityData = (row: any) => {
  // Trim all values
  const trimmedRow: any = {};
  Object.keys(row).forEach(key => {
    trimmedRow[key.trim()] = typeof row[key] === 'string' ? row[key].trim() : row[key];
  });
  
  // Log the first row to see what we're receiving
  console.log("Raw CSV row keys:", Object.keys(trimmedRow));
  console.log("Sample row data:", trimmedRow);
  
  return {
    name: trimmedRow["University Name"] || trimmedRow["university name"] || trimmedRow["name"],
    uniqueCode: trimmedRow["Unique Code"] || trimmedRow["unique code"] || trimmedRow["code"],
    imageUrl: trimmedRow["Image URL"] || trimmedRow["image url"] || "",
    location: trimmedRow["Location (City, Country)"] || trimmedRow["location"] || "",
    address: trimmedRow["Full Address"] || trimmedRow["address"] || "",
    establishedYear: parseNumber(trimmedRow["Established Year"] || trimmedRow["established year"]),
    type: trimmedRow["Type"] || trimmedRow["type"] || "",
    partnerUniversity: parseBoolean(trimmedRow["Partner University (Yes/No)"] || trimmedRow["partner university"]),
    description: trimmedRow["Description"] || trimmedRow["description"] || "",
    longDescription: trimmedRow["Long Description"] || trimmedRow["long description"] || "",
    website: trimmedRow["Official Website"] || trimmedRow["website"] || "",
    email: trimmedRow["Email"] || trimmedRow["email"] || "",
    contactNumber: trimmedRow["Contact Number"] || trimmedRow["contact number"] || "",
    applicationFeeWaived: parseBoolean(trimmedRow["Application Fee Waived (Yes/No)"] || trimmedRow["application fee waived"]),
    rankings: {
      usNews: parseNumber(trimmedRow["US News & World Report"] || trimmedRow["us news"]),
      qs: parseNumber(trimmedRow["QS Ranking"] || trimmedRow["qs ranking"]),
      the: parseNumber(trimmedRow["THE (Times Higher Education)"] || trimmedRow["the"]),
      arwu: parseNumber(trimmedRow["ARWU (Shanghai Ranking)"] || trimmedRow["arwu"]),
      ourRanking: parseNumber(trimmedRow["Our Ranking"] || trimmedRow["our ranking"]),
    },
    fieldsOfStudy: parseArray(trimmedRow["Fields of Study (comma-separated)"] || trimmedRow["fields of study"] || ""),
    tuitionFees: {
      min: parseNumber(trimmedRow["Tuition Fees Min"] || trimmedRow["tuition fees min"]),
      max: parseNumber(trimmedRow["Tuition Fees Max"] || trimmedRow["tuition fees max"]),
      currency: trimmedRow["Tuition Fees Currency"] || trimmedRow["tuition fees currency"] || "USD",
      notes: trimmedRow["Tuition Fees Notes"] || trimmedRow["tuition fees notes"] || "",
    },
    admissionRequirements: trimmedRow["Admission Requirements (use \"\" for multiline)"] || trimmedRow["admission requirements"] || "",
    campusLife: trimmedRow["Campus Life (use \"\" for multiline)"] || trimmedRow["campus life"] || "",
  };
};

export async function POST(req: Request) {
  try {
    console.log("=== Starting University Upload ===");
    
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
            const transformed = transformUniversityData(data);
            
            // Validate required fields
            if (!transformed.name || !transformed.uniqueCode) {
              errors.push(`Row ${rowCount}: Missing required fields (name or uniqueCode)`);
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

    console.log(`Attempting to save ${results.length} universities to database`);

    // Use bulkWrite for better error handling and upsert capability
    const bulkOps = results.map(university => ({
      updateOne: {
        filter: { uniqueCode: university.uniqueCode },
        update: { $set: university },
        upsert: true
      }
    }));

    const result = await University.bulkWrite(bulkOps);
    
    console.log("Database operation complete:", {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      total: results.length
    });

    return NextResponse.json({ 
      message: "University data uploaded successfully", 
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
    const university = await University.find().lean();
    return NextResponse.json(university);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}