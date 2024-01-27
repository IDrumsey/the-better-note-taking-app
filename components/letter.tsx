import { Box } from "@mui/material"

type Props = {
  text: string
}

const Letter = ({ text }: Props) => {
  return <Box component="span">{text}</Box>
}

export default Letter
