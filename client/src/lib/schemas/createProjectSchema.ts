import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be 100 characters or fewer" }),
  description: z
    .string({ message: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters" })
    .max(2000, { message: "Description must be 2000 characters or fewer" }),
  displayOrder: z.coerce
    .number({ message: "Display order must be a number" })
    .int({ message: "Display order must be a whole number" }),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
