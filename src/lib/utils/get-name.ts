interface GetNameFields {
  firstName: string | null | undefined
  lastName: string | null | undefined
  nickName: string | null | undefined
}

/**
 * Returns a formatted string name from a user object context.
 * Accepts any object containing at least firstName, lastName, or nickName properties.
 */
export const getName = <T extends GetNameFields>(name?: T): string => {
  if (!name) return 'Unknown'
  const nick = name.nickName?.trim()
  if (nick) return nick

  return (
    [name.firstName, name.lastName]
      .map(val => val?.trim())
      .filter(Boolean)
      .join(' ') || 'Unknown'
  )
}
