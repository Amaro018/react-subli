import db from "db"
import { z } from "zod"

const CreateAttributeInput = z.object({
  name: z.string().min(1, "Option name is required"),
})

export default async function createAttribute(input: z.infer<typeof CreateAttributeInput>) {
  const data = CreateAttributeInput.parse(input)

  let attribute = await db.attribute.findUnique({
    where: { name: data.name },
  })

  if (!attribute) {
    attribute = await db.attribute.create({
      data: { name: data.name },
    })
  }

  return attribute
}
