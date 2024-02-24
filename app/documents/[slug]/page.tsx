import styles from "./page.module.scss"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import TextContext from "@/components/TextContext"
import { Box, Typography } from "@mui/material"
import { redirect } from "next/navigation"
import { Database } from "@/database.types"
import { NoteSchema, TextFieldSchema } from "@/app/schemas/notes"
import axios from "axios"

type Props = {
  params: { slug: string }
}

const PagePage = async ({ params }: Props) => {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const page = await supabase.from("documents").select().filter("id", "eq", params.slug)

  // get base notes data
  const notes = await supabase.from("notes").select().filter("document_id", "eq", params.slug)

  if (notes.error) {
    redirect("/documents")
  }

  const notesData: Array<{
    note: Database["public"]["Tables"]["notes"]["Row"]
    selectedRanges: Array<Database["public"]["Tables"]["note_selected_ranges"]["Row"]>
  }> = []

  // for each note
  // get note ranges
  for (let i = 0; i < notes.data.length; i++) {
    const note = notes.data.at(i)

    if (!note) {
      redirect("/500")
    }

    const noteRanges = await supabase.from("note_selected_ranges").select().filter("note_id", "eq", note.id)

    if (noteRanges.error) {
      redirect("/500")
    }

    notesData.push({
      note: note,
      selectedRanges: noteRanges.data,
    })
  }

  const hasRequiredData = !!page.data

  if (!hasRequiredData) {
    redirect("/404")
  }

  const documentId = Number(params.slug)

  /**
   * Creates a new note in the database
   *
   * @param data - The data for the new note
   *
   * @returns The newly created note
   */
  const createNewNote = async (
    data: Omit<NoteSchema, "documentId">
  ): Promise<Database["public"]["Tables"]["notes"]["Row"]> => {
    "use server"

    // hit the api route that creates/saves the new notes
    const response = await axios.post(`/api/documents/${documentId}/notes/new`, {
      documentId: documentId,
      ...data,
    })

    if (response.status == 201) {
      // the call to the api route was successful in creating/saving the new note
      // return the new note
      return response.data.data.newNote
    } else {
      // failed to create the new note -> throw
      throw new Error("Failed to create new note")
    }
  }

  /**
   * Updates a note in the database
   *
   * @param data - The data to use when updating the note
   *
   * @returns The updated note
   */
  const updateNote = async (
    noteId: number,
    data: Database["public"]["Tables"]["notes"]["Update"]
  ): Promise<Database["public"]["Tables"]["notes"]["Row"]> => {
    "use server"

    // hit the api route that creates/saves the new notes
    const response = await supabase.from("notes").update(data).eq("id", noteId)

    if (response.status == 204) {
      // successfully updated -> fetch the updated note from the database
      const updatedNoteResult = await supabase.from("notes").select().filter("id", "eq", noteId)
      if (updatedNoteResult.error) {
        throw new Error("Failed to fetch updated note")
      } else {
        return updatedNoteResult.data[0]
      }
    } else {
      throw new Error("Failed to update note")
    }
  }

  /**
   * Create a new text field on a note
   *
   * @param data - The data for the new text field
   * @param noteId - The note the new text field is on
   *
   * @returns The newly created text field
   */
  const createTextField = async (
    data: TextFieldSchema,
    noteId: number
  ): Promise<Database["public"]["Tables"]["note_text_fields"]["Row"]> => {
    "use server"

    const response = await axios.post(`/api/documents/${documentId}/notes/${noteId}/fields/text/new`, data)

    if (response.status == 201) {
      return response.data
    } else {
      throw new Error("Failed to create new text field")
    }
  }

  return (
    <Box padding={4}>
      <Typography variant="h3" marginBottom={4}>
        {page.data?.at(0)?.title}
      </Typography>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <TextContext
          contextText={page.data?.at(0)?.text ?? ""}
          contextNotes={notesData}
          defaultSelectHighlightColor="#eb349830"
          backend={{
            createNewNote: createNewNote,
            createTextField: createTextField,
            updateNote: updateNote,
          }}
        />
      </div>
    </Box>
  )
}

export default PagePage
