import TicketSuccessClient from '@/components/ui/TicketSuccessClient'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export const metadata = { title: 'Ticket Confirmed — LSCE 2026' }

export default function TicketSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#F7F5F2] min-h-screen">
        <TicketSuccessClient />
      </main>
      <Footer />
    </>
  )
}
