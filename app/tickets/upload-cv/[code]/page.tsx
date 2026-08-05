import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import CVUploadForm from '@/components/ui/CVUploadForm'

export const metadata = { title: 'Upload Your CV — LSCE 2026' }

export default async function CVUploadPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F5F2] min-h-screen">
        <div className="section-container pt-[130px] pb-[100px] flex flex-col items-center">
          <CVUploadForm code={code.toUpperCase()} />
        </div>
      </main>
      <Footer />
    </>
  )
}
