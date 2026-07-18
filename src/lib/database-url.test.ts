import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildPostgresUrl } from './database-url'

// Helper — set env vars for a test block and restore afterwards
function withEnv(vars: Record<string, string>, fn: () => void) {
  const original: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const [k, v] of Object.entries(vars)) {
      original[k] = process.env[k]
      process.env[k] = v
    }
  })

  afterEach(() => {
    for (const k of Object.keys(vars)) {
      if (original[k] === undefined) delete process.env[k]
      else process.env[k] = original[k]
    }
  })

  fn()
}

describe('buildPostgresUrl', () => {
  describe('local dev (POSTGRES_HOST=localhost)', () => {
    withEnv(
      {
        POSTGRES_USER: 'root',
        POSTGRES_PASSWORD: 'password',
        POSTGRES_DB: 'doc-editor',
        POSTGRES_HOST: 'localhost',
        POSTGRES_HOST_PORT: '5433',
        POSTGRES_PORT: '5432',
      },
      () => {
        it('uses POSTGRES_HOST_PORT for local connections', () => {
          expect(buildPostgresUrl()).toBe(
            'postgresql://root:password@localhost:5433/doc-editor?schema=public',
          )
        })
      },
    )
  })

  describe('docker compose (POSTGRES_HOST=db)', () => {
    withEnv(
      {
        POSTGRES_USER: 'root',
        POSTGRES_PASSWORD: 'password',
        POSTGRES_DB: 'doc-editor',
        POSTGRES_HOST: 'db',
        POSTGRES_PORT: '5432',
      },
      () => {
        it('uses POSTGRES_PORT for docker internal connections', () => {
          expect(buildPostgresUrl()).toBe(
            'postgresql://root:password@db:5432/doc-editor?schema=public',
          )
        })
      },
    )
  })

  describe('special characters in credentials', () => {
    withEnv(
      {
        POSTGRES_USER: 'user@name',
        POSTGRES_PASSWORD: 'p@ss:word',
        POSTGRES_DB: 'doc-editor',
        POSTGRES_HOST: 'localhost',
        POSTGRES_HOST_PORT: '5433',
      },
      () => {
        it('URL-encodes special characters in user and password', () => {
          const url = buildPostgresUrl()
          expect(url).toContain('user%40name')
          expect(url).toContain('p%40ss%3Aword')
        })
      },
    )
  })

  describe('missing credentials', () => {
    withEnv({ POSTGRES_USER: '', POSTGRES_PASSWORD: '', POSTGRES_DB: '' }, () => {
      it('returns the fallback string when credentials are missing', () => {
        expect(buildPostgresUrl('fallback-url')).toBe('fallback-url')
      })
    })
  })
})
