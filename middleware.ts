import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Cek User
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Helper untuk cek area (Gunakan pengecekan yang lebih spesifik agar tidak bentrok dengan /mentors)
  const isAdminArea = path === '/admin' || path.startsWith('/admin/');
  const isMentorArea = path === '/mentor' || path.startsWith('/mentor/');
  const isStudentArea = path === '/student' || path.startsWith('/student/');

  // 2. Proteksi Halaman Login (Kalau udah login, jangan kasih masuk halaman login lagi)
  if (user && path.startsWith('/login')) {
     // Cek role untuk redirect yang benar (opsional, default ke student atau ambil dari metadata)
     return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // 3. Proteksi Route Dashboard (Wajib Login)
  if (!user && (isAdminArea || isMentorArea || isStudentArea)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Proteksi Role (RBAC) - Cek Metadata Role
  if (user) {
    // Kita ambil role dari user_metadata (Ini diset saat login/signup)
    // CATATAN: Pastikan saat create user, metadata 'role' diisi.
    const userRole = user.user_metadata?.role; // 'admin' | 'mentor' | 'student'

    // A. Student coba masuk Admin/Mentor
    if (userRole === 'student' && (isAdminArea || isMentorArea)) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }

    // B. Mentor coba masuk Admin
    if (userRole === 'mentor' && isAdminArea) {
      return NextResponse.redirect(new URL('/mentor/dashboard', request.url));
    }
    
    // C. Admin nyasar ke Student Dashboard -> Pindahkan ke Admin Dashboard
    if (userRole === 'admin' && isStudentArea) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    // D. Admin nyasar ke Mentor Dashboard -> Pindahkan ke Admin Dashboard (Opsional)
    if (userRole === 'admin' && isMentorArea) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};