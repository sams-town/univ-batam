export interface Profile {
  id: string
  role_id?: string
  first_name?: string
  last_name?: string
  email?: string
  avatar_url?: string
  phone?: string
  address_ktp?: string
  address_domicile?: string
  gender?: "laki-laki" | "perempuan" | ""
  place_of_birth?: string
  date_of_birth?: string
  // role can be a plain string (from migration 007 role VARCHAR column)
  // or a joined object { id, name } from older select('*, role:roles(*)')
  role?: string | {
    id?: string
    name: string
  }
}

export interface Student {
  id: string
  nim?: string
  program_id?: string
  profile_id?: string
  enrollment_year?: number
}

export interface Program {
  id: string
  name?: string
  department_id?: string
}

export interface Department {
  id: string
  name?: string
  faculty_id?: string
}

export interface Faculty {
  id: string
  name?: string
}

export interface Lecturer {
  id: string
  nip?: string
  profile_id?: string
}

export interface SKSPayment {
  id: string
  student_id?: string
  semester_id?: string
  semester?: { id?: string; name: string; [key: string]: any }
  status?: "paid" | "pending" | "overdue"
  total_amount?: number
  total_credits?: number
  credit_price?: number
  due_date?: Date | string
  payment_date?: Date | string
  payment_method?: string
  transaction_id?: string
  created_at?: Date | string
  updated_at?: Date | string
}

export interface PaymentItem {
  id: string
  payment_id?: string
  course_id?: string
  course_name?: string
  credits?: number
  price?: number
  created_at?: Date | string
  name?: string
  amount?: number
}

export interface TarifDosen {
  id: string
  dosen_id: string
  status_dosen: string
  tarif_daring: number
  tarif_luring: number
  gaji_pokok: number
  tunjangan: number
  is_active: boolean
  created_at?: Date | string
  updated_at?: Date | string
  dosen?: Lecturer & { profile?: Profile }
}

export interface PayrollDosen {
  id: string
  periode: string
  dosen_id: string
  gaji_pokok: number
  insentif_daring: number
  insentif_luring: number
  tunjangan: number
  potongan: number
  total_gaji: number
  status: 'Draft' | 'Locked' | 'Cancelled'
  created_at?: Date | string
  updated_at?: Date | string
  dosen?: Lecturer & { 
    profile?: Profile
    department?: Department & { faculty?: Faculty } 
  }
}

export interface PayrollDosenDetail {
  id: string
  payroll_id: string
  session_id: string
  jadwal_id: string
  pertemuan: number
  mode: 'daring' | 'luring'
  sks: number
  tarif: number
  jumlah: number
  created_at?: Date | string
}

