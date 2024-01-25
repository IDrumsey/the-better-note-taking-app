"use client"

import { createClient } from "@/utils/supabase/client"
import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Database } from "@/database.types"
import HighlightedText from "./HighlightedText"

type Props = {
  text: string
}

const TextContext = ({ text }: Props) => {
  const supabase = createClient()

  const [myNotes, myNotesSetter] = useState<Array<
    Database["public"]["Tables"]["text_notes"]["Row"]
  > | null>(null)

  useEffect(() => {
    const fetchMyNotes = async () => {
      const { data, error } = await supabase.from("text_notes").select()

      if (!error) {
        myNotesSetter(data)
      }
    }

    fetchMyNotes()
  }, [])

  return (
    <Box sx={{ padding: 4 }}>
      {myNotes && (
        <HighlightedText
          text={text}
          highlights={myNotes.map((note) => ({
            start_word_index: note.start_word_index,
            end_word_index: note.end_word_index,
            color: note.hex_bg_color,
          }))}
        />
      )}
    </Box>
  )
}

export default TextContext
