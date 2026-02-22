const encoder = new TextEncoder()

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

export const hashPassword = async (password: string) => {
  const data = encoder.encode(`youth-affairs::${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(new Uint8Array(digest))
}

export const verifyPassword = async (plainPassword: string, hashedPassword: string) => {
  const computed = await hashPassword(plainPassword)
  return computed === hashedPassword
}