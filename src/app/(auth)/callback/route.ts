import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // If there's no specific "next" destination, default to the dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                request.cookies.set(name, value)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )
    
    // Exchange the Google code for a secure session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Success! They have the cookie. Send them to the dashboard safely.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If the code was invalid or missing, kick them back to the login page
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}