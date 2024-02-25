"use client"

import styles from "./NewNotePopup.module.scss"
import EditNoteIcon from "@mui/icons-material/EditNote"
import AbcIcon from "@mui/icons-material/Abc"
import AddIcon from "@mui/icons-material/Add"
import SlideShowIcon from "@mui/icons-material/SlideShow"
import { Box, Popover, PopoverProps, Typography } from "@mui/material"
import { lighten } from "@mui/material/styles"
import { useCallback, useEffect, useState } from "react"
import IconUtilityButton from "./NewFieldTypeButton"
import NewTextField from "./Fields/New/TextField/TextField"
import { z } from "zod"
import { NotePopupFormSchemaType, newNoteTextField, notePopupFormSchema } from "@/app/schemas/notes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

type FieldTypes = "text" | "video"

type NewTextFieldSchema = z.infer<typeof newNoteTextField>

type Props = {
  popoverProps: PopoverProps
  handlers?: {
    // when the color changes, run this
    colorChange?: (newColor: string) => void
    // when a new text field is submitted, run this
    newTextField?: (data: NewTextFieldSchema) => void
  }
  noteHighlightColor: string
}

function NotePopup({ popoverProps, handlers: handlers, noteHighlightColor }: Props) {
  // controller for the note popup data
  const notePopupForm = useForm<NotePopupFormSchemaType>({
    resolver: zodResolver(notePopupFormSchema),
    defaultValues: {
      noteColor: noteHighlightColor,
    },
  })

  const [newFieldSelectedType, newFieldSelectedTypeSetter] = useState<FieldTypes>("text")
  const [showingNewFieldInput, showingNewFieldInputSetter] = useState<boolean>(false)

  const onAddFieldButtonClick = () => {
    showingNewFieldInputSetter(true)
  }

  const onTextFieldSubmit = useCallback(
    (data: NewTextFieldSchema) => {
      if (handlers && handlers.newTextField) {
        handlers.newTextField(data)
      }
    },
    [handlers?.newTextField]
  )

  /**
   * Whenever the note popup component color gets changed, trigger handler
   */
  useEffect(() => {
    const sub = notePopupForm.watch((data, { name, type }) => {
      if (data.noteColor && name == "noteColor" && type == "change") {
        if (handlers && handlers.colorChange) {
          handlers.colorChange(data.noteColor)
        }
      }
    })

    return () => sub.unsubscribe()
  }, [notePopupForm, handlers?.colorChange])

  const onCancelNewField = useCallback(() => {
    if (showingNewFieldInput) {
      // new input field is showing -> user clicked esc -> close new input field
      showingNewFieldInputSetter(false)
    }
  }, [showingNewFieldInput])

  return (
    <Popover {...popoverProps}>
      <Box padding={1} className="flex flex-col gap-y-4" sx={{ width: "35vw", backgroundColor: "rgba(28, 28, 28)" }}>
        <Box className="flex gap-x-2 items-center" color="#525252">
          <input
            className={styles["note-color"]}
            type="color"
            {...notePopupForm.register("noteColor", { required: true })}
          />
        </Box>

        {/* field being added currently */}
        {showingNewFieldInput &&
          (newFieldSelectedType == "text" ? (
            <NewTextField submitHandler={onTextFieldSubmit} handlers={{ cancel: onCancelNewField }} />
          ) : (
            newFieldSelectedType == "video" && <Box>Video</Box>
          ))}

        {/* add new field button */}
        <Box>
          <Box
            padding={1}
            sx={{
              backgroundColor: "#222222",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: lighten("#222222", 0.01),
              },
            }}
            onClick={onAddFieldButtonClick}
          >
            <AddIcon sx={{ display: "block", marginInline: "auto" }} />
          </Box>
          <Box className="flex" sx={{ backgroundColor: "#282828" }}>
            <IconUtilityButton
              Icon={AbcIcon}
              onClick={() => {
                newFieldSelectedTypeSetter("text")
              }}
              highlighted={newFieldSelectedType == "text"}
            />
            <IconUtilityButton
              Icon={SlideShowIcon}
              onClick={() => {
                newFieldSelectedTypeSetter("video")
              }}
              highlighted={newFieldSelectedType == "video"}
            />
          </Box>
        </Box>
      </Box>
    </Popover>
  )
}

export default NotePopup
