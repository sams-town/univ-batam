import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AttendanceService } from '@/lib/services/AttendanceService'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  // 1. Authenticate user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Harap login terlebih dahulu.' }, { status: 401 })
  }

  // 2. Fetch profile to verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, role:roles(name)')
    .eq('id', session.user.id)
    .maybeSingle()

  const role = profile?.role?.name || ''
  if (role !== 'dosen' && role !== 'super_admin' && role !== 'admin_akademik') {
    return NextResponse.json({ error: 'Forbidden. Hanya dosen yang dapat membuka sesi kelas.' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { scheduleId, token, beritaAcara, mode, pertemuan } = body

    // Strict payload validation
    if (!scheduleId || !token || !beritaAcara || !mode || !pertemuan) {
      return NextResponse.json({ error: 'Bad Request. Seluruh field wajib diisi.' }, { status: 400 })
    }

    // Resolve Lecturer ID associated with the logged-in user
    let lecturerId = ''
    if (role === 'dosen') {
      const { data: lecturer } = await supabase
        .from('lecturers')
        .select('id')
        .eq('profile_id', session.user.id)
        .maybeSingle()

      if (!lecturer) {
        return NextResponse.json({ error: 'Profil Dosen tidak ditemukan.' }, { status: 404 })
      }
      lecturerId = lecturer.id
    } else {
      // Admins can open session on behalf of the schedule's lecturer
      const { data: schedule } = await supabase
        .from('schedules')
        .select('lecturer_id')
        .eq('id', scheduleId)
        .maybeSingle()
      lecturerId = schedule?.lecturer_id || ''
    }

    // 3. Execute business logic via Service Layer
    const service = new AttendanceService()
    const newSession = await service.openClassSession({
      scheduleId,
      lecturerId,
      token,
      beritaAcara,
      mode,
      pertemuan
    })

    return NextResponse.json({
      success: true,
      message: 'Sesi kelas berhasil dibuka!',
      data: newSession
    })

  } catch (err: any) {
    console.error('Error in open-class API controller:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Terjadi kesalahan internal server.'
    }, { status: 500 })
  }
}
