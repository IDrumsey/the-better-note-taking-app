import styles from "./page.module.scss"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import TextContext from "@/components/TextContext"
import { Box, Typography } from "@mui/material"
import { redirect } from "next/navigation"
import { Database } from "@/database.types"

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

  return (
    <Box padding={4}>
      <Typography variant="h3" marginBottom={4}>
        {page.data?.at(0)?.title}
      </Typography>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <TextContext documentId={Number(params.slug)} text={page.data?.at(0)?.text ?? ""} documentNotes={notesData} />
      </div>
    </Box>
  )
}

export default PagePage
