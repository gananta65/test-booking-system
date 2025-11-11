import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Barber Booking</h1>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-balance">Book Your Perfect Barber Appointment</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Find and book appointments with professional barbers in your area. Easy scheduling, instant confirmations,
            and automated reminders.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/barbers">Browse Barbers</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Register as Barber</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse available barbers and book appointments in just a few clicks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instant Confirmation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get confirmed bookings and email notifications instantly.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Receive automatic reminders 1 hour before your appointment.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
