function encodeCredential(value: string): string {
  return encodeURIComponent(value)
}

export function buildPostgresUrl(fallback?: string): string {
  const user = process.env['POSTGRES_USER']
  const password = process.env['POSTGRES_PASSWORD']
  const database = process.env['POSTGRES_DB']

  if (!user || !password || !database) {
    return fallback ?? process.env['DATABASE_URL'] ?? process.env['DIRECT_URL'] ?? ''
  }

  const host = process.env['POSTGRES_HOST'] ?? 'localhost'
  // Inside Docker Compose the service name resolves on the internal port (5432).
  // Outside Docker (local dev) the container is mapped to POSTGRES_HOST_PORT (default 5433).
  const isDockerHost = host === 'db' || host === 'postgres'
  const port = isDockerHost
    ? (process.env['POSTGRES_PORT'] ?? '5432')
    : (process.env['POSTGRES_HOST_PORT'] ?? process.env['POSTGRES_PORT'] ?? '5432')

  return `postgresql://${encodeCredential(user)}:${encodeCredential(password)}@${host}:${port}/${database}?schema=public`
}
