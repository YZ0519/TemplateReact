import { z } from "zod";
import { requiredString } from "../util/util";

export const addFeatureSchema = z.object({
  description: requiredString("Description"),
  displayOrder: z.coerce
    .number({ message: "Display order must be a number" })
    .int({ message: "Display order must be a whole number" }),
});

export type AddFeatureSchema = z.infer<typeof addFeatureSchema>;
