interface GetAddressFields {
  streetPurok?: string | null
  municipality?: string | null
  barangay?: string | null
}

export const getAddress = <T extends GetAddressFields>(address: T | null | undefined, defaultValue = 'Unknown'): string => {
  if (!address) return defaultValue

  const barangayMunicipality = [address.barangay, address.municipality]
    .map(v => v?.trim())
    .filter(Boolean)
    .join(', ')

  return (
    [address.streetPurok?.trim(), barangayMunicipality]
      .filter(Boolean)
      .join(', ') || defaultValue
  )
}
