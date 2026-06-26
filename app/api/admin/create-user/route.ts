import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      gender, 
      placeOfBirth, 
      dateOfBirth, 
      addressKtp, 
      addressDomicile, 
      roleName, // 'pegawai' or 'dosen'
      details // { nip, status } for pegawai, or { nip, department_id } for dosen
    } = body

    if (!email || !password || !roleName) {
      return NextResponse.json({ error: 'Email, password, and roleName are required' }, { status: 400 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL environment variable is missing on server' }, { status: 500 })
    }

    if (!serviceRoleKey) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY is missing on the server environment. Please configure it in .env.local.' 
      }, { status: 500 })
    }

    // Initialize Supabase client with SERVICE_ROLE_KEY (bypassing RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Create the user in auth.users using admin client
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: roleName
      }
    })

    if (createError) {
      return NextResponse.json({ error: `Auth user creation failed: ${createError.message}` }, { status: 400 })
    }

    const userId = userData.user.id

    // 2. Fetch the role_id from database corresponding to roleName
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .maybeSingle()

    if (roleError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: `Failed to fetch role: ${roleError.message}` }, { status: 400 })
    }

    if (!roleData) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: `Role '${roleName}' does not exist in 'roles' table.` }, { status: 400 })
    }

    // 3. Create the profile row in profiles table, setting ID to the same auth userId
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        gender: gender || null,
        place_of_birth: placeOfBirth || null,
        date_of_birth: dateOfBirth || null,
        address_ktp: addressKtp || null,
        address_domicile: addressDomicile || null,
        role_id: roleData.id,
        role: roleName
      }])

    if (profileError) {
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: `Failed to insert profile record: ${profileError.message}` }, { status: 400 })
    }

    // 4. Create role-specific record (employees or lecturers)
    if (roleName === 'pegawai' || roleName === 'karyawan') {
      const { error: employeeError } = await supabaseAdmin
        .from('employees')
        .insert([{
          profile_id: userId,
          nip: details?.nip || '',
          status: details?.status || 'Tetap'
        }])

      if (employeeError) {
        // Rollback: delete profile & delete auth user
        await supabaseAdmin.from('profiles').delete().eq('id', userId)
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return NextResponse.json({ error: `Failed to insert employee record: ${employeeError.message}` }, { status: 400 })
      }
    } else if (roleName === 'dosen') {
      const { error: lecturerError } = await supabaseAdmin
        .from('lecturers')
        .insert([{
          profile_id: userId,
          nip: details?.nip || '',
          department_id: details?.department_id || null
        }])

      if (lecturerError) {
        // Rollback: delete profile & delete auth user
        await supabaseAdmin.from('profiles').delete().eq('id', userId)
        await supabaseAdmin.auth.admin.deleteUser(userId)
        return NextResponse.json({ error: `Failed to insert lecturer record: ${lecturerError.message}` }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, userId })
  } catch (err: any) {
    console.error('Unhandled admin create-user error:', err)
    return NextResponse.json({ error: `Internal Server Error: ${err.message}` }, { status: 500 })
  }
}
