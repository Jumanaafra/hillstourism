import { describe, it, expect, beforeEach } from 'vitest'
import {
  createHotel,
  updateHotel,
  getHotels,
  _resetMemoryHotels,
} from '../../src/lib/repositories/hotels.repo'
import {
  createVehicle,
  updateVehicle,
  getVehicles,
  _resetMemoryVehicles,
} from '../../src/lib/repositories/vehicles.repo'

describe('Hotel Uniqueness Enforcement (spec.md Section 7.2)', () => {
  beforeEach(() => {
    _resetMemoryHotels([])
  })

  it('allows creating a hotel with a unique name', async () => {
    const hotel = await createHotel({
      name: 'Misty Pines Homestay',
      location: 'Munnar',
      category: 'Normal',
      amenities: ['View', 'Wi-Fi'],
      active: true,
    })

    expect(hotel.name).toBe('Misty Pines Homestay')
    expect(hotel.normalizedName).toBe('misty pines homestay')
    const list = await getHotels(false)
    expect(list.length).toBe(1)
  })

  it('strictly rejects creating a hotel with duplicate normalized name regardless of casing/spacing', async () => {
    await createHotel({
      name: 'Highland Retreat',
      location: 'Ooty',
      category: 'Premium',
      amenities: ['Heater'],
      active: true,
    })

    // Attempt 1: different casing
    await expect(
      createHotel({
        name: 'HIGHLAND RETREAT',
        location: 'Ooty',
        category: 'Premium',
        amenities: [],
        active: true,
      })
    ).rejects.toThrow(/already exists/)

    // Attempt 2: extra leading and repeated spacing
    await expect(
      createHotel({
        name: '  highland   retreat  ',
        location: 'Ooty',
        category: 'Premium',
        amenities: [],
        active: true,
      })
    ).rejects.toThrow(/already exists/)
  })

  it('rejects renaming a hotel to a name already used by another hotel', async () => {
    const h1 = await createHotel({
      name: 'Tea Valley Homestay',
      location: 'Munnar',
      category: 'Normal',
      amenities: [],
      active: true,
    })

    const h2 = await createHotel({
      name: 'Cloud View Resort',
      location: 'Coorg',
      category: 'Premium',
      amenities: [],
      active: true,
    })

    // Renaming h2 to h1's name should be blocked
    await expect(
      updateHotel(h2.id, { name: 'tea valley homestay' })
    ).rejects.toThrow(/already exists/)

    // Renaming h2 to its own name (or same normalized identity) should succeed
    const updated = await updateHotel(h2.id, { name: 'Cloud View Resort', description: 'Updated description' })
    expect(updated.description).toBe('Updated description')
  })
})

describe('Vehicle Number Plate Uniqueness Enforcement (spec.md Section 8)', () => {
  beforeEach(() => {
    _resetMemoryVehicles([])
  })

  it('allows creating a vehicle with a unique plate', async () => {
    const v = await createVehicle({
      name: 'Innova Crysta Luxury',
      numberPlate: 'TN 01 AB 1234',
      type: 'SUV',
      capacity: 7,
      driverAvailable: true,
      localRoutes: true,
      flexiblePickup: true,
      features: ['AC'],
      active: true,
    })

    expect(v.normalizedNumberPlate).toBe('TN01AB1234')
  })

  it('strictly rejects duplicate vehicle plate identities', async () => {
    await createVehicle({
      name: 'Fleet Car 1',
      numberPlate: 'TN 01 AB 1234',
      type: 'SUV',
      capacity: 7,
      driverAvailable: true,
      localRoutes: true,
      flexiblePickup: true,
      features: [],
      active: true,
    })

    // Attempt duplicate with lowercase and hyphens
    await expect(
      createVehicle({
        name: 'Fleet Car 2',
        numberPlate: 'tn-01-ab-1234',
        type: 'SUV',
        capacity: 7,
        driverAvailable: true,
        localRoutes: true,
        flexiblePickup: true,
        features: [],
        active: true,
      })
    ).rejects.toThrow(/already exists/)
  })
})
