import { Box } from "@mui/material"
import { ElementType, ReactElement } from "react"
import { darken, lighten } from "@mui/material/styles"

type Props = {
  Icon: ElementType
  onClick: () => void
  highlighted: boolean
}

const IconUtilityButton = ({ Icon, onClick, highlighted }: Props) => {
  return (
    <Box
      paddingX={1}
      paddingY={0.75}
      onClick={onClick}
      sx={{
        backgroundColor: highlighted ? darken("#282828", 0.4) : undefined,
        cursor: "pointer",
        "&:hover": { backgroundColor: !highlighted ? darken("#282828", 0.1) : undefined },
      }}
    >
      <Icon style={{ opacity: highlighted ? 1 : 0.2 }} />
    </Box>
  )
}

export default IconUtilityButton
