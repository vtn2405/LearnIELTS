import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { readFile } from "fs/promises";
import path from "path";

// Map unit numbers to file names
const UNIT_FILES: Record<string, string> = {
  "1": "unit-01-simple-present.json",
  "2": "unit-02-present-continuous.json",
  "3": "unit-03-simple-past.json",
  "4": "unit-04-past-continuous.json",
  "5": "unit-05-present-perfect.json",
  "6": "unit-06-past-perfect.json",
  "7": "unit-07-future-will-going-to.json",
  "8": "unit-08-modal-can-could.json",
  "9": "unit-09-modal-may-might.json",
  "10": "unit-10-passive-voice.json",
  "11": "unit-11-conditional-type-1.json",
  "12": "unit-12-conditional-type-2.json",
  "13": "unit-13-conditional-type-3.json",
  "14": "unit-14-relative-clauses.json",
  "15": "unit-15-reported-speech.json",
  "16": "unit-16-cleft-sentences.json",
};

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unit = searchParams.get("unit");

  if (!unit || !UNIT_FILES[unit]) {
    return NextResponse.json(
      { error: "Invalid unit. Valid units: 1-16" },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), "data", "speed-drill", UNIT_FILES[unit]);
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error loading speed-drill unit ${unit}:`, error);
    return NextResponse.json(
      { error: `Failed to load unit ${unit}` },
      { status: 500 }
    );
  }
}
