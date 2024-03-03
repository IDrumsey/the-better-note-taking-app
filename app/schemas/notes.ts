import { z } from "zod"
import { userIdValidator } from "./gen"

export const noteSelectedWordsRange = z.object({
  startWordIndex: z.number().int().nonnegative(),
  endWordIndex: z.number().int().nonnegative(),
})

export const noteSchema = z.object({
  documentId: z.coerce.number().int().nonnegative(),
  noteColor: z.coerce.string().min(6),
  ranges: z.array(noteSelectedWordsRange).min(1),
})

// the type for note data
export type NoteSchema = z.infer<typeof noteSchema>

export const newNoteTextField = z.object({
  content: z.string().min(1, "Required"),
})

// the types for new text field data
export type TextFieldSchema = z.infer<typeof newNoteTextField>

export const newNoteTextFieldAPISchema = z.object({
  content: newNoteTextField.shape.content.pipe(z.coerce.string()),
})

export const notePopupFormSchema = z.object({
  noteColor: z.string(),
})

export type NotePopupFormSchemaType = z.infer<typeof notePopupFormSchema>
