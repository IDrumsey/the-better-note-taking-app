"use client"

import { Box, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { Database } from "@/database.types"
import Word from "./Word"
import { useNote } from "@/app/hooks/useNote"
import NotePopup from "./new-note/NewNotePopup/NewNotePopup"
import { NotePopupFormSchemaType, newNoteTextField, notePopupFormSchema } from "@/app/schemas/notes"
import { z } from "zod"
import axios from "axios"
import { createClient } from "@/utils/supabase/client"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { colorToAlphaHex } from "@/app/utility/gen"

type Props = {
  text: string
  documentNotes: Array<{
    note: Database["public"]["Tables"]["notes"]["Row"]
    selectedRanges: Array<Database["public"]["Tables"]["note_selected_ranges"]["Row"]>
  }>
  documentId: number
}

type WordContext = {
  text: string
  highlighting: boolean
  index: number
}

const NEW_NOTE_DEFAULT_HIGHLIGHT_COLOR = "#eb349830"

type NewTextFieldSchema = z.infer<typeof newNoteTextField>

const TextContext = ({ text, documentNotes, documentId }: Props) => {
  const router = useRouter()

  const notePopupFormMethods = useForm<NotePopupFormSchemaType>({
    resolver: zodResolver(notePopupFormSchema),
    defaultValues: {
      noteColor: NEW_NOTE_DEFAULT_HIGHLIGHT_COLOR,
    },
  })

  const [wordContexts, wordContextsSetter] = useState<Array<WordContext> | null>(null)

  // track highlighting
  const [selectingWords, selectingWordsSetter] = useState<boolean>(false)

  const [currentlySelectedWordIndeces, currentlySelectedWordIndecesSetter] = useState<Array<number>>([])

  const [lastSelectedWordElement, lastSelectedWordElementSetter] = useState<HTMLSpanElement | null>(null)

  const [newNote, newNoteSetter] = useState<Database["public"]["Tables"]["notes"]["Row"] | null>(null)

  const supabase = createClient()

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
    (index: number): Array<Database["public"]["Tables"]["notes"]["Row"]> => {
      /**
       * Get all the notes that have this word in it
       */

      const notesWithThisWord: Array<{
        note: Database["public"]["Tables"]["notes"]["Row"]
        selectedRanges: Array<Database["public"]["Tables"]["note_selected_ranges"]["Row"]>
      }> = documentNotes.filter((note) => {
        // for each range, check if the word is in that range
        for (let i = 0; i < note.selectedRanges.length; i++) {
          const range = note.selectedRanges.at(i)

          if (!range) continue

          if (index >= range.start_word_index && index <= range.end_word_index) return true
        }

        return false
      })

      return notesWithThisWord.map((note) => note.note)
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
        const wordNotes: Array<Database["public"]["Tables"]["notes"]["Row"]> | undefined = getWordNotes(index)

        return wordIsSelected || wordNotes?.length > 0
      } catch (e) {
        return wordIsSelected
      }
    },
    [isWordSelected, getWordNotes]
  )

  const getWordHighlightColor = useCallback(
    (index: number): string | undefined => {
      const notesWithThisWord = getWordNotes(index)

      if (newNote && notesWithThisWord.filter((note) => note.id == newNote.id).length > 0) {
        // this is a word in the new note
        return newNote.hex_bg_color
      }

      // if the word is in the current highlight selection -> that overrules any note highlights
      if (isWordSelected(index)) {
        return NEW_NOTE_DEFAULT_HIGHLIGHT_COLOR
      } else {
        // check that the notes have actually been fetched already
        try {
          const hasNotes: boolean = notesWithThisWord.length > 0

          if (!hasNotes) {
            return undefined
          } else {
            // figure out which note color to use
            // just using the last note with a color defined for now
            for (let i = notesWithThisWord.length; i >= 0; i--) {
              if (notesWithThisWord[i - 1].hex_bg_color) {
                return `${notesWithThisWord[i - 1].hex_bg_color}`
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
    [documentNotes, isWordSelected, getWordNotes, newNote]
  )

  const getNewNotePopoverAnchorElement = useCallback((): Element | null => {
    /**
     * Gets the element that will serve as the anchor for the new note popover element
     */
    // the last word highlighted will be the target element

    return lastSelectedWordElement
  }, [lastSelectedWordElement])

  const getSelectedWordRanges = useCallback((): Array<[number, number]> => {
    const ranges: Array<[number, number]> = []

    const selectedWordIndecesAsc = [...currentlySelectedWordIndeces]
    selectedWordIndecesAsc.sort((a, b) => a - b)

    let startIndex = 0
    let endIndex = 0

    for (let i = 1; i <= selectedWordIndecesAsc.length - 1; i++) {
      if (selectedWordIndecesAsc[i] === selectedWordIndecesAsc[i - 1] + 1) {
        endIndex = i
      } else {
        ranges.push([selectedWordIndecesAsc[startIndex], selectedWordIndecesAsc[endIndex]])
        startIndex = i
        endIndex = i + 1
      }
    }

    if (selectedWordIndecesAsc[startIndex] && selectedWordIndecesAsc[endIndex]) {
      ranges.push([selectedWordIndecesAsc[startIndex], selectedWordIndecesAsc[endIndex]])
    }
    return ranges
  }, [currentlySelectedWordIndeces])

  const createNewNote = useCallback(async (): Promise<Database["public"]["Tables"]["notes"]["Row"]> => {
    // get all the ranges for the selected words.
    const selectedRanges = getSelectedWordRanges().map((range) => {
      return {
        startWordIndex: range[0],
        endWordIndex: range[1],
      }
    })

    // get the start index of all the
    const response = await axios.post(`/api/documents/${documentId}/notes/new`, {
      documentId: documentId,
      ranges: selectedRanges,
      noteColor: colorToAlphaHex(NEW_NOTE_DEFAULT_HIGHLIGHT_COLOR),
    })

    if (response.status == 201) {
      return response.data.data.newNote
    } else {
      throw new Error("Failed to create new note")
    }
  }, [documentId, getSelectedWordRanges])

  const onNewTextFieldSubmit = useCallback(
    async (data: NewTextFieldSchema, noteId: number | undefined) => {
      let noteToAddThisNewTextFieldTo = noteId

      if (!noteId) {
        // create the new note stuff
        try {
          const newNote = await createNewNote()
          router.refresh()
          newNoteSetter(newNote)
          noteToAddThisNewTextFieldTo = newNote.id
        } catch (e) {
          alert("failed to add note")
          // TODO: Failed to add new note -> show error notification
          return
        }
      }

      // check if this field is on an existing note or
      axios.post(`/api/documents/${documentId}/notes/${noteToAddThisNewTextFieldTo}/fields/text/new`, data)
    },
    [documentId, createNewNote]
  )

  const handleNotePopupColorChange = useCallback(
    async (color: string, noteId: number | undefined) => {
      // if the new note isn't defined yet, you have to create the note
      let noteToChangeColorOnId = noteId && newNote ? noteId : (await createNewNote()).id

      // update the note in the db to reflect the new color
      const result = await supabase
        .from("notes")
        .update({
          hex_bg_color: colorToAlphaHex(color),
        })
        .eq("id", noteToChangeColorOnId)

      if (result.status == 204) {
        const updatedNoteResult = await supabase.from("notes").select().filter("id", "eq", noteToChangeColorOnId)
        if (updatedNoteResult.error) {
          // TODO: failed to fetch the updated result -> add better notification
          alert("Failed to fetch the updated result. refresh page.")
        } else {
          if (updatedNoteResult.data) {
            newNoteSetter(updatedNoteResult.data[0])
            router.refresh()
          }
        }
      }
    },
    [newNote, createNewNote]
  )

  useEffect(() => {
    const sub = notePopupFormMethods.watch((data, { name, type }) => {
      if (data.noteColor && name == "noteColor" && type == "change") {
        handleNotePopupColorChange(data.noteColor, newNote?.id ?? undefined)
      }
    })

    return () => sub.unsubscribe()
  }, [notePopupFormMethods.watch, handleNotePopupColorChange])

  const onNewNotePopoverClose = () => {
    newNoteSetter(null)
    noteManager.showingSetter(false)
  }

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
      <FormProvider {...notePopupFormMethods}>
        <NotePopup
          noteId={newNote?.id ?? undefined}
          popoverProps={{
            open: noteManager.showing,
            onClose: onNewNotePopoverClose,
            anchorEl: getNewNotePopoverAnchorElement(),
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right",
            },
          }}
          newFieldHandlers={{
            text: onNewTextFieldSubmit,
          }}
          noteHighlightColor={newNote?.hex_bg_color ?? NEW_NOTE_DEFAULT_HIGHLIGHT_COLOR}
        />
      </FormProvider>
    </Box>
  )
}

export default TextContext
