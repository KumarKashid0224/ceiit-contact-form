import { API_BASE_URL, API_BASE_URL_LEAD } from "@/config";

export interface ContactFormRequest {
  fullName: string;
  mobile: string;
  email?: string;
  courseInterested?: string;
  message?: string;
  tenantId: number;
}

/**
 * Submits the form to the CRM via POST /v1/contact-form (lead generation service).
 * The backend creates the contact, lead, enquiry and follow-up task in one go.
 */
export async function submitContactForm(payload: ContactFormRequest): Promise<void> {
  const res = await fetch(`${API_BASE_URL_LEAD}/v1/contact-form`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json, */*" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as
      | { message?: string; detail?: string; error?: string }
      | null;
    throw new Error(data?.message || data?.detail || data?.error || "Unable to submit the form. Please try again.");
  }
}

/**
 * Loads the tenant's active course names via GET /api/courses/filter (finance service, public).
 * Returns an empty list on failure so the form can fall back to a free-text field.
 */
export async function fetchCourseNames(tenantId: number): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/courses/filter?tenant_id=${tenantId}`, {
      headers: { accept: "application/json, */*" },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    const names = (data as { name?: string; active?: boolean }[])
      .filter((course) => course && course.active !== false)
      .map((course) => (course.name ?? "").trim())
      .filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
