import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const folder = url.searchParams.get("folder") || "uploads"
  const timestamp = Math.round(new Date().getTime() / 1000)

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 })
  }

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex")

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
  })
}
