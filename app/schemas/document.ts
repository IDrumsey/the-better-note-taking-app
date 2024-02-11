import { z } from "zod"

export const newDocumentSchema = z.object({
  title: z.string().min(1, "Required"),
  text: z.string().min(1, "Required"),
})
