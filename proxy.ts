import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Initialize Supabase Client inside Proxy
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Retrieve authenticated user info safely
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Redirect to login if user is unauthenticated and attempting to visit dashboard
  if (!user && pathname.startsWith('/dashboard')) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  // If user is authenticated, check their role and protect dashboard sections
  if (user && pathname.startsWith('/dashboard')) {
    // Read role directly from raw metadata (set by database trigger on auth.users)
    const role = user.user_metadata?.role || user.app_metadata?.role || 'mahasiswa'

    // Admin & HRIS check: only admin/superadmin roles allowed
    if (pathname.startsWith('/dashboard/admin') && !['super_admin', 'admin', 'admin_akademik'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Lecturer/KBM check: only dosen role allowed
    if (pathname.startsWith('/dashboard/lecturer') && role !== 'dosen') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Student/KRS check: only mahasiswa role allowed
    if (pathname.startsWith('/dashboard/student') && role !== 'mahasiswa') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Employee check: only employees allowed
    if (pathname.startsWith('/dashboard/employee') && !['employee', 'karyawan', 'pegawai'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  // Protect all dashboard paths and handle session refresh
  matcher: ['/dashboard/:path*', '/login'],
}
