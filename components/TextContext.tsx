"use client"

import { createClient } from "@/utils/supabase/client"
import { Box, Typography } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import { Database } from "@/database.types"
import HighlightedText from "./HighlightedText"
import Word from "./Word"

type Props = {
  text: string
}

type WordContext = {
  text: string
  highlighting: boolean
  index: number
}

const TextContext = ({ text }: Props) => {
  const supabase = createClient()

  const [myNotes, myNotesSetter] = useState<Array<Database["public"]["Tables"]["text_notes"]["Row"]> | null>(null)

  const [wordContexts, wordContextsSetter] = useState<Array<WordContext> | null>(null)

  // track highlighting
  const [highlighting, highlightingSetter] = useState<boolean>(false)

  const [highlightStartIndex, highlightStartIndexSetter] = useState<number | null>(null)
  const [currentHighlightMinIndex, currentHighlightMinIndexSetter] = useState<number | null>(null)
  const [currentHighlightMaxIndex, currentHighlightMaxIndexSetter] = useState<number | null>(null)

  // get ref to text element
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // fetch the saved notes
    const fetchMyNotes = async () => {
      const { data, error } = await supabase.from("text_notes").select()

      if (!error) {
        myNotesSetter(data)
      }
    }

    fetchMyNotes()
  }, [])

  // split the text and track the context of each word
  useEffect(() => {
    const words = text.split(" ")
    wordContextsSetter(words.map((word, i) => ({ text: word, index: i, highlighting: false })))
  }, [text])

  const onTextMouseDown = () => {
    highlightingSetter(true)
  }

  const onTextMouseUp = () => {
    highlightingSetter(false)
  }

  const onLetterHover = (index: number) => {
    if (!highlightStartIndex) {
      highlightStartIndexSetter(index)
      currentHighlightMinIndexSetter(index)
      currentHighlightMaxIndexSetter(index)
    } else if (highlightStartIndex) {
      const direction: "left" | "right" = index < highlightStartIndex ? "left" : "right"

      if (direction == "left") {
        currentHighlightMinIndexSetter(index)
      } else {
        currentHighlightMaxIndexSetter(index)
      }
    }
  }

  return (
    <Box sx={{ padding: 4 }} width="100%" onMouseDown={onTextMouseDown} onMouseUp={onTextMouseUp}>
      <Typography sx={{ display: "flex", flexWrap: "wrap", gap: 1, userSelect: "none" }}>
        {wordContexts &&
          wordContexts.map((wordContext, i) => (
            <Word key={i} text={wordContext.text} index={wordContext.index} trackingHighlighting={highlighting} />
          ))}
      </Typography>
    </Box>
  )
}

export default TextContext
