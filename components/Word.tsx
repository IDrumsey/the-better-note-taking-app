// import styles from ''

import { Box } from "@mui/material"
import { useEffect, useState } from "react"

type Props = {
  text: string
  index: number
  onWordHover: (index: number) => void
  onWordMouseDown: (index: number) => void
  highlighted: boolean
}

const Word = ({ text, index, onWordHover, highlighted, onWordMouseDown }: Props) => {
  const [hovering, hoveringSetter] = useState<boolean>(false)

  const onMouseEnter = () => {
    hoveringSetter(true)
  }

  const onMouseExit = () => {
    hoveringSetter(false)
  }

  useEffect(() => {
    if (hovering) {
      onWordHover(index)
    }
  }, [hovering])

  return (
    <Box
      component="span"
      sx={{
        backgroundColor: highlighted ? "#eb34a536" : "#00000000",
        borderRadius: 1,
        paddingY: 0.5,
        paddingX: 0.5,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseExit}
      onMouseDown={() => onWordMouseDown(index)}
    >
      {text}
    </Box>
  )
}

export default Word
