import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/register']
const apiPaths = ['/api/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and static files
  if (publicPaths.some(p => pathname.startsWith(p)) ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // API routes handle their own auth - pass through
  if (apiPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protect page routes - redirect to login if no token
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.slice(7)

  if (!token && (pathname.startsWith('/problems') || pathname.startsWith('/submissions'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
}
