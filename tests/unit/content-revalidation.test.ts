import { beforeEach, describe, expect, it, vi } from 'vitest'

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath }))

import { triggerTargetedRevalidation } from '../../src/lib/cache/revalidate'

describe('content revalidation', () => {
  beforeEach(() => revalidatePath.mockReset())

  it('invalidates home and affected public pages after settings updates', () => {
    triggerTargetedRevalidation('settings')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/about')
    expect(revalidatePath).toHaveBeenCalledWith('/contact')
  })

  it('surfaces revalidation failure to the admin mutation handler', () => {
    revalidatePath.mockImplementationOnce(() => { throw new Error('cache unavailable') })
    expect(() => triggerTargetedRevalidation('settings')).toThrow('cache unavailable')
  })
})
