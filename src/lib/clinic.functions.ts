import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicClient } from "./supabase-public.server";

const appointmentSchema = z.object({
  parentName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(9)
    .max(20)
    .regex(/^[+\d][\d\s-]*$/, "Enter a valid phone number"),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  childName: z.string().trim().min(1).max(120),
  childAge: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().trim().min(2).max(160),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
    .refine((d) => {
      const date = new Date(`${d}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date.getTime() >= today.getTime();
    }, "Please choose a date in the future"),
  preferredTime: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(800).optional().or(z.literal("")),
});

export const requestAppointment = createServerFn({ method: "POST" })
  .inputValidator((input) => appointmentSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { error } = await supabase.from("appointments").insert({
      parent_name: data.parentName,
      phone: data.phone,
      email: data.email || null,
      child_name: data.childName,
      child_age: data.childAge || null,
      service: data.service,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime || null,
      message: data.message || null,
    });
    if (error) throw new Error("Could not send your request. Please try again or call us.");
    return { ok: true };
  });
