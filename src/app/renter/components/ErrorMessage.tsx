"use client"

export default function ErrorMessage({
  message,
  title,
  currentUser,
}: {
  message: string
  title: string
  currentUser: any
}) {
  return (
    <div className="flex justify-center items-center w-full py-20">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-gray-600 mt-2">{message}</p>
      </div>
    </div>
  )
}
