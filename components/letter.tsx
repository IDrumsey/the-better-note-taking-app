import { Box } from "@mui/material"
import { useEffect, useState } from "react"

type Props = {
  text: string
  index: number
  onHover: (index: number) => void
}

const Letter = ({ text, index, onHover }: Props) => {
  const [hovering, hoveringSetter] = useState<boolean>(false)

  useEffect(() => {
    if (hovering) {
      onLetterHover()
    }
  }, [hovering])

  const onLetterHover = () => {
    onHover(index)
  }

  return (
    <Box component="span" onMouseEnter={() => hoveringSetter(true)} onMouseLeave={() => hoveringSetter(false)}>
      {text}
    </Box>
  )
}

export default Letter
