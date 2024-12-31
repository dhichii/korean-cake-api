export function createAuthCookieOpts(exp?: number) {
  return {
    httpOnly: true,
    sameSite:
      process.env.ENV === 'prod' ? ('none' as const) : ('strict' as const),
    maxAge: exp,
    secure: process.env.ENV === 'prod',
  };
}
