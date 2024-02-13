// Add a new field to a note

import { newNoteTextFieldAPISchema } from "@/app/schemas/notes"
import { tryStuff } from "@/app/utility/gen"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request, { params }: { params: { documentId: string; noteId: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // get the request body
  const requestBody = await request.json()

  // TODO: auth

  // validate the incoming data
  const [validData, validationError] = tryStuff(newNoteTextFieldAPISchema.parse, requestBody)

  if (validationError) {
    return Response.json(
      {
        errors: [{ message: "Invalid Data" }],
      },
      { status: 400 }
    )
  }

  const userResponse = await supabase.auth.getUser()

  if (userResponse.error) {
    return Response.json(
      {
        errors: [{ message: "Could not determine who is trying to add a text field. Are you authenticated?" }],
      },
      { status: 401 }
    )
  }

  const result = await supabase
    .from("note_text_fields")
    .insert({
      content: validData.content,
      note_id: Number(params.noteId),
    })
    .select()

  switch (result.status) {
    case 201:
      return Response.json(
        {
          data: {
            textFieldId: result.data?.at(0)?.id ?? -1,
          },
        },
        {
          status: 201,
        }
      )

    default:
      return Response.json(
        {
          errors: [{ message: "Failed to create new text field record" }],
        },
        { status: 500 }
      )
  }
}
