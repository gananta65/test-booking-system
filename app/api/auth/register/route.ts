import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
