import styles from "./TextField.module.scss"
import { newNoteTextField } from "@/app/schemas/notes"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Typography, useTheme } from "@mui/material"
import { darken } from "@mui/material/styles"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import IconUtilityButton from "../../../NewFieldTypeButton"
import FormatBoldIcon from "@mui/icons-material/FormatBold"
import FormatItalicIcon from "@mui/icons-material/FormatItalic"
import { KeyboardEvent, useState } from "react"
import { Check, DoDisturb } from "@mui/icons-material"
import Color from "colorjs.io"

type NewTextFieldSchema = z.infer<typeof newNoteTextField>

type Props = {
  submitHandler: (data: NewTextFieldSchema) => void
}

const NewTextField = ({ submitHandler }: Props) => {
  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<NewTextFieldSchema>({
    resolver: zodResolver(newNoteTextField),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      content: "",
    },
  })

  const theme = useTheme()

  const [isBold, isBoldSetter] = useState<boolean>(false)
  const [isItalic, isItalicSetter] = useState<boolean>(false)

  const errorBgColor = new Color(darken(theme.palette.error.main, 0.8))
  errorBgColor.alpha = 0.2

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      submitHandler(getValues())
    }
  }

  return (
    <Box
      className={styles["text-field-wrapper"]}
      sx={{
        boxShadow: errors.content ? `0 0 3px ${theme.palette.error.dark}` : undefined,
      }}
    >
      <input
        style={{
          backgroundColor: theme.palette.mode == "light" ? theme.palette.grey[100] : theme.palette.grey[900],
          fontStyle: isItalic ? "italic" : "normal",
          fontWeight: isBold ? "bold" : "normal",
          padding: theme.spacing(2),
        }}
        className={styles["text-input"]}
        type="text"
        {...register("content")}
        onKeyDown={onInputKeyDown}
      />
      {/* Text utilities */}
      <Box className="flex" sx={{ backgroundColor: "#282828" }} paddingRight={2}>
        <IconUtilityButton Icon={FormatBoldIcon} highlighted={isBold} onClick={() => isBoldSetter((prev) => !prev)} />
        <IconUtilityButton
          Icon={FormatItalicIcon}
          highlighted={isItalic}
          onClick={() => isItalicSetter((prev) => !prev)}
        />
        <Box marginLeft="auto" className="flex gap-x-2" color="#4F4F4F">
          <Box className="flex items-center gap-x-2">
            <DoDisturb fontSize="small" sx={{ color: "#393939" }} />
            <Typography variant="caption">esc</Typography>
          </Box>
          <Box className="flex items-center gap-x-2">
            <Check fontSize="small" color="success" />
            <Typography variant="caption">enter</Typography>
          </Box>
        </Box>
      </Box>

      {/* validation error */}
      {errors.content && (
        <Box sx={{ backgroundColor: errorBgColor.toString() }} padding={1}>
          <Typography variant="caption" color="error.main">
            {errors.content.message}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default NewTextField
