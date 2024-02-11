import styles from "./page.module.scss"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import TextContext from "@/components/TextContext"

type Props = {
  params: { slug: string }
}

const PagePage = async ({ params }: Props) => {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const page = await supabase.from("pages").select().filter("id", "eq", params.slug)

  return (
    <>
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <TextContext text={page.data?.at(0)?.text ?? ""} />
      </div>
    </>
  )
}

export default PagePage
