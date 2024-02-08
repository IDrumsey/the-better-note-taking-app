import { Box } from "@mui/material"
import AuthButton from "./AuthButton"
import DeployButton from "./DeployButton"
import Link from "next/link"

type Props = {}

const Nav = ({}: Props) => {
  return (
    <>
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <Box>
            <Link href="/pages">Your Pages</Link>
          </Box>
          <AuthButton />
        </div>
      </nav>
    </>
  )
}

export default Nav
