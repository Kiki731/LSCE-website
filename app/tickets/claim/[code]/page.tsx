import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import TicketClaimForm from '@/components/ui/TicketClaimForm'

export const metadata = { title: 'Claim Your Ticket — LSCE 2026' }

export default async function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F5F2] min-h-screen">
        <div className="section-container pt-[130px] pb-[100px] flex flex-col items-center">
          <TicketClaimForm code={code.toUpperCase()} />
        </div>
      </main>
      <Footer />
    </>
  )
}
