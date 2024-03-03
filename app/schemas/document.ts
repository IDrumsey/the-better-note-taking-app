import { z } from "zod"

export const newDocumentSchema = z.object({
  title: z.string().min(1, "Required"),
  text: z.string().min(1, "Required"),
})

export const newDocumentAPISchema = newDocumentSchema.extend({
  title: newDocumentSchema.shape.title.pipe(z.coerce.string()),
  text: newDocumentSchema.shape.text.pipe(z.coerce.string()),
})
