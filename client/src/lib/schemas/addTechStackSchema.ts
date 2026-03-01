import { z } from "zod";
import { requiredString } from "../util/util";

export const addTechStackSchema = z.object({
  name: requiredString("Name"),
  category: requiredString("Category"),
});

export type AddTechStackSchema = z.infer<typeof addTechStackSchema>;
