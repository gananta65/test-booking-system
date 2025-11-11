import fetch from "node-fetch"

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "your-secret-key"

export async function sendReminders() {
  try {
    const response = await fetch(`${API_URL}/api/reminders/send`, {
      method: "POST",
      headers: {
        "x-api-key": INTERNAL_API_KEY,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    console.log("[CRON] Reminder job completed:", data)
    return data
  } catch (error) {
    console.error("[CRON] Failed to send reminders:", error)
    throw error
  }
}

// Export for edge runtime (Vercel cron)
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const result = await sendReminders()
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to send reminders" })
  }
}
