import { supabase } from '@/lib/supabase'

export class AttendanceRepository {
  /**
   * Find class schedule details by ID.
   */
  async findScheduleById(scheduleId: string) {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        course:courses(*),
        lecturer:lecturers(*),
        classroom:classrooms(*),
        semester:semesters(*)
      `)
      .eq('id', scheduleId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  /**
   * Find any currently active (open) session for a specific schedule.
   * Enforces soft-delete filter by requiring deleted_at IS NULL.
   */
  async findActiveSessionBySchedule(scheduleId: string) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('schedule_id', scheduleId)
      .eq('is_open', true)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) throw error
    return data
  }

  /**
   * Insert a new attendance session record.
   */
  async createSession(sessionData: {
    schedule_id: string
    lecturer_id: string
    academic_year_id: string
    token: string
    berita_acara: string
    mode: 'daring' | 'luring'
    pertemuan: number
    status: 'Selesai' | 'Aktif' | 'Draft'
    is_open: boolean
  }) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Mark a session as closed (is_open = false).
   */
  async closeSession(sessionId: string) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .update({
        is_open: false,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Soft-delete an attendance session by setting its deleted_at timestamp.
   */
  async softDeleteSession(sessionId: string) {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
