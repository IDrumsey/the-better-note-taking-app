"use client"

import { createClient } from "@/utils/supabase/client"
import { Box, Typography } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import { Database } from "@/database.types"
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

  const [currentHighlightIndeces, currentHighlightIndecesSetter] = useState<Array<number>>([])

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

  const onWordPotentialHighlightEvent = useCallback(
    (index: number) => {
      const alreadyHighlighted = currentHighlightIndeces.findIndex((i) => i == index) !== -1

      if (!alreadyHighlighted && highlighting) {
        currentHighlightIndecesSetter((prev) => {
          return [...prev, index]
        })
      }
    },
    [highlighting, currentHighlightIndeces]
  )

  const onWordHover = useCallback(
    (index: number) => {
      onWordPotentialHighlightEvent(index)
    },
    [onWordPotentialHighlightEvent]
  )

  const onWordMouseDown = useCallback(
    (index: number) => {
      onWordPotentialHighlightEvent(index)
    },
    [onWordPotentialHighlightEvent]
  )

  const isWordHighlighted = useCallback(
    (word: WordContext) => {
      return currentHighlightIndeces.findIndex((index) => index == word.index) !== -1
    },
    [currentHighlightIndeces]
  )

  return (
    <Box sx={{ padding: 4 }} width="100%" onMouseDown={onTextMouseDown} onMouseUp={onTextMouseUp}>
      <Typography sx={{ display: "flex", flexWrap: "wrap", rowGap: 1, columnGap: 0.5, userSelect: "none" }}>
        {wordContexts &&
          wordContexts.map((wordContext, i) => (
            <Word
              key={i}
              text={wordContext.text}
              index={wordContext.index}
              onWordHover={onWordHover}
              onWordMouseDown={onWordMouseDown}
              highlighted={isWordHighlighted(wordContext)}
            />
          ))}
      </Typography>
    </Box>
  )
}

export default TextContext
