import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPublicClient } from "./supabase-public.server";

const submissionSchema = z.object({
  childName: z.string().trim().min(1).max(120),
  eventName: z.string().trim().max(160).optional().or(z.literal("")),
  caption: z.string().trim().max(300).optional().or(z.literal("")),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  consent: z.literal(true, {
    message: "Consent is required to publish your child's photo",
  }),
  imagePath: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .regex(/^[\w./-]+$/, "Invalid image reference"),
});

export const submitRedCarpetPhoto = createServerFn({ method: "POST" })
  .inputValidator((input) => submissionSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { error } = await supabase.from("red_carpet_images").insert({
      child_name: data.childName,
      event_name: data.eventName || null,
      caption: data.caption || null,
      submitted_by_email: data.email || null,
      consent_given: data.consent,
      image_url: data.imagePath,
      status: "pending",
    });
    if (error) throw new Error("Could not submit your photo. Please try again.");
    return { ok: true };
  });
