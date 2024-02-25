"use client"

import { Box, Typography } from "@mui/material"
import { useCallback, useState } from "react"
import { Database } from "@/database.types"
import Word from "./Word"
import NotePopup from "./new-note/NewNotePopup/NotePopup"
import { NoteSchema, TextFieldSchema, notePopupFormSchema } from "@/app/schemas/notes"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { colorToAlphaHex, getMinimumTextFromSelectedText } from "@/app/utility/gen"
import { useKeyPress } from "@/app/hooks/useKeyPress"

type Props = {
  // The text to attach to the context
  contextText: string

  // the notes to attach to the context
  contextNotes: Array<{
    note: Database["public"]["Tables"]["notes"]["Row"]
    selectedRanges: Array<Database["public"]["Tables"]["note_selected_ranges"]["Row"]>
  }>

  // any handlers that the context should call
  backend: {
    createNewNote: (data: Omit<NoteSchema, "documentId">) => Promise<Database["public"]["Tables"]["notes"]["Row"]>
    updateNote: (
      noteId: number,
      data: Database["public"]["Tables"]["notes"]["Update"]
    ) => Promise<Database["public"]["Tables"]["notes"]["Row"]>
    createTextField: (
      data: TextFieldSchema,
      noteId: number
    ) => Promise<Database["public"]["Tables"]["note_text_fields"]["Row"]>
  }

  // default color to use for new notes
  defaultSelectHighlightColor: string
}

/**
 * Add functionality to a piece of text like highlighting functionality.
 *
 * Functionalities of the context
 *
 * - Ability to select/highlight words
 * - (Future) Ability to format text like bolding and italicizing
 */
const TextContext = ({
  contextText: text,
  contextNotes: documentNotes,
  defaultSelectHighlightColor,
  backend,
}: Props) => {
  const router = useRouter()

  // track when we're selecting words
  const [selectingWords, selectingWordsSetter] = useState<boolean>(false)

  // keep track of the words that are selected
  const [currentlySelectedWordIndeces, currentlySelectedWordIndecesSetter] = useState<Array<number>>([])

  // keep track of the last selected word
  const [lastSelectedWordElement, lastSelectedWordElementSetter] = useState<HTMLSpanElement | null>(null)

  // keep track of the new note that's being created
  const [newNote, newNoteSetter] = useState<Database["public"]["Tables"]["notes"]["Row"] | null>(null)

  const supabase = createClient()

  // control when the note popup is showing
  const [showingPopup, showingPopupSetter] = useState<boolean>(false)

  // when "n" keyboard is pressed, show the note popup
  useKeyPress("n", () => {
    showingPopupSetter(true)
  })

  /**
   * Handler for when the mouse is pressed down on the text
   */
  const onTextMouseDown = () => {
    // signal that we're selecting words now
    selectingWordsSetter(true)
  }

  /**
   * Handler for when the mouse is released when on the text
   */
  const onTextMouseUp = () => {
    // signal that we're not selecting words now
    selectingWordsSetter(false)
  }

  /**
   * Handler for when an event occurs that could signal selecting a word
   *
   * @param index - The index of the specified words
   * @param targetElement - The element for the specified word that should be selected
   */
  const onWordPotentialSelectEvent = useCallback(
    (index: number, targetElement?: HTMLSpanElement) => {
      // check if the word the event is on is already selected
      const wordAlreadyHighlighted = currentlySelectedWordIndeces.findIndex((i) => i == index) !== -1

      if (!wordAlreadyHighlighted && selectingWords) {
        // add the word the event is for to the list of selected words
        currentlySelectedWordIndecesSetter((prev) => {
          return [...prev, index]
        })

        // set the element for the word the event was for to the last selected word element
        lastSelectedWordElementSetter(targetElement ?? null)
      }
    },
    [selectingWords, currentlySelectedWordIndeces]
  )

  /**
   * Handler for when a word is hovered
   *
   * @param index - The index of the word to get the notes for
   * @param targetElement - The element for the specified word that was hovered over
   */
  const onWordHover = useCallback(
    (index: number, targetElement: HTMLSpanElement | undefined) => {
      // call the potential word select event handler
      onWordPotentialSelectEvent(index, targetElement)
    },
    [onWordPotentialSelectEvent]
  )

  /**
   * Handler for mouse down on a word
   *
   * @param index - The index of the word to get the notes for
   */
  const onWordMouseDown = useCallback(
    (index: number) => {
      // call the potential word select event handler
      onWordPotentialSelectEvent(index)
    },
    [onWordPotentialSelectEvent]
  )

  /**
   * Get all the notes that have this word in it
   *
   * @param index - The index of the word to get the notes for
   */
  const getWordNotes = useCallback(
    (index: number): Array<Database["public"]["Tables"]["notes"]["Row"]> => {
      // for each note in the context, check the note to see if the word is in one of the note's selected ranges
      const notesWithThisWord: Array<{
        note: Database["public"]["Tables"]["notes"]["Row"]
        selectedRanges: Array<Database["public"]["Tables"]["note_selected_ranges"]["Row"]>
      }> = documentNotes.filter((note) => {
        // for each range, check if the word is in that range
        for (let i = 0; i < note.selectedRanges.length; i++) {
          const range = note.selectedRanges.at(i)

          // the range for whatever reason is undefined -> skip
          if (!range) continue

          // check that the index of the specified word is between the current range's start and end index
          if (index >= range.start_word_index && index <= range.end_word_index) return true
        }

        return false
      })

      // return just the note, not the selected ranges with it.
      return notesWithThisWord.map((note) => note.note)
    },
    [documentNotes]
  )

  /**
   * Check if a word is selected
   *
   * @param wordIndex - The index of the word to check if selected
   */
  const isWordSelected = useCallback(
    (wordIndex: number) => {
      // go through all the currently selected words and check if the indeces match
      // check that there's at least one match
      return currentlySelectedWordIndeces.findIndex((index) => index == wordIndex) !== -1
    },
    [currentlySelectedWordIndeces]
  )

  /**
   * Check if a word should be highlighted
   *
   * @param index - The index of the word to check
   */
  const isWordHighlighted = useCallback(
    (index: number): boolean => {
      // get whether the word is selected
      const wordIsSelected = isWordSelected(index)

      try {
        // get all the notes for the word
        const wordNotes: Array<Database["public"]["Tables"]["notes"]["Row"]> | undefined = getWordNotes(index)

        // word is highlighted if the word is selected or there are notes for the word
        return wordIsSelected || wordNotes?.length > 0
      } catch (e) {
        // failed to get word notes -> just return whether the word is selected or not
        return wordIsSelected
      }
    },
    [isWordSelected, getWordNotes]
  )

  /**
   * Get the highlight color for a word
   *
   * @param index - The index of the word for which to get the highlight color for
   */
  const getWordHighlightColor = useCallback(
    (index: number): string | undefined => {
      // get the notes for the word
      const notesWithThisWord = getWordNotes(index)

      // if a new note is being added and the new note has the word as part of it's selection -> we know the word is part of the new note
      if (newNote && notesWithThisWord.filter((note) => note.id == newNote.id).length > 0) {
        // this is a word in the new note -> return the new note color
        return newNote.hex_bg_color
      }

      // if the word is in the current selection -> that overrules any note highlights (except if it's part of the new note being added)
      if (isWordSelected(index)) {
        return defaultSelectHighlightColor
      } else {
        // word isn't selected
        // check that this word actually has notes
        const hasNotes: boolean = notesWithThisWord.length > 0

        if (!hasNotes) {
          // word doesn't have any notes
          return undefined
        } else {
          // word has notes
          // figure out which note color to use
          // just using the last note's color
          notesWithThisWord[notesWithThisWord.length - 1].hex_bg_color
        }
      }
    },
    [documentNotes, isWordSelected, getWordNotes, newNote]
  )

  /**
   * Gets the element that will serve as the anchor for the new note popover element
   */
  const getNewNotePopoverAnchorElement = useCallback((): Element | null => {
    // the last word selected will be the target element
    return lastSelectedWordElement
  }, [lastSelectedWordElement])

  /**
   * Get all the ranges of words that are selected
   */
  const getSelectedWordRanges = useCallback((): Array<[number, number]> => {
    const ranges: Array<[number, number]> = []

    // create a copy of the currently selected words
    const selectedWordIndecesAsc = [...currentlySelectedWordIndeces]

    // sort the words by the indeces
    selectedWordIndecesAsc.sort((a, b) => a - b)

    let startIndex = 0
    let endIndex = 0

    // for each word index
    for (let i = 1; i <= selectedWordIndecesAsc.length - 1; i++) {
      // check that the last previous word index is for the word before this index's word
      if (selectedWordIndecesAsc[i] === selectedWordIndecesAsc[i - 1] + 1) {
        endIndex = i
      } else {
        ranges.push([selectedWordIndecesAsc[startIndex], selectedWordIndecesAsc[endIndex]])
        startIndex = i
        endIndex = i + 1
      }
    }

    // get the last word range if both start and end are still defined
    if (selectedWordIndecesAsc[startIndex] && selectedWordIndecesAsc[endIndex]) {
      ranges.push([selectedWordIndecesAsc[startIndex], selectedWordIndecesAsc[endIndex]])
    }
    return ranges
  }, [currentlySelectedWordIndeces])

  // TODO: This should be moved out of this component
  /**
   * Creates a new note
   *
   * @returns The new note that was created
   */
  const createNewNote = useCallback(async (): Promise<Database["public"]["Tables"]["notes"]["Row"]> => {
    // get all the ranges for the selected words.
    const selectedRanges = getSelectedWordRanges().map((range) => {
      return {
        startWordIndex: range[0],
        endWordIndex: range[1],
      }
    })

    // call handler to create new note
    const createdNote = backend.createNewNote({
      ranges: selectedRanges,
      noteColor: colorToAlphaHex(defaultSelectHighlightColor),
    })

    return createdNote
  }, [getSelectedWordRanges])

  // TODO: move out of component
  /**
   * Handler for when a new text field is submitted on a note
   *
   * @param data - The data for the new text field
   * @param noteId - The id of the note on which this new text field was submitted
   */
  const onNewTextFieldSubmit = useCallback(
    async (data: TextFieldSchema, noteId: number | undefined) => {
      // determine the note on which to save this new text field for
      let noteToAddThisNewTextFieldTo = noteId

      if (!noteId) {
        // the noteId wasn't specified for the new text field, so just create a new note for it
        try {
          // create new note
          const newNote = await createNewNote()

          // refresh the page, so that the new note is retrieved
          // TODO: won't be needed here after moved out of component
          router.refresh()

          // set the new note as this newly created note
          newNoteSetter(newNote)

          // set the id of the note to add the text field for to the newly created note
          noteToAddThisNewTextFieldTo = newNote.id
        } catch (e) {
          // failed to create a new note
          alert("failed to add note")
          // TODO: Failed to add new note -> show error notification
          return
        }
      }

      if (noteToAddThisNewTextFieldTo) {
        // create/save the new text field
        const createdTextField = backend.createTextField(data, noteToAddThisNewTextFieldTo)
      }
    },
    [createNewNote]
  )

  /**
   * Handler for when the note popup color changes
   *
   * @param color - The new color that was selected
   * @param noteId - The note for which the color was selected
   */
  const handleNotePopupColorChange = useCallback(
    async (color: string, noteId: number | undefined) => {
      // if the new note isn't defined yet, you have to create the note
      let noteToChangeColorOnId = noteId && newNote ? noteId : (await createNewNote()).id

      // update the note
      try {
        const updatedNote = await backend.updateNote(noteToChangeColorOnId, { hex_bg_color: color })

        // set the new note data as the updated data you just got from the database
        newNoteSetter(updatedNote)

        // refresh the server component
        router.refresh()
      } catch (e) {
        // TODO: failed to fetch the updated result -> add better notification
        alert("Failed to fetch the updated result. refresh page.")
      }
    },
    [newNote, createNewNote]
  )

  /**
   * Handler for when the new note popover component signals close
   */
  const onNewNotePopoverClose = () => {
    // unset the new note state var
    newNoteSetter(null)

    // stop showing the new note popover component
    showingPopupSetter(false)
  }

  /**
   * Gets all the word indeces that are selected
   */
  const getAllSelectedWordIndeces = (): Array<number> => {
    const selectedRanges = getSelectedWordRanges()

    let allSelectedWordIndeces: Array<number> = []
    // spread to one array
    selectedRanges.forEach((range) => {
      for (let i = range[0]; i <= range[1]; i++) {
        allSelectedWordIndeces.push(i)
      }
    })

    const firstIndex = allSelectedWordIndeces[0]

    // now we need to shift all the indeces since we're not passing the full text to the note popup
    allSelectedWordIndeces = allSelectedWordIndeces.map((index) => index - firstIndex)

    return allSelectedWordIndeces
  }

  return (
    <Box width="100%" onMouseDown={onTextMouseDown} onMouseUp={onTextMouseUp}>
      <Typography sx={{ display: "flex", flexWrap: "wrap", rowGap: 1, columnGap: 0.5, userSelect: "none" }}>
        {/* split the context's text into words and pass each word to its own component */}
        {text &&
          text
            .split(" ")
            .map((word, i) => (
              <Word
                key={i}
                text={word}
                index={i}
                onWordHover={onWordHover}
                onWordMouseDown={onWordMouseDown}
                highlighted={isWordHighlighted(i)}
                highlightColor={getWordHighlightColor(i)}
              />
            ))}
      </Typography>

      {/* new note popover */}
      <NotePopup
        noteAuthor={{
          firstName: "Unknown",
          lastName: "Unknown",
          avatarImageURL: null,
        }}
        selectedText={{
          text: getMinimumTextFromSelectedText(text, currentlySelectedWordIndeces),
          wordsThatAreHighlightedIndeces: getAllSelectedWordIndeces(),
        }}
        state={{
          deleteEnabled: false,
        }}
        popoverProps={{
          open: showingPopup,
          onClose: onNewNotePopoverClose,
          anchorEl: getNewNotePopoverAnchorElement(),
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        }}
        handlers={{
          newTextField: (data) => onNewTextFieldSubmit(data, newNote?.id ?? undefined),
        }}
        noteHighlightColor={newNote?.hex_bg_color ?? defaultSelectHighlightColor}
      />
    </Box>
  )
}

export default TextContext
