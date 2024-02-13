import Nav from "@/components/Nav"
import TextContext from "@/components/TextContext"
import { Typography } from "@mui/material"
import { promises as fs } from "fs"

export default async function Index() {
  const file = await fs.readFile(process.cwd() + "/test.txt", "utf-8")

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <Typography variant="h1">The Better Note Taking App</Typography>
    </div>
  )
}
