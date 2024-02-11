"use client"

import EditNoteIcon from "@mui/icons-material/EditNote"
import AbcIcon from "@mui/icons-material/Abc"
import AddIcon from "@mui/icons-material/Add"
import SlideShowIcon from "@mui/icons-material/SlideShow"
import { Box, Popover, PopoverProps, Typography } from "@mui/material"
import { lighten } from "@mui/material/styles"
import { useState } from "react"
import NewFieldTypeButton from "./NewFieldTypeButton"

type Props = {
  popoverProps: PopoverProps
}

type FieldTypes = "text" | "video"

const NewNotePopup = ({ popoverProps }: Props) => {
  const [selectedFieldType, selectedFieldTypeSetter] = useState<FieldTypes>("text")

  const onAddFieldButtonClick = () => {
    console.log("adding field")
  }

  return (
    <Popover {...popoverProps}>
      <Box padding={1} className="flex flex-col gap-y-4" sx={{ width: "35vw", backgroundColor: "rgba(28, 28, 28)" }}>
        <Box className="flex gap-x-2 items-center" color="#525252">
          <EditNoteIcon />
          <Typography variant="h6" fontWeight="bold">
            New Note
          </Typography>
        </Box>

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
            <NewFieldTypeButton
              Icon={AbcIcon}
              onClick={() => {
                selectedFieldTypeSetter("text")
              }}
              highlighted={selectedFieldType == "text"}
            />
            <NewFieldTypeButton
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

export default NewNotePopup
