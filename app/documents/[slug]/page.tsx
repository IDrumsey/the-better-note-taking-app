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

  console.log("notes : ", notes.data)

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
          documentId={documentId}
        />
      </div>
    </Box>
  )
}

export default PagePage
