import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/register']
const protectedPaths = ['/problems', '/submissions', '/dashboard', '/teacher']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static files
  if (publicPaths.some(p => pathname.startsWith(p)) ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Protect page routes - redirect to login if no token
  if (protectedPaths.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.slice(7)
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)'],
}
