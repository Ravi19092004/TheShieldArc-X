import { NextResponse } from "next/server";

export async function GET() {
  // In a real application, you would fetch this data from your database
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
    phishing: [30, 45, 60, 55, 70, 50, 65],
    safe: [100, 90, 85, 95, 80, 88, 92],
  };

  return NextResponse.json(data);
}
