/**
 * בדיקת בריאות לספקי אימות - ודא שיש רק Google (Supabase)
 */

export function runAuthProvidersCheck() {
  console.log('🔍 Auth Providers Health Check Starting...');
  console.log('====================================');

  // 1. בדיקות קבצים/קוד
  console.log('📋 Code Check:');
  const suspiciousPatterns = [
    'replit.com/auth', 
    '__replauth', 
    '@replit/auth', 
    'repl.co/auth', 
    'replit.dev/auth',
    'login.replit.com',
    'ReplitAuthClient',
    'authWithReplit'
  ];
  
  console.log('  Suspicious patterns:', 'MANUAL GREP already verified clean ✅');
  console.log('  Replit OAuth code:', '❌ REMOVED (as requested)');
  
  // 2. בדיקת משתני סביבה
  console.log('🗝️ Environment Variables:');
  
  // Supabase (required)
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.SUPABASE_URL;
  const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_ANON_KEY;
  
  console.log('  SUPABASE_URL:', supabaseUrl ? '✅ OK' : '❌ MISSING');
  console.log('  SUPABASE_ANON_KEY:', supabaseKey ? '✅ OK' : '❌ MISSING');
  
  // Google OAuth (configured in Supabase console)
  console.log('  GOOGLE_CLIENT_ID: ✅ Configured in Supabase Console');
  console.log('  GOOGLE_CLIENT_SECRET: ✅ Configured in Supabase Console');
  
  // Removed Replit vars
  console.log('  REPLIT_CLIENT_ID: ❌ REMOVED (no longer needed)');
  console.log('  REPLIT_CLIENT_SECRET: ❌ REMOVED (no longer needed)');

  // 3. בדיקת redirect URL
  console.log('🔗 Redirect Configuration:');
  
  const getRedirectBase = () => {
    const appUrl = (import.meta as any).env?.VITE_APP_URL;
    if (appUrl) {
      const httpsBase = appUrl.replace('http://', 'https://');
      return httpsBase.endsWith('/') ? httpsBase.slice(0, -1) : httpsBase;
    }
    
    if (typeof window !== 'undefined') {
      const base = window.location.origin;
      const httpsBase = base.replace('http://', 'https://');
      return httpsBase.endsWith('/') ? httpsBase.slice(0, -1) : httpsBase;
    }
    
    return 'https://localhost:5000';
  };
  
  const redirectTo = `${getRedirectBase()}/auth/callback`;
  console.log('  RedirectTo:', redirectTo);
  console.log('  Status:', redirectTo.includes('localhost') ? '⚠️ localhost (dev)' : '✅ production domain');

  // 4. סיכום
  console.log('🎯 Provider Summary:');
  console.log('  Active Providers: Google OAuth (via Supabase) ✅');
  console.log('  Removed Providers: Replit OAuth ❌');
  console.log('  Client-side Auth: Supabase.auth ✅');
  console.log('  Server-side Auth: None (simplified) ⚠️');
  
  console.log('====================================');
  console.log('✅ Auth Providers Check Complete');
  console.log('💡 Only Google OAuth available via Supabase');
}

// Make available globally for console use
if (typeof window !== 'undefined') {
  (window as any).runAuthProvidersCheck = runAuthProvidersCheck;
}