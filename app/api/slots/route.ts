import { NextResponse } from "next/server";
import { getOpenSlots } from "@/lib/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const serviceId = searchParams.get("serviceId") || "";
  const stylistId = searchParams.get("stylistId") || undefined;

  if (!date || !serviceId) {
    return NextResponse.json({ error: "date and serviceId are required" }, { status: 400 });
  }

  const slots = await getOpenSlots({ date, serviceId, stylistId: stylistId || undefined });
  return NextResponse.json({ slots });
}
