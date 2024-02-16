import { z } from "zod"
import { userIdValidator } from "./gen"

export const noteSelectedWordsRange = z.object({
  startWordIndex: z.number().int().nonnegative(),
  endWordIndex: z.number().int().nonnegative(),
})

export const newNoteAPISchema = z.object({
  documentId: z.coerce.number().int().nonnegative(),
  noteColor: z.coerce.string().min(6),
  ranges: z.array(noteSelectedWordsRange).min(1),
})

export const newNoteTextField = z.object({
  content: z.string().min(1, "Required"),
})

export const newNoteTextFieldAPISchema = z.object({
  content: newNoteTextField.shape.content.pipe(z.coerce.string()),
})

export const notePopupFormSchema = z.object({
  noteColor: z.string(),
})

export type NotePopupFormSchemaType = z.infer<typeof notePopupFormSchema>
