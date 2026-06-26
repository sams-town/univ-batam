import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, type, photoUrl, location } = await request.json()
    
    // First, get the current time using Supabase
    const { data: timeData, error: timeError } = await supabase
      .rpc('get_current_timestamp')
    
    let timestamp: Date
    if (timeError || !timeData) {
      timestamp = new Date()
    } else {
      timestamp = new Date(timeData)
    }

    // Mock lateness calculation based on admin-set threshold (8:00 AM)
    let isLate = false
    let lateMinutes = 0
    if (type === 'in') {
      const hour = timestamp.getHours()
      const minute = timestamp.getMinutes()
      if (hour > 8 || (hour === 8 && minute > 0)) {
        isLate = true
        lateMinutes = (hour - 8) * 60 + minute
      }
    }

    // Insert into attendance table (mock, replace with your real table)
    // For now, we'll just return success with the data
    return NextResponse.json({
      success: true,
      timestamp: timestamp.toISOString(),
      formattedTime: timestamp.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      }),
      isLate,
      lateMinutes,
      type,
      message: 'Absensi berhasil dicatat!'
    })
  } catch (error) {
    console.error('Error recording attendance:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mencatat absensi' },
      { status: 500 }
    )
  }
}
