import type { LeadRow } from "@/lib/database.types";

/** Same sample data as the campaign preview — used for test sends and merge preview */
export const SAMPLE_MERGE_LEAD: LeadRow = {
  id: "00000000-0000-0000-0000-000000000000",
  first_name: "John",
  last_name: "Doe",
  email: "j.doe@techcorp.com",
  phone: "(555) 555-0100",
  company: "TechCorp",
  city: "Los Angeles",
  county: "Los Angeles",
  state: "CA",
  license_number: "DEMO-001",
  email_status: "delivered",
  is_emailed: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};
