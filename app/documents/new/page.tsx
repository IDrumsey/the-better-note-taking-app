"use client"

import { newDocumentSchema } from "@/app/schemas/document"
import { Box, Button, TextField, Typography } from "@mui/material"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation"

type Props = {}

type NewDocumentSchema = z.infer<typeof newDocumentSchema>

const NewDocumentPage = ({}: Props) => {
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<NewDocumentSchema>({
    resolver: zodResolver(newDocumentSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      text: "",
    },
  })

  const onValidSubmit: SubmitHandler<NewDocumentSchema> = async (data) => {
    const result = await axios.post<{ data: { documentId: number } }>("/api/documents/new", {
      title: data.title,
      text: data.text,
    })

    switch (result.status) {
      case 201:
        router.push(`/documents/${result.data.data.documentId}`)
        break
      default:
        alert("Failed to create document.")
        break
    }
  }

  return (
    <>
      <Box sx={{ width: "80%", marginX: "auto" }}>
        <form onSubmit={handleSubmit(onValidSubmit)} className="flex flex-col gap-y-10 mt-10">
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => {
              return (
                <TextField
                  name={field.name}
                  label="Title"
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  sx={{ width: "100%" }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )
            }}
          />

          <Controller
            control={control}
            name="text"
            render={({ field, fieldState }) => {
              return (
                <TextField
                  name={field.name}
                  multiline
                  minRows={10}
                  label="Content"
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  sx={{ width: "100%" }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )
            }}
          />

          <Button color="success" type="submit" variant="contained" disabled={!isValid} sx={{ paddingY: 2 }}>
            <Typography>Create</Typography>
          </Button>
        </form>
      </Box>
    </>
  )
}

export default NewDocumentPage
