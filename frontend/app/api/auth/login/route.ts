import { NextRequest, NextResponse } from "next/server"

const DCS_LOGIN_URL = "https://demo-dcs-api-us.everycred.com/v1/auth/login"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    const dcsResponse = await fetch(DCS_LOGIN_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        // For now we are not enforcing reCAPTCHA, so send blank
        recaptcha_token: "",
      }),
    })

    const data = await dcsResponse.json().catch(() => ({}))

    if (!dcsResponse.ok) {
      // Pass through error message from DCS if available
      return NextResponse.json(
        data && typeof data === "object" ? data : { message: "Login failed" },
        { status: dcsResponse.status }
      )
    }

    const userData = data?.data ?? data?.user ?? data

    const normalizedResponse = {
      user: {
        id: Number(userData?.id ?? 0),
        email: String(userData?.email ?? email),
        full_name: String(userData?.full_name ?? userData?.name ?? userData?.username ?? ""),
        username: String(
          userData?.username ??
            userData?.email?.split?.("@")?.[0] ??
            email.split("@")[0]
        ),
        is_active: Boolean(userData?.is_active ?? true),
        is_verified: Boolean(userData?.is_verified ?? true),
        created_at: String(userData?.created_at ?? new Date().toISOString()),
        updated_at: String(userData?.updated_at ?? new Date().toISOString()),
      },
      tokens: {
        access_token: String(
          userData?.access_token ?? userData?.token ?? data?.access_token ?? data?.token ?? ""
        ),
        refresh_token: String(
          userData?.refresh_token ?? data?.refresh_token ?? ""
        ),
        token_type: "Bearer",
      },
    }

    return NextResponse.json(normalizedResponse)
  } catch (error: any) {
    console.error("Error in /api/auth/login route:", error)
    return NextResponse.json(
      { message: error?.message ?? "Unexpected error during login" },
      { status: 500 }
    )
  }
}

