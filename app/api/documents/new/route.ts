import { newDocumentAPISchema } from "@/app/schemas/document"
import { tryStuff } from "@/app/utility/gen"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // get the request body
  const requestBody = await request.json()

  // validate the incoming data
  const [validData, validationError] = tryStuff(newDocumentAPISchema.parse, requestBody)

  if (validationError) {
    return Response.json({
      errors: [{ message: "Invalid Data" }],
    })
  }

  const userResponse = await supabase.auth.getUser()

  if (userResponse.error) {
    return Response.json(
      {
        errors: [{ message: "Could not determine who is trying to add a document. Are you authenticated?" }],
      },
      { status: 401 }
    )
  }

  const result = await supabase
    .from("documents")
    .insert({
      title: validData.title,
      text: validData.text,
      user_id: userResponse.data.user.id,
    })
    .select()

  switch (result.status) {
    case 201:
      return Response.json(
        {
          data: {
            documentId: result.data?.at(0)?.id ?? -1,
          },
        },
        {
          status: 201,
        }
      )

    default:
      return Response.json(
        {
          errors: [{ message: "Failed to create new document record" }],
        },
        { status: 500 }
      )
  }
}
