import db from "db"
import { z } from "zod"

const CreateAttributeValueInput = z.object({
  attributeId: z.number(),
  value: z.string().min(1, "Value is required"),
  hexCode: z.string().nullable().optional(),
})

export default async function createAttributeValue(
  input: z.infer<typeof CreateAttributeValueInput>
) {
  const data = CreateAttributeValueInput.parse(input)

  let attributeValue = await db.attributeValue.findUnique({
    where: {
      attributeId_value: { attributeId: data.attributeId, value: data.value },
    },
  })

  if (!attributeValue) {
    attributeValue = await db.attributeValue.create({
      data: {
        attributeId: data.attributeId,
        value: data.value,
        hexCode: data.hexCode,
      },
    })
  }

  return attributeValue
}
