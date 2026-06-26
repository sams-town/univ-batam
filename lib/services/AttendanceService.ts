import { AttendanceRepository } from '../repositories/AttendanceRepository'

export class AttendanceService {
  private repository: AttendanceRepository

  constructor() {
    this.repository = new AttendanceRepository()
  }

  /**
   * Business logic for opening a new class session (generating token).
   * Validates schedule, checks for active duplication, and links academic year context.
   */
  async openClassSession(params: {
    scheduleId: string
    lecturerId: string
    token: string
    beritaAcara: string
    mode: 'daring' | 'luring'
    pertemuan: number
  }) {
    const { scheduleId, lecturerId, token, beritaAcara, mode, pertemuan } = params

    // 1. Fetch and validate schedule
    const schedule = await this.repository.findScheduleById(scheduleId)
    if (!schedule) {
      throw new Error('Jadwal perkuliahan tidak ditemukan.')
    }

    // 2. Validate lecturer owns this schedule
    if (schedule.lecturer_id !== lecturerId) {
      throw new Error('Anda tidak memiliki wewenang untuk membuka sesi pada jadwal ini.')
    }

    // 3. Prevent duplicate active sessions
    const activeSession = await this.repository.findActiveSessionBySchedule(scheduleId)
    if (activeSession) {
      throw new Error('Sesi perkuliahan untuk jadwal ini sudah aktif dan sedang berjalan.')
    }

    // 4. Resolve Academic Year ID
    const academicYearId = schedule.academic_year_id || schedule.semester?.academic_year_id
    if (!academicYearId) {
      throw new Error('Tahun Akademik aktif tidak dapat dikonfirmasi untuk jadwal ini.')
    }

    // 5. Create new session via Repository
    const newSession = await this.repository.createSession({
      schedule_id: scheduleId,
      lecturer_id: lecturerId,
      academic_year_id: academicYearId,
      token,
      berita_acara: beritaAcara,
      mode,
      pertemuan,
      status: 'Aktif',
      is_open: true
    })

    return newSession
  }
}
