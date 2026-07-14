import { z } from "zod";

export const SCHOOLS = [
  {
    id: "engineering",
    name: "School of Engineering & Technology",
    programs: [{ name: "B.Tech - CSE", duration: 4 }, { name: "B.Tech - Civil Engineering", duration: 4 }, { name: "B.Tech - ECE", duration: 4 }, { name: "B.Tech - Mechanical", duration: 4 }, { name: "M.Tech", duration: 2 }],
  },
  {
    id: "computer_applications",
    name: "School of Computer Applications",
    programs: [{ name: "BCA", duration: 3 }, { name: "MCA", duration: 2 }],
  },
  {
    id: "business",
    name: "Jaipur School of Business",
    programs: [{ name: "BBA", duration: 3 }, { name: "B.Com", duration: 3 }, { name: "MBA", duration: 2 }],
  },
  {
    id: "design",
    name: "Jaipur School of Design",
    programs: [{ name: "B.Des", duration: 4 }, { name: "BVA", duration: 4 }, { name: "M.Des", duration: 2 }, { name: "MVA", duration: 4 }, { name: "M.Sc", duration: 2 }],
  },
  {
    id: "humanities",
    name: "School of Humanities & Social Sciences",
    programs: [{ name: "BA (Hons.)", duration: 3 }, { name: "BA", duration: 3 }, { name: "MA", duration: 2 }],
  },
  {
    id: "economics",
    name: "School of Economics",
    programs: [{ name: "BA (Hons.)", duration: 3 }, { name: "MA", duration: 2 }],
  },
  {
    id: "law",
    name: "School of Law",
    programs: [{ name: "B.A LL.B (Hons.)", duration: 5 }, { name: "B.Sc LL.B (Hons.)", duration: 5 }, { name: "BBA LL.B (Hons.)", duration: 5 }, { name: "LL.M", duration: 2 }],
  },
  {
    id: "hospitality",
    name: "School of Hospitality",
    programs: [{ name: "B.Sc (HHM)", duration: 3 }],
  },
  {
    id: "sciences",
    name: "School of Sciences",
    programs: [{ name: "B.Sc. (Hons.)", duration: 3 }, { name: "M.Sc.", duration: 2 }],
  },
  {
    id: "mass_comm",
    name: "Jaipur School of Mass Communication",
    programs: [{ name: "BA-JMC", duration: 4 }, { name: "MA-JMC", duration: 2 }],
  },
  {
    id: "allied_health",
    name: "School of Allied Health Sciences",
    programs: [{ name: "M.Sc.", duration: 2 }],
  },
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];

export const timeCapsuleSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  enrollmentNumber: z.string().toUpperCase().regex(/^[0-9]{2}[A-Z]{4}[0-9]{4}$/, "Registration number must be in format like 26ABCD1234 (10 characters)"),
  jecrcEmail: z.string().email("Please enter a valid email address").refine(val => val.endsWith("@jecrcu.edu.in"), {
    message: "Email must be a @jecrcu.edu.in domain",
  }),
  personalEmail: z.string().email("Please enter a valid personal email"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  school: z.string().min(1, "Please select your school"),
  program: z.string().min(1, "Please select your program"),
  graduationYear: z.string().min(4, "Please select your graduation year"),
  
  // Reflections
  dream: z.string().min(10, "Please share a bit more about your dream").max(500, "Maximum 500 characters"),
  fear: z.string().min(10, "Please share a bit more about your fear").max(500, "Maximum 500 characters"),
  promise: z.string().min(10, "Make a meaningful promise to yourself").max(500, "Maximum 500 characters"),
  
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy to continue",
  }),
});

export type TimeCapsuleFormData = z.infer<typeof timeCapsuleSchema>;
