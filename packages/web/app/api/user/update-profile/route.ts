import { writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("Starting profile update for user:", session.user.id)

    const formData = await req.formData()
    console.log("FormData received:", Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File: ${value.name}` : value]))

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const avatarFile = formData.get("avatar") as File | null

    console.log("Parsed data - name:", name, "email:", email, "avatarFile:", avatarFile ? avatarFile.name : null)

    const updateData: { name?: string; email?: string; image?: string } = {}

    if (name) {
      updateData.name = name
    }
    if (email) {
      // In a real app, you'd want to verify the new email
      updateData.email = email
    }

    if (avatarFile) {
      console.log("Processing avatar file")
      // Don't trust the client's file name
      const fileExtension = avatarFile.name.split(".").pop()
      const newFilename = `${session.user.id}-${Date.now()}.${fileExtension}`
      const path = `public/avatars/${newFilename}`
      const publicPath = `/avatars/${newFilename}`

      console.log("Saving file to:", path)

      const bytes = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Save the file
      await writeFile(path, buffer)
      console.log("File saved successfully")

      updateData.image = publicPath
    }

    console.log("Update data prepared:", updateData)

    if (Object.keys(updateData).length === 0) {
      console.log("No update data provided")
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      )
    }

    // Update user in the database
    console.log("Updating user in database")
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    console.log("User updated successfully:", updatedUser)

    return NextResponse.json({
      message: "Profile updated successfully!",
      user: updatedUser,
    })
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}