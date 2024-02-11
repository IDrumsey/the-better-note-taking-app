"use client"

import { newDocumentSchema } from "@/app/schemas/document"
import { Box, Button, TextField, Typography } from "@mui/material"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

type Props = {}

type NewDocumentSchema = z.infer<typeof newDocumentSchema>

const NewDocumentPage = ({}: Props) => {
  const { register, control, handleSubmit } = useForm<NewDocumentSchema>({
    resolver: zodResolver(newDocumentSchema),
  })

  const onValidSubmit: SubmitHandler<NewDocumentSchema> = (data) => {}

  return (
    <>
      <Box sx={{ width: "80%", marginX: "auto" }}>
        <form onSubmit={handleSubmit(onValidSubmit)} className="flex flex-col gap-y-10 mt-10">
          <Controller
            control={control}
            name="title"
            render={({ field }) => {
              return <TextField label="Title" onChange={field.onChange} value={field.value} sx={{ width: "100%" }} />
            }}
          />

          <Controller
            control={control}
            name="text"
            render={({ field }) => {
              return (
                <TextField
                  multiline
                  minRows={10}
                  label="Content"
                  onChange={field.onChange}
                  value={field.value}
                  sx={{ width: "100%" }}
                />
              )
            }}
          />

          <Button color="success" type="submit" variant="contained" sx={{ paddingY: 2 }}>
            <Typography>Create</Typography>
          </Button>
        </form>
      </Box>
    </>
  )
}

export default NewDocumentPage
