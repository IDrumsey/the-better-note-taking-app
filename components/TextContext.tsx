"use client"

import { createClient } from "@/utils/supabase/client"
import { Box, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
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
  const [selectingWords, selectingWordsSetter] = useState<boolean>(false)

  const [currentlySelectedWordIndeces, currentlySelectedWordIndecesSetter] = useState<Array<number>>([])

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
    selectingWordsSetter(true)
  }

  const onTextMouseUp = () => {
    selectingWordsSetter(false)
  }

  const onWordPotentialHighlightEvent = useCallback(
    (index: number) => {
      const alreadyHighlighted = currentlySelectedWordIndeces.findIndex((i) => i == index) !== -1

      if (!alreadyHighlighted && selectingWords) {
        currentlySelectedWordIndecesSetter((prev) => {
          return [...prev, index]
        })
      }
    },
    [selectingWords, currentlySelectedWordIndeces]
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

  const getWordNotes = useCallback(
    (index: number): Array<Database["public"]["Tables"]["text_notes"]["Row"]> => {
      if (!myNotes) {
        throw new Error("Notes not received yet")
      } else {
        // get the notes for this word
        const notesWithThisWord: Array<Database["public"]["Tables"]["text_notes"]["Row"]> = myNotes.filter((note) => {
          return index >= note.start_word_index && index <= note.end_word_index
        })

        return notesWithThisWord
      }
    },
    [myNotes]
  )

  const isWordSelected = useCallback(
    (wordIndex: number) => {
      return currentlySelectedWordIndeces.findIndex((index) => index == wordIndex) !== -1
    },
    [currentlySelectedWordIndeces]
  )

  const isWordHighlighted = useCallback(
    (index: number): boolean => {
      const wordIsSelected = isWordSelected(index)

      try {
        const wordNotes: Array<Database["public"]["Tables"]["text_notes"]["Row"]> | undefined = getWordNotes(index)

        return wordIsSelected || wordNotes?.length > 0
      } catch (e) {
        return wordIsSelected
      }
    },
    [isWordSelected, getWordNotes]
  )

  const getWordHighlightColor = useCallback(
    (index: number): string | undefined => {
      // if the word is in the current highlight selection -> that overrules any note highlights
      if (isWordSelected(index)) {
        return "#eb34a536"
      } else {
        // check that the notes have actually been fetched already
        try {
          const notesWithThisWord = getWordNotes(index)

          const hasNotes: boolean = notesWithThisWord.length > 0

          if (!hasNotes) {
            // return default highlight color
            return undefined
          } else {
            // figure out which note color to use
            // just using the last note with a color defined for now
            for (let i = notesWithThisWord.length; i >= 0; i--) {
              if (notesWithThisWord[i - 1].hex_bg_color) {
                return `#${notesWithThisWord[i - 1].hex_bg_color}`
              }
            }

            return undefined
          }
        } catch (e) {
          return undefined
        }
      }
    },
    [myNotes, isWordSelected, getWordNotes]
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
              highlighted={isWordHighlighted(wordContext.index)}
              highlightColor={getWordHighlightColor(wordContext.index)}
            />
          ))}
      </Typography>
    </Box>
  )
}

export default TextContext
