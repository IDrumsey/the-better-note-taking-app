// import styles from ''

import { Box } from "@mui/material"
import { useEffect, useState } from "react"

type Props = {
  text: string
  index: number
  trackingHighlighting: boolean
}

const Word = ({ text, index, trackingHighlighting }: Props) => {
  const [hovering, hoveringSetter] = useState<boolean>(false)

  const [highlighted, highlightedSetter] = useState<boolean>(false)

  const onMouseEnter = () => {
    hoveringSetter(true)
  }

  const onMouseExit = () => {
    hoveringSetter(true)
  }

  useEffect(() => {
    highlightedSetter(trackingHighlighting && hovering)
  }, [hovering, trackingHighlighting])

  return (
    <Box
      component="span"
      sx={{
        backgroundColor: highlighted ? "blue" : "#00000000",
        borderRadius: 1,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseExit}
    >
      {text}
      {index}
    </Box>
  )
}

export default Word
