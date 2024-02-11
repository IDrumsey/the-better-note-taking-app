import styles from "./page.module.scss"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import TextContext from "@/components/TextContext"
import { Box, Typography } from "@mui/material"
import { redirect } from "next/navigation"

type Props = {
  params: { slug: string }
}

const PagePage = async ({ params }: Props) => {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const page = await supabase.from("pages").select().filter("id", "eq", params.slug)

  const notes = await supabase.from("text_notes").select().filter("document_id", "eq", params.slug)

  const hasRequiredData = !!page.data && !!notes.data

  if (!hasRequiredData) {
    redirect("/404")
  }

  return (
    <Box padding={4}>
      <Typography variant="h3" marginBottom={4}>
        {page.data?.at(0)?.title}
      </Typography>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <TextContext text={page.data?.at(0)?.text ?? ""} documentNotes={notes.data} />
      </div>
    </Box>
  )
}

export default PagePage
