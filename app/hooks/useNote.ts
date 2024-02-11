import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useKeyPress } from "@/app/hooks/useKeyPress"

const noteSchema = z.object({
  title: z.string().min(1),
})

type NewNoteSchema = z.infer<typeof noteSchema>

export const useNote = () => {
  const [showingPopup, showingPopupSetter] = useState<boolean>(false)

  useKeyPress("n", () => {
    showingPopupSetter(true)
  })

  const formStuff = useForm<NewNoteSchema>({
    resolver: zodResolver(noteSchema),
  })

  return {
    showing: showingPopup,
    showingSetter: showingPopupSetter,
  }
}
