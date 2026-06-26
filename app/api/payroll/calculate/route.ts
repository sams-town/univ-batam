import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { dosenId, periodStart, periodEnd } = await request.json()

    // For now, return dummy data (since Supabase function is not deployed yet)
    const dummyData = {
      total_sesi: 10,
      total_honorarium: 5000000,
      breakdown: [
        {
          metode: 'Teori',
          sesi: 6,
          nominal_per_sesi: 500000,
          subtotal: 3000000
        },
        {
          metode: 'Praktikum',
          sesi: 4,
          nominal_per_sesi: 500000,
          subtotal: 2000000
        }
      ]
    }

    console.log(`Calculating payroll for dosen ${dosenId} (${periodStart} to ${periodEnd})`)

    return NextResponse.json({ success: true, data: dummyData })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

