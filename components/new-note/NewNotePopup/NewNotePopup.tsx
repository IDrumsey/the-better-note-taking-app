"use client"

import styles from "./NewNotePopup.module.scss"
import EditNoteIcon from "@mui/icons-material/EditNote"
import AbcIcon from "@mui/icons-material/Abc"
import AddIcon from "@mui/icons-material/Add"
import SlideShowIcon from "@mui/icons-material/SlideShow"
import { Box, Popover, PopoverProps, Typography } from "@mui/material"
import { lighten } from "@mui/material/styles"
import { useCallback, useState } from "react"
import IconUtilityButton from "./NewFieldTypeButton"
import NewTextField from "./Fields/New/TextField/TextField"
import { z } from "zod"
import { NotePopupFormSchemaType, newNoteTextField } from "@/app/schemas/notes"
import axios from "axios"
import { useFormContext } from "react-hook-form"

type FieldTypes = "text" | "video"

type NewTextFieldSchema = z.infer<typeof newNoteTextField>

type Props = {
  noteId?: number
  popoverProps: PopoverProps
  newFieldHandlers: {
    text: (data: NewTextFieldSchema, noteId: number | undefined) => void
  }
  noteHighlightColor: string
}

function NotePopup({ popoverProps, newFieldHandlers, noteId, noteHighlightColor }: Props) {
  const { register } = useFormContext<NotePopupFormSchemaType>()
  const [selectedFieldType, selectedFieldTypeSetter] = useState<FieldTypes>("text")
  const [showingNewField, showingNewFieldSetter] = useState<boolean>(false)

  const onAddFieldButtonClick = () => {
    showingNewFieldSetter(true)
  }

  const onTextFieldSubmit = useCallback(
    (data: NewTextFieldSchema) => {
      newFieldHandlers.text(data, noteId)
    },
    [newFieldHandlers.text, noteId]
  )

  return (
    <Popover {...popoverProps}>
      <Box padding={1} className="flex flex-col gap-y-4" sx={{ width: "35vw", backgroundColor: "rgba(28, 28, 28)" }}>
        <Box className="flex gap-x-2 items-center" color="#525252">
          <EditNoteIcon />
          <Typography variant="h6" fontWeight="bold">
            New Note
          </Typography>
          <input className={styles["note-color"]} type="color" {...register("noteColor", { required: true })} />
        </Box>

        {/* field being added currently */}
        {showingNewField && selectedFieldType == "text" ? (
          <NewTextField submitHandler={onTextFieldSubmit} />
        ) : (
          selectedFieldType == "video" && <Box>video</Box>
        )}

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
                selectedFieldTypeSetter("text")
              }}
              highlighted={selectedFieldType == "text"}
            />
            <IconUtilityButton
              Icon={SlideShowIcon}
              onClick={() => {
                selectedFieldTypeSetter("video")
              }}
              highlighted={selectedFieldType == "video"}
            />
          </Box>
        </Box>
      </Box>
    </Popover>
  )
}

export default NotePopup
