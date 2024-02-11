"use client"

import { createClient } from "@/utils/supabase/client"
import { Box, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { Database } from "@/database.types"
import Word from "./Word"
import { useNote } from "@/app/hooks/useNote"
import NewNotePopup from "./new-note/NewNotePopup/NewNotePopup"

type Props = {
  text: string
  documentNotes: Array<Database["public"]["Tables"]["text_notes"]["Row"]>
}

type WordContext = {
  text: string
  highlighting: boolean
  index: number
}

const TextContext = ({ text, documentNotes }: Props) => {
  const supabase = createClient()

  const [wordContexts, wordContextsSetter] = useState<Array<WordContext> | null>(null)

  // track highlighting
  const [selectingWords, selectingWordsSetter] = useState<boolean>(false)

  const [currentlySelectedWordIndeces, currentlySelectedWordIndecesSetter] = useState<Array<number>>([])

  const [lastSelectedWordElement, lastSelectedWordElementSetter] = useState<HTMLSpanElement | null>(null)

  // track note popup
  const noteManager = useNote()

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
    (index: number, targetElement?: HTMLSpanElement) => {
      const alreadyHighlighted = currentlySelectedWordIndeces.findIndex((i) => i == index) !== -1

      if (!alreadyHighlighted && selectingWords) {
        currentlySelectedWordIndecesSetter((prev) => {
          return [...prev, index]
        })

        // track the last selected word
        lastSelectedWordElementSetter(targetElement ?? null)
      }
    },
    [selectingWords, currentlySelectedWordIndeces]
  )

  const onWordHover = useCallback(
    (index: number, targetElement: HTMLSpanElement | undefined) => {
      onWordPotentialHighlightEvent(index, targetElement)
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
      // get the notes for this word
      const notesWithThisWord: Array<Database["public"]["Tables"]["text_notes"]["Row"]> = documentNotes.filter(
        (note) => {
          return index >= note.start_word_index && index <= note.end_word_index
        }
      )

      return notesWithThisWord
    },
    [documentNotes]
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
            return undefined
          } else {
            // figure out which note color to use
            // just using the last note with a color defined for now
            for (let i = notesWithThisWord.length; i >= 0; i--) {
              if (notesWithThisWord[i - 1].hex_bg_color) {
                return `#${notesWithThisWord[i - 1].hex_bg_color}`
              }
            }

            // none of the notes had a color defined
            return undefined
          }
        } catch (e) {
          return undefined
        }
      }
    },
    [documentNotes, isWordSelected, getWordNotes]
  )

  const getNewNotePopoverAnchorElement = useCallback((): Element | null => {
    /**
     * Gets the element that will serve as the anchor for the new note popover element
     */
    // the last word highlighted will be the target element

    return lastSelectedWordElement
  }, [lastSelectedWordElement])

  return (
    <Box width="100%" onMouseDown={onTextMouseDown} onMouseUp={onTextMouseUp}>
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

      {/* new note popover */}
      <NewNotePopup
        popoverProps={{
          open: noteManager.showing,
          onClose: () => noteManager.showingSetter(false),
          anchorEl: getNewNotePopoverAnchorElement(),
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        }}
      />
    </Box>
  )
}

export default TextContext
