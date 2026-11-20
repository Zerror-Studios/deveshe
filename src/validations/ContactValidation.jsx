import { z } from "zod";

// Contact form rules, shared by `components/contact/ContactForm.jsx` and
// the shopping assistant's "leave a message" (DD-PRD-001 FR-24), so both
// send `submitContactForm` the same input. No JSX: tests load this file.
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  subject: z.string().min(1, "Topic is required"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 10, {
      message: "Phone number must be exactly 10 digits",
    }),

  message: z.string().min(5, "Message must be at least 5 characters"),
});
