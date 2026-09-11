'use client'

import React, { useState, useEffect } from 'react'
import type { Package, ItineraryDay, Hotel, Vehicle, Category, Experience, Testimonial, SocialLink, PageSEO } from '@/types/domain'
import type { GalleryPhoto } from '@/lib/repositories/gallery.repo'
import ImageUploadField from '@/components/admin/ImageUploadField'
import { getOptimizedImageUrl } from '@/lib/cloudinary/transform'
import { FiCheck, FiAlertTriangle, FiMail, FiBarChart2, FiStar, FiCalendar, FiArrowUpRight, FiX, FiArrowRight, FiPlus, FiTrash2, FiEdit2, FiCopy, FiGlobe, FiShare2, FiExternalLink, FiRefreshCw } from 'react-icons/fi'
import { FaStar, FaWhatsapp, FaInstagram, FaFacebookF, FaYoutube, FaTwitter } from 'react-icons/fa'

type Tab = 'overview' | 'enquiries' | 'packages' | 'hotels' | 'vehicles' | 'gallery' | 'content' | 'knowledge' | 'library' | 'social' | 'seo' | 'settings'

export default function AdminDashboardPage() {
  const [token, setToken] = useState(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/)
      return match ? decodeURIComponent(match[1]) : ''
    }
    return ''
  })
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([])
  const [knowledge, setKnowledge] = useState<any[]>([])
  const [contentData, setContentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filter state for enquiries
  const [enqSearch, setEnqSearch] = useState('')
  const [enqStatusFilter, setEnqStatusFilter] = useState('')

  // Package editor state
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)

  // Hotel editor state
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)

  // Vehicle editor state
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  // Gallery editor state
  const [editingGalleryPhoto, setEditingGalleryPhoto] = useState<GalleryPhoto | null>(null)
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({ src: '', alt: '', category: 'General', displayOrder: 99 })

  // Content CRUD states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ title: '', slug: '', subtitle: '', description: '', image: '', badge: '', color: '#0ea5e9', active: true })

  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({ title: '', subtitle: '', description: '', image: '', duration: 'Half Day', difficulty: 'Easy', location: 'Munnar', icon: 'Compass', highlights: [], active: true })

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({ name: '', trip: '', location: '', rating: 5, review: '', avatar: '', initials: '', active: true })

  // Image Library state
  const [libraryFolder, setLibraryFolder] = useState('packages')
  const [libraryUploadedImages, setLibraryUploadedImages] = useState<Array<{ url: string; publicId?: string; folder: string; date: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('hills_admin_uploaded_images')
        return saved ? JSON.parse(saved) : []
      } catch { return [] }
    }
    return []
  })

  // Forms
  const [newHotel, setNewHotel] = useState({ name: '', location: '', category: 'Normal', pricePerNight: '₹3,500', amenities: 'Mountain View, Wi-Fi', image: '' })
  const [newVehicle, setNewVehicle] = useState({ name: '', numberPlate: '', type: 'SUV', capacity: 7, image: '' })
  const [newKnowledge, setNewKnowledge] = useState({ title: '', content: '', category: 'general', keywords: '' })

  // Social Links state
  const [socialList, setSocialList] = useState<SocialLink[]>([])
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null)
  const [isCreatingSocial, setIsCreatingSocial] = useState(false)
  const [socialForm, setSocialForm] = useState<{ platform: string; url: string; active: boolean; order: number }>({
    platform: 'instagram',
    url: '',
    active: true,
    order: 10,
  })

  // SEO CMS state
  const [seoList, setSeoList] = useState<PageSEO[]>([])
  const [editingSEO, setEditingSEO] = useState<PageSEO | null>(null)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [enqRes, hotRes, vehRes, pkgRes, galRes] = await Promise.all([
        fetch('/api/enquiries', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/hotels', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/vehicles', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/packages', { headers }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/gallery', { headers }).then(r => r.json()).catch(() => ({ success: false })),
      ])

      if (enqRes.success) setEnquiries(enqRes.data || [])
      if (hotRes.success) setHotels(hotRes.data || [])
      if (vehRes.success) setVehicles(vehRes.data || [])
      if (pkgRes.success) setPackages(pkgRes.data || [])
      if (galRes.success) setGalleryPhotos(galRes.data || [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content', { headers })
      const data = await res.json()
      if (data.success) setContentData(data.data)
    } catch (err) {
      console.error('Failed to load content:', err)
    }
  }

  const fetchKnowledge = async () => {
    try {
      const res = await fetch('/api/admin/chat-knowledge', { headers })
      const data = await res.json()
      if (data.success) setKnowledge(data.data || [])
    } catch (err) {
      console.error('Failed to load knowledge:', err)
    }
  }

  const fetchSocialLinks = async () => {
    try {
      const res = await fetch('/api/admin/social', { headers })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setSocialList(data.data)
      }
    } catch (err) {
      console.error('Failed to load social links:', err)
    }
  }

  const fetchSEOList = async () => {
    try {
      const res = await fetch('/api/admin/seo', { headers })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setSeoList(data.data)
      }
    } catch (err) {
      console.error('Failed to load SEO pages:', err)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [token])

  useEffect(() => {
    if (activeTab === 'content') fetchContent()
    if (activeTab === 'knowledge') fetchKnowledge()
    if (activeTab === 'social') fetchSocialLinks()
    if (activeTab === 'seo') fetchSEOList()
    if (activeTab === 'settings') fetchContent()
  }, [activeTab])

  // ── Handlers ──

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socialForm.url.trim()) {
      showMsg('error', 'URL is required.')
      return
    }
    try {
      const parsed = new URL(socialForm.url.trim())
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        showMsg('error', 'URL must start with http:// or https://')
        return
      }
    } catch {
      showMsg('error', 'Please enter a valid URL (including https://).')
      return
    }

    try {
      if (editingSocial) {
        const res = await fetch('/api/admin/social', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ id: editingSocial.id, ...socialForm }),
        })
        const data = await res.json()
        if (data.success) {
          showMsg('success', 'Social link updated!')
          setEditingSocial(null)
          fetchSocialLinks()
        } else {
          showMsg('error', data.error?.message || 'Failed to update social link.')
        }
      } else {
        const res = await fetch('/api/admin/social', {
          method: 'POST',
          headers,
          body: JSON.stringify(socialForm),
        })
        const data = await res.json()
        if (data.success) {
          showMsg('success', 'Social link created!')
          setIsCreatingSocial(false)
          setSocialForm({ platform: 'instagram', url: '', active: true, order: 10 })
          fetchSocialLinks()
        } else {
          showMsg('error', data.error?.message || 'Failed to create social link.')
        }
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleToggleSocialActive = async (item: SocialLink) => {
    try {
      const res = await fetch('/api/admin/social', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id: item.id, active: !item.active }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Social link ${!item.active ? 'activated' : 'disabled'}!`)
        fetchSocialLinks()
      } else {
        showMsg('error', data.error?.message || 'Failed to toggle status.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeleteSocial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return
    try {
      const res = await fetch(`/api/admin/social?id=${id}`, {
        method: 'DELETE',
        headers,
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Social link deleted!')
        fetchSocialLinks()
      } else {
        showMsg('error', data.error?.message || 'Failed to delete social link.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSEO) return

    if (!editingSEO.title?.trim()) {
      showMsg('error', 'SEO Title is required.')
      return
    }
    if (!editingSEO.description?.trim()) {
      showMsg('error', 'SEO Description is required.')
      return
    }

    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers,
        body: JSON.stringify(editingSEO),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `SEO for ${editingSEO.route} saved and revalidated!`)
        setEditingSEO(null)
        fetchSEOList()
      } else {
        showMsg('error', data.error?.message || 'Failed to save SEO.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleResetSEO = async (route: string) => {
    if (!confirm(`Reset SEO for ${route} back to system defaults?`)) return
    try {
      const res = await fetch(`/api/admin/seo?route=${encodeURIComponent(route)}`, {
        method: 'DELETE',
        headers,
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `SEO for ${route} reset to default!`)
        fetchSEOList()
      } else {
        showMsg('error', data.error?.message || 'Failed to reset SEO.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'POST', headers,
        body: JSON.stringify({ ...newHotel, amenities: newHotel.amenities.split(',').map(s => s.trim()).filter(Boolean) }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Hotel "${newHotel.name}" created!`)
        setNewHotel({ name: '', location: '', category: 'Normal', pricePerNight: '₹3,500', amenities: 'Mountain View, Wi-Fi', image: '' })
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to create hotel.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'POST', headers,
        body: JSON.stringify(newVehicle),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Vehicle "${newVehicle.numberPlate}" added!`)
        setNewVehicle({ name: '', numberPlate: '', type: 'SUV', capacity: 7, image: '' })
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to add vehicle.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleCreateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/chat-knowledge', {
        method: 'POST', headers,
        body: JSON.stringify(newKnowledge),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Knowledge "${newKnowledge.title}" created!`)
        setNewKnowledge({ title: '', content: '', category: 'general', keywords: '' })
        fetchKnowledge()
      } else {
        showMsg('error', data.error?.message || 'Failed to create knowledge.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeleteHotel = async (id: string) => {
    if (!confirm('Delete this hotel?')) return
    await fetch(`/api/admin/hotels?id=${id}`, { method: 'DELETE', headers })
    fetchAllData()
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return
    await fetch(`/api/admin/vehicles?id=${id}`, { method: 'DELETE', headers })
    fetchAllData()
  }

  const handleUpdateHotel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHotel) return
    try {
      const res = await fetch('/api/admin/hotels', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(editingHotel),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Hotel "${editingHotel.name}" updated!`)
        setEditingHotel(null)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to update hotel.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVehicle) return
    try {
      const res = await fetch('/api/admin/vehicles', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(editingVehicle),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Vehicle "${editingVehicle.name}" updated!`)
        setEditingVehicle(null)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to update vehicle.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleCreateGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGalleryPhoto.src.trim()) {
      showMsg('error', 'Image URL is required.')
      return
    }
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers,
        body: JSON.stringify(newGalleryPhoto),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Gallery photo added!')
        setNewGalleryPhoto({ src: '', alt: '', category: 'General', displayOrder: 99 })
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to add gallery photo.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleUpdateGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGalleryPhoto) return
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(editingGalleryPhoto),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Gallery photo updated!')
        setEditingGalleryPhoto(null)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to update gallery photo.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeleteGalleryPhoto = async (id: string) => {
    if (!confirm('Delete this gallery photo?')) return
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Gallery photo deleted.')
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to delete photo.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  // ── Category Handlers ──
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.title?.trim()) return showMsg('error', 'Category title is required.')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST', headers,
        body: JSON.stringify({ type: 'category', data: newCategory })
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Category "${newCategory.title}" created!`)
        setNewCategory({ title: '', slug: '', subtitle: '', description: '', image: '', badge: '', color: '#0ea5e9', active: true })
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to create category.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', headers,
        body: JSON.stringify({ type: 'category', id: editingCategory.id, data: editingCategory })
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Category "${editingCategory.title}" updated!`)
        setEditingCategory(null)
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to update category.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    try {
      const res = await fetch(`/api/admin/content?type=category&id=${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Category deleted.')
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to delete category.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  // ── Experience Handlers ──
  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExperience.title?.trim()) return showMsg('error', 'Experience title is required.')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST', headers,
        body: JSON.stringify({ type: 'experience', data: newExperience })
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Experience "${newExperience.title}" created!`)
        setNewExperience({ title: '', subtitle: '', description: '', image: '', duration: 'Half Day', difficulty: 'Easy', location: 'Munnar', icon: 'Compass', highlights: [], active: true })
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to create experience.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleUpdateExperience = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExperience) return
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', headers,
        body: JSON.stringify({ type: 'experience', id: editingExperience.id, data: editingExperience })
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Experience "${editingExperience.title}" updated!`)
        setEditingExperience(null)
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to update experience.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Delete this experience?')) return
    try {
      const res = await fetch(`/api/admin/content?type=experience&id=${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Experience deleted.')
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to delete experience.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  // ── Testimonial Handlers ──
  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTestimonial.name?.trim() || !newTestimonial.review?.trim()) return showMsg('error', 'Name and review are required.')
    try {
      const initials = newTestimonial.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      const res = await fetch('/api/admin/content', {
        method: 'POST', headers,
        body: JSON.stringify({ type: 'testimonial', data: { ...newTestimonial, initials } })
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Testimonial from "${newTestimonial.name}" created!`)
        setNewTestimonial({ name: '', trip: '', location: '', rating: 5, review: '', avatar: '', initials: '', active: true })
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to create testimonial.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleUpdateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTestimonial) return
    try {
      const initials = editingTestimonial.name ? editingTestimonial.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''
      const res = await fetch('/api/admin/content', {
        method: 'PUT', headers,
        body: JSON.stringify({ type: 'testimonial', id: editingTestimonial.id, data: { ...editingTestimonial, initials } })
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Testimonial updated!`)
        setEditingTestimonial(null)
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to update testimonial.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      const res = await fetch(`/api/admin/content?type=testimonial&id=${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Testimonial deleted.')
        fetchContent()
      } else {
        showMsg('error', data.error?.message || 'Failed to delete testimonial.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleChangeEnquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH', headers,
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Enquiry ${id} status updated to ${newStatus}`)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to update status.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleArchiveEnquiry = async (id: string) => {
    if (!confirm('Archive this enquiry?')) return
    try {
      await fetch(`/api/enquiries?id=${id}`, { method: 'DELETE', headers })
      showMsg('success', `Enquiry ${id} archived.`)
      fetchAllData()
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contentData?.settings) return
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH', headers,
        body: JSON.stringify({ type: 'settings', ...contentData.settings }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Settings updated!')
      } else {
        showMsg('error', data.error?.message || 'Failed to update settings.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  // ── Package & Itinerary Handlers ──

  const handleStartCreatePackage = () => {
    setEditingPackage({
      id: '',
      name: '',
      slug: '',
      destination: '',
      category: 'Couple',
      duration: '3 Days / 2 Nights',
      nights: 2,
      price: '₹9,999',
      priceNote: 'per person',
      tag: 'Curated Route',
      shortDescription: '',
      description: '',
      highlights: ['Tea Garden Walk', 'Mountain Viewpoint', 'Campfire'],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Scenic Exploration',
          description: 'Scenic ascent through the mountain highway, check-in to hillside resort, and evening local market stroll.',
          locations: ['Arrival Base', 'Mountain Hub'],
          activities: ['Scenic mountain drive', 'Resort check-in', 'Sunset viewpoint'],
          meals: ['Dinner'],
          accommodation: 'Boutique Mountain Resort',
          travelInfo: 'Private AC transfer',
        },
      ],
      inclusions: ['2 Nights stay in boutique mountain resort', 'Daily breakfast & dinner', 'Dedicated private vehicle for all transfers & sightseeing'],
      exclusions: ['Airfare / train tickets', 'Lunches and personal shopping expenses'],
      importantInformation: ['Valid government photo ID required for all travelers', 'Carry warm clothing for evening chill'],
      hotelIds: [],
      vehicleIds: [],
      active: true,
    })
  }

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPackage) return

    if (!editingPackage.name.trim()) {
      showMsg('error', 'Package name is required.')
      return
    }
    if (!editingPackage.destination.trim()) {
      showMsg('error', 'Package destination is required.')
      return
    }

    if (editingPackage.itinerary && editingPackage.itinerary.length > 0) {
      const seenDays = new Set<number>()
      for (const day of editingPackage.itinerary) {
        const dayNum = Number(day.day)
        if (isNaN(dayNum) || !Number.isInteger(dayNum) || dayNum < 1) {
          showMsg('error', `Day number "${day.day}" is invalid. Must be an integer >= 1.`)
          return
        }
        if (seenDays.has(dayNum)) {
          showMsg('error', `Duplicate day number detected: Day ${dayNum}. Each day must have a unique number.`)
          return
        }
        seenDays.add(dayNum)
        if (!day.title.trim()) {
          showMsg('error', `Day ${dayNum} must have a title.`)
          return
        }
        if (!day.description.trim()) {
          showMsg('error', `Day ${dayNum} must have a description.`)
          return
        }
      }
    }

    try {
      const isCreate = !editingPackage.id
      const url = '/api/admin/packages'
      const method = isCreate ? 'POST' : 'PATCH'

      const payload = {
        ...editingPackage,
        slug: editingPackage.slug?.trim() || editingPackage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', `Package "${editingPackage.name}" saved successfully!`)
        setEditingPackage(null)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to save package.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Package deleted.')
        if (editingPackage?.id === id) setEditingPackage(null)
        fetchAllData()
      } else {
        showMsg('error', data.error?.message || 'Failed to delete package.')
      }
    } catch (err: any) {
      showMsg('error', err?.message || 'Network error.')
    }
  }

  const addItineraryDay = () => {
    if (!editingPackage) return
    const currentItinerary = editingPackage.itinerary || []
    const maxDay = currentItinerary.length > 0 ? Math.max(...currentItinerary.map(d => Number(d.day) || 0)) : 0
    const newDay: ItineraryDay = {
      day: maxDay + 1,
      title: `Day ${maxDay + 1} Highland Journey`,
      description: '',
      locations: [],
      activities: [],
      meals: [],
      accommodation: '',
      travelInfo: '',
      images: [],
    }
    setEditingPackage({
      ...editingPackage,
      itinerary: [...currentItinerary, newDay],
    })
  }

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    if (!editingPackage || !editingPackage.itinerary) return
    const updated = [...editingPackage.itinerary]
    updated[index] = { ...updated[index], [field]: value }
    setEditingPackage({ ...editingPackage, itinerary: updated })
  }

  const removeItineraryDay = (index: number) => {
    if (!editingPackage || !editingPackage.itinerary) return
    const updated = editingPackage.itinerary.filter((_, i) => i !== index)
    setEditingPackage({ ...editingPackage, itinerary: updated })
  }

  const reorderItineraryDay = (index: number, direction: 'up' | 'down') => {
    if (!editingPackage || !editingPackage.itinerary) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= editingPackage.itinerary.length) return

    const updated = [...editingPackage.itinerary]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    // Re-assign sequential day numbers to preserve natural ascending order
    const renumbered = updated.map((d, i) => ({ ...d, day: i + 1 }))
    setEditingPackage({ ...editingPackage, itinerary: renumbered })
  }

  const duplicateItineraryDay = (index: number) => {
    if (!editingPackage || !editingPackage.itinerary) return
    const source = editingPackage.itinerary[index]
    const maxDay = Math.max(...editingPackage.itinerary.map(d => Number(d.day) || 0))
    const duplicated: ItineraryDay = {
      ...source,
      day: maxDay + 1,
      title: `${source.title} (Copy)`,
      locations: source.locations ? [...source.locations] : [],
      activities: source.activities ? [...source.activities] : [],
      meals: source.meals ? [...source.meals] : [],
      images: source.images ? [...source.images] : [],
    }
    setEditingPackage({
      ...editingPackage,
      itinerary: [...editingPackage.itinerary, duplicated],
    })
  }

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter(e => {
    if (enqStatusFilter && e.status !== enqStatusFilter) return false
    if (enqSearch) {
      const q = enqSearch.toLowerCase()
      return (
        e.customer?.name?.toLowerCase().includes(q) ||
        e.customer?.phone?.includes(q) ||
        e.customer?.email?.toLowerCase().includes(q) ||
        e.id?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // ── Shared Styles ──
  const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }
  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', width: '100%' }
  const statStyle: React.CSSProperties = { ...cardStyle }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'enquiries', label: 'Enquiries' },
    { key: 'packages', label: 'Packages' },
    { key: 'hotels', label: 'Hotels' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'content', label: 'Content' },
    { key: 'knowledge', label: 'Chat Knowledge' },
    { key: 'library', label: 'Image Library' },
    { key: 'social', label: 'Social Links' },
    { key: 'seo', label: 'SEO CMS' },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hill-navy-deep)', color: '#ffffff', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>
              Hills Tourism — Operations Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '4px' }}>
              Enquiry management, unique inventory, and live lead monitoring
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={fetchAllData} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
              Refresh
            </button>
            <a href="/" style={{ color: 'var(--hill-blue-bright)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Website <FiArrowRight />
            </a>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/admin/auth', { method: 'DELETE' })
                } catch {}
                document.cookie = 'admin_token=; path=/; max-age=0'
                window.location.href = '/admin/login'
              }}
              style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem',
            background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${message.type === 'success' ? '#22C55E' : '#EF4444'}`,
            color: message.type === 'success' ? '#86EFAC' : '#FCA5A5', fontSize: '0.85rem',
          }}>
            {message.type === 'success' ? <FiCheck style={{ marginRight: 4, display: 'inline' }} /> : <FiAlertTriangle style={{ marginRight: 4, display: 'inline' }} />} {message.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                background: activeTab === tab.key ? 'var(--hill-blue-bright)' : 'rgba(255,255,255,0.06)',
                color: '#ffffff', border: 'none', cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Enquiries</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--hill-blue-bright)', marginTop: '6px' }}>{enquiries.length}</p>
              </div>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Leads</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#22C55E', marginTop: '6px' }}>
                  {enquiries.filter(e => e.status === 'new').length}
                </p>
              </div>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Packages</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#F59E0B', marginTop: '6px' }}>{packages.filter(p => p.active).length}</p>
              </div>
              <div style={statStyle}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hotels / Vehicles</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#A855F7', marginTop: '6px' }}>{hotels.length} / {vehicles.length}</p>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Recent Customer Leads</h3>
            <div style={{ overflowX: 'auto', ...cardStyle }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '12px 16px' }}>ID</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Phone</th>
                    <th style={{ padding: '12px 16px' }}>Travel Date</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Sheets</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.slice(0, 5).map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--hill-blue-bright)' }}>{e.id}</td>
                      <td style={{ padding: '12px 16px' }}>{e.customer?.name}</td>
                      <td style={{ padding: '12px 16px' }}>{e.customer?.phone}</td>
                      <td style={{ padding: '12px 16px' }}>{e.travel?.date || 'Flexible'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: e.status === 'new' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: e.status === 'new' ? '#86EFAC' : '#fff', fontSize: '0.75rem' }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: e.integrations?.emailStatus === 'sent' ? '#86EFAC' : '#FCA5A5' }}>
                        {e.integrations?.emailStatus || 'pending'}
                      </td>
                      <td style={{ padding: '12px 16px', color: e.integrations?.sheetsStatus === 'synced' ? '#86EFAC' : '#FCA5A5' }}>
                        {e.integrations?.sheetsStatus || 'pending'}
                      </td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No enquiries yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ENQUIRIES TAB ── */}
        {activeTab === 'enquiries' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Enquiries ({filteredEnquiries.length})</h3>
              <input
                type="text" placeholder="Search name, phone, email..."
                value={enqSearch} onChange={e => setEnqSearch(e.target.value)}
                style={{ ...inputStyle, width: '250px' }}
              />
              <select value={enqStatusFilter} onChange={e => setEnqStatusFilter(e.target.value)}
                style={{ ...inputStyle, width: '150px', background: '#001040' }}>
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <div style={{ overflowX: 'auto', ...cardStyle }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '10px 12px' }}>ID</th>
                    <th style={{ padding: '10px 12px' }}>Customer</th>
                    <th style={{ padding: '10px 12px' }}>Phone</th>
                    <th style={{ padding: '10px 12px' }}>Package / Hotel</th>
                    <th style={{ padding: '10px 12px' }}>Message</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Integrations</th>
                    <th style={{ padding: '10px 12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--hill-blue-bright)', fontSize: '0.7rem' }}>{e.id}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div>{e.customer?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{e.customer?.email}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{e.customer?.phone}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div>{e.package?.nameSnapshot || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{e.hotel?.nameSnapshot || ''} {e.vehicle?.numberPlateSnapshot ? `· ${e.vehicle.numberPlateSnapshot}` : ''}</div>
                      </td>
                      <td style={{ padding: '10px 12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.message || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <select
                          value={e.status}
                          onChange={ev => handleChangeEnquiryStatus(e.id, ev.target.value)}
                          style={{ ...inputStyle, width: '110px', fontSize: '0.7rem', padding: '4px 8px', background: '#001040' }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed">Closed</option>
                          <option value="spam">Spam</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.7rem' }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}>
                          <FiMail style={{ marginRight: 4 }} /> {e.integrations?.emailStatus || '?'}
                        </span>{' '}
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}>
                          <FiBarChart2 style={{ marginRight: 4 }} /> {e.integrations?.sheetsStatus || '?'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => handleArchiveEnquiry(e.id)}
                          style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PACKAGES TAB ── */}
        {activeTab === 'packages' && (
          <div>
            {editingPackage ? (
              /* ── PACKAGE & ITINERARY EDITOR ── */
              <div style={{ ...cardStyle, marginBottom: '2rem', border: '1px solid var(--hill-blue-bright)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>Package Management</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, marginTop: '2px' }}>
                      {editingPackage.id ? `Edit Package: ${editingPackage.name}` : 'Create New Journey Package'}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePackage}
                      className="btn-primary"
                      style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                    >
                      Save Package & Itinerary
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* 1. Basic Information */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '1rem' }}>
                      1. Basic Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Package Name *</label>
                        <input
                          type="text"
                          required
                          value={editingPackage.name}
                          onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. Munnar Escape"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Slug (URL identifier)</label>
                        <input
                          type="text"
                          value={editingPackage.slug || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                          style={inputStyle}
                          placeholder="e.g. munnar-escape"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Destination *</label>
                        <input
                          type="text"
                          required
                          value={editingPackage.destination}
                          onChange={e => setEditingPackage({ ...editingPackage, destination: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. Munnar, Kerala"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Category</label>
                        <select
                          value={editingPackage.category || 'Couple'}
                          onChange={e => setEditingPackage({ ...editingPackage, category: e.target.value })}
                          style={{ ...inputStyle, background: '#001040' }}
                        >
                          <option value="Couple">Couple</option>
                          <option value="Family">Family</option>
                          <option value="Friends">Friends</option>
                          <option value="Honeymoon">Honeymoon</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Duration Display</label>
                        <input
                          type="text"
                          value={editingPackage.duration || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, duration: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. 3 Days / 2 Nights"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Number of Nights</label>
                        <input
                          type="number"
                          min="0"
                          value={editingPackage.nights !== undefined ? editingPackage.nights : ''}
                          onChange={e => setEditingPackage({ ...editingPackage, nights: e.target.value ? parseInt(e.target.value) : undefined })}
                          style={inputStyle}
                          placeholder="e.g. 2"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Price Display</label>
                        <input
                          type="text"
                          value={editingPackage.price || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, price: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. ₹9,999"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Price Note</label>
                        <input
                          type="text"
                          value={editingPackage.priceNote || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, priceNote: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. per person"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Experience Style Tag</label>
                        <input
                          type="text"
                          value={editingPackage.tag || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, tag: e.target.value })}
                          style={inputStyle}
                          placeholder="e.g. Most Popular, Nature Immersion"
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <ImageUploadField
                          label="Cover Image"
                          folder="packages"
                          token={token}
                          value={editingPackage.coverImage || editingPackage.image || ''}
                          onChange={(url) => setEditingPackage({ ...editingPackage, coverImage: url, image: url })}
                          helpText="Upload a high-quality cover photo or enter an existing image URL."
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Package Gallery URLs (comma or newline separated)</label>
                        <textarea
                          rows={2}
                          value={(editingPackage.gallery || []).join('\n')}
                          onChange={e => {
                            const urls = e.target.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
                            setEditingPackage({
                              ...editingPackage,
                              gallery: urls,
                            })
                          }}
                          style={{ ...inputStyle, resize: 'vertical', fontSize: '0.8rem' }}
                          placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '1.25rem' }}>
                        <input
                          type="checkbox"
                          id="pkgActive"
                          checked={editingPackage.active !== false}
                          onChange={e => setEditingPackage({ ...editingPackage, active: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="pkgActive" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                          Publicly Active (Visible on site)
                        </label>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Short Description (Hero & Cards)</label>
                        <textarea
                          rows={2}
                          value={editingPackage.shortDescription || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, shortDescription: e.target.value })}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          placeholder="One or two compelling sentences about this package..."
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Full Narrative Description</label>
                        <textarea
                          rows={2}
                          value={editingPackage.description || ''}
                          onChange={e => setEditingPackage({ ...editingPackage, description: e.target.value })}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          placeholder="Detailed overview of the journey..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Highlights */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                      2. Highlights (Comma-Separated)
                    </h4>
                    <input
                      type="text"
                      value={(editingPackage.highlights || []).join(', ')}
                      onChange={e => setEditingPackage({
                        ...editingPackage,
                        highlights: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                      })}
                      style={inputStyle}
                      placeholder="Tea Garden Walk, Sunset Viewpoint, Campfire, Jeep Ride"
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {(editingPackage.highlights || []).map((h, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center' }}>
                          <FiStar style={{ marginRight: 4 }} /> {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3. Day-Wise Itinerary (The Core Feature) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                          3. Day-Wise Itinerary ({(editingPackage.itinerary || []).length} Days)
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                          Add, edit, duplicate, and reorder days. Day numbers must be positive and unique.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addItineraryDay}
                        style={{ padding: '6px 14px', borderRadius: '6px', background: 'var(--hill-blue)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        + Add Day
                      </button>
                    </div>

                    {(editingPackage.itinerary || []).length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>No itinerary days added yet.</p>
                        <button type="button" onClick={addItineraryDay} className="btn-primary" style={{ marginTop: '0.75rem', padding: '6px 14px', fontSize: '0.75rem' }}>
                          + Add First Day
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {(editingPackage.itinerary || []).map((dayItem, index) => (
                          <div
                            key={index}
                            style={{
                              background: 'rgba(0,0,0,0.35)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '10px',
                              padding: '1.25rem',
                            }}
                          >
                            {/* Day Header Controls */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>Day:</span>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={dayItem.day}
                                  onChange={e => updateItineraryDay(index, 'day', parseInt(e.target.value) || 1)}
                                  style={{ ...inputStyle, width: '65px', padding: '4px 8px', fontSize: '0.85rem' }}
                                />
                                <input
                                  type="text"
                                  required
                                  placeholder="Day Title *"
                                  value={dayItem.title}
                                  onChange={e => updateItineraryDay(index, 'title', e.target.value)}
                                  style={{ ...inputStyle, width: 'clamp(200px, 30vw, 360px)', padding: '4px 8px', fontSize: '0.85rem', fontWeight: 600 }}
                                />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => reorderItineraryDay(index, 'up')}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: index === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', color: index === 0 ? 'rgba(255,255,255,0.3)' : '#fff', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
                                  title="Move Day Up"
                                >
                                  ↑ Up
                                </button>
                                <button
                                  type="button"
                                  disabled={index === (editingPackage.itinerary?.length || 1) - 1}
                                  onClick={() => reorderItineraryDay(index, 'down')}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: index === (editingPackage.itinerary?.length || 1) - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', color: index === (editingPackage.itinerary?.length || 1) - 1 ? 'rgba(255,255,255,0.3)' : '#fff', cursor: index === (editingPackage.itinerary?.length || 1) - 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
                                  title="Move Day Down"
                                >
                                  ↓ Down
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateItineraryDay(index)}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}
                                  title="Duplicate Day"
                                >
                                  Duplicate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItineraryDay(index)}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', cursor: 'pointer', fontSize: '0.75rem' }}
                                  title="Delete Day"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Day Description */}
                            <div style={{ marginBottom: '0.75rem' }}>
                              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Day Description *</label>
                              <textarea
                                rows={2}
                                required
                                value={dayItem.description}
                                onChange={e => updateItineraryDay(index, 'description', e.target.value)}
                                style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                                placeholder="Narrative description of this day's exploration..."
                              />
                            </div>

                            {/* Route, Activities, Meals, Stay, Travel, Images */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Locations / Route (comma-separated)</label>
                                <input
                                  type="text"
                                  value={(dayItem.locations || []).join(', ')}
                                  onChange={e => updateItineraryDay(index, 'locations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Munnar, Mattupetty, Top Station"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Activities (comma-separated)</label>
                                <input
                                  type="text"
                                  value={(dayItem.activities || []).join(', ')}
                                  onChange={e => updateItineraryDay(index, 'activities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Scenic drive, Safari, Boating"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Meals (comma-separated)</label>
                                <input
                                  type="text"
                                  value={(dayItem.meals || []).join(', ')}
                                  onChange={e => updateItineraryDay(index, 'meals', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Breakfast, Dinner"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Accommodation / Stay</label>
                                <input
                                  type="text"
                                  value={dayItem.accommodation || ''}
                                  onChange={e => updateItineraryDay(index, 'accommodation', e.target.value)}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Mountain Resort"
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>Travel Information</label>
                                <input
                                  type="text"
                                  value={dayItem.travelInfo || ''}
                                  onChange={e => updateItineraryDay(index, 'travelInfo', e.target.value)}
                                  style={{ ...inputStyle, fontSize: '0.8rem' }}
                                  placeholder="e.g. Private AC transfer (~120 km)"
                                />
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Day Images</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                  {(dayItem.images || []).map((imgUrl, imgIdx) => (
                                    <div key={imgIdx} style={{ position: 'relative', width: '60px', height: '45px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                      <img src={getOptimizedImageUrl(imgUrl, { width: 120, height: 90, crop: 'fill' })} alt={`Day ${dayItem.day} photo`} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...(dayItem.images || [])]
                                          updated.splice(imgIdx, 1)
                                          updateItineraryDay(index, 'images', updated)
                                        }}
                                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#EF4444', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        title="Remove image"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <ImageUploadField
                                  folder="package-itineraries"
                                  token={token}
                                  placeholder="Upload or paste image URL to add to Day"
                                  onChange={(url) => {
                                    if (url) {
                                      const updated = [...(dayItem.images || []), url]
                                      updateItineraryDay(index, 'images', updated)
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4 & 5. Inclusions & Exclusions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#86EFAC', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                        4. Inclusions (One per line)
                      </h4>
                      <textarea
                        rows={4}
                        value={(editingPackage.inclusions || []).join('\n')}
                        onChange={e => setEditingPackage({
                          ...editingPackage,
                          inclusions: e.target.value.split('\n').map(s => s.trim()).filter(Boolean),
                        })}
                        style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                        placeholder="2 Nights accommodation in boutique stay&#10;Daily breakfast and dinner&#10;Private sanitized cab with chauffeur"
                      />
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                        5. Exclusions (One per line)
                      </h4>
                      <textarea
                        rows={4}
                        value={(editingPackage.exclusions || []).join('\n')}
                        onChange={e => setEditingPackage({
                          ...editingPackage,
                          exclusions: e.target.value.split('\n').map(s => s.trim()).filter(Boolean),
                        })}
                        style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                        placeholder="Airfare / train tickets&#10;Lunches and personal expenses&#10;Optional adventure activities"
                      />
                    </div>
                  </div>

                  {/* 6. Important Information */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                      6. Important Information & Guidelines (One per line)
                    </h4>
                    <textarea
                      rows={3}
                      value={(editingPackage.importantInformation || []).join('\n')}
                      onChange={e => setEditingPackage({
                        ...editingPackage,
                        importantInformation: e.target.value.split('\n').map(s => s.trim()).filter(Boolean),
                      })}
                      style={{ ...inputStyle, resize: 'vertical', fontSize: '0.85rem' }}
                      placeholder="Valid government photo ID required for all guests&#10;Carry warm clothing for evening temperatures"
                    />
                  </div>

                  {/* 7. Connected Inventory (Stays & Fleet Vehicles) */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem' }}>
                      7. Connected Hotels & Vehicles (Enquiry Options)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {/* Hotels checkboxes */}
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                          Select Available Stays:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                          {hotels.map(h => {
                            const isChecked = (editingPackage.hotelIds || []).includes(h.id)
                            return (
                              <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    const current = editingPackage.hotelIds || []
                                    const next = e.target.checked
                                      ? [...current, h.id]
                                      : current.filter(id => id !== h.id)
                                    setEditingPackage({ ...editingPackage, hotelIds: next })
                                  }}
                                />
                                <span>{h.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>({h.location || h.category})</span></span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Vehicles checkboxes */}
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                          Select Available Fleet Vehicles:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                          {vehicles.map(v => {
                            const isChecked = (editingPackage.vehicleIds || []).includes(v.id)
                            return (
                              <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    const current = editingPackage.vehicleIds || []
                                    const next = e.target.checked
                                      ? [...current, v.id]
                                      : current.filter(id => id !== v.id)
                                    setEditingPackage({ ...editingPackage, vehicleIds: next })
                                  }}
                                />
                                <span>{v.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>({v.type} · {v.capacity} seats)</span></span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 8. SEO Settings */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--hill-blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem' }}>
                      8. SEO & Social Metadata
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Meta Title</label>
                        <input
                          type="text"
                          value={editingPackage.seo?.title || ''}
                          onChange={e => setEditingPackage({
                            ...editingPackage,
                            seo: { ...editingPackage.seo, title: e.target.value },
                          })}
                          style={inputStyle}
                          placeholder="e.g. Munnar Escape 3 Days Trip | Hills Tourism"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Meta Description</label>
                        <input
                          type="text"
                          value={editingPackage.seo?.description || ''}
                          onChange={e => setEditingPackage({
                            ...editingPackage,
                            seo: { ...editingPackage.seo, description: e.target.value },
                          })}
                          style={inputStyle}
                          placeholder="Explore our curated 3-day Munnar itinerary..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save / Cancel Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditingPackage(null)}
                      style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '8px 24px', fontSize: '0.85rem' }}
                    >
                      Save Package & Itinerary
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* ── PACKAGES CATALOG LIST ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                  Curated Packages ({packages.length})
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                  Manage public itineraries, day schedules, and connected stays & vehicles
                </p>
              </div>
              <button
                onClick={handleStartCreatePackage}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                + Create New Package
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {packages.map(p => (
                <div key={p.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {p.destination} · {p.duration}
                      </span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '4px 0' }}>
                        {p.name || (p as any).title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        {p.category || p.tag} {p.nights !== undefined ? `· ${p.nights} Nights` : ''}
                      </p>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: p.active !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: p.active !== false ? '#86EFAC' : '#FCA5A5', fontSize: '0.65rem' }}>
                      {p.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Itinerary indicator */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '0.5rem 0', fontSize: '0.75rem' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(8, 120, 255, 0.15)', color: 'var(--hill-blue-bright)', display: 'inline-flex', alignItems: 'center' }}>
                      <FiCalendar style={{ marginRight: 4 }} /> {p.itinerary?.length || 0} Itinerary Days
                    </span>
                    {p.inclusions && p.inclusions.length > 0 && (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#86EFAC', display: 'inline-flex', alignItems: 'center' }}>
                        <FiCheck style={{ marginRight: 4 }} /> {p.inclusions.length} Inclusions
                      </span>
                    )}
                  </div>

                  {p.price && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F59E0B', marginTop: 'auto', paddingTop: '0.75rem' }}>
                      {p.price} <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{p.priceNote}</span>
                    </p>
                  )}

                  {/* Card Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      onClick={() => setEditingPackage(JSON.parse(JSON.stringify(p)))}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      Edit Itinerary & Details
                    </button>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href={`/packages/${p.slug || p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                      >
                        View <FiArrowUpRight style={{ marginLeft: 2 }} />
                      </a>
                      <button
                        onClick={() => handleDeletePackage(p.id)}
                        style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOTELS TAB ── */}
        {activeTab === 'hotels' && (
          <div>
            {/* Edit Hotel Form */}
            {editingHotel && (
              <div style={{ ...cardStyle, marginBottom: '2rem', border: '1px solid var(--hill-blue-bright)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>
                    Edit Hotel: {editingHotel.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingHotel(null)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Cancel <FiX />
                  </button>
                </div>
                <form onSubmit={handleUpdateHotel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Hotel Name *</label>
                    <input type="text" required value={editingHotel.name} onChange={e => setEditingHotel({ ...editingHotel, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Location</label>
                    <input type="text" value={editingHotel.location || ''} onChange={e => setEditingHotel({ ...editingHotel, location: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select value={editingHotel.category} onChange={e => setEditingHotel({ ...editingHotel, category: e.target.value as any })} style={{ ...inputStyle, background: '#001040' }}>
                      <option value="Normal">Normal</option>
                      <option value="Premium">Premium</option>
                      <option value="5 Star">5 Star</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Price Per Night</label>
                    <input type="text" value={editingHotel.pricePerNight || ''} onChange={e => setEditingHotel({ ...editingHotel, pricePerNight: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Rating (1.0 - 5.0)</label>
                    <input type="number" step="0.1" min="1" max="5" value={editingHotel.rating || 4.5} onChange={e => setEditingHotel({ ...editingHotel, rating: parseFloat(e.target.value) || 4.5 })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ImageUploadField
                      label="Hotel Image"
                      folder="hotels"
                      token={token}
                      value={editingHotel.image || ''}
                      onChange={(url) => setEditingHotel({ ...editingHotel, image: url })}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Amenities (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Mountain View, Wi-Fi, Swimming Pool, Spa"
                      value={Array.isArray(editingHotel.amenities) ? editingHotel.amenities.join(', ') : ''}
                      onChange={e => setEditingHotel({ ...editingHotel, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Description</label>
                    <textarea
                      rows={2}
                      value={editingHotel.description || ''}
                      onChange={e => setEditingHotel({ ...editingHotel, description: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>SEO Metadata (Optional)</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>SEO Title</label>
                        <input
                          type="text"
                          placeholder={editingHotel.name}
                          value={editingHotel.seo?.title || ''}
                          onChange={e => setEditingHotel({
                            ...editingHotel,
                            seo: { ...editingHotel.seo, title: e.target.value },
                          })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '2px' }}>SEO Description</label>
                        <input
                          type="text"
                          placeholder={editingHotel.description ? editingHotel.description.slice(0, 100) : ''}
                          value={editingHotel.seo?.description || ''}
                          onChange={e => setEditingHotel({
                            ...editingHotel,
                            seo: { ...editingHotel.seo, description: e.target.value },
                          })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="editHotelActive"
                      checked={editingHotel.active !== false}
                      onChange={e => setEditingHotel({ ...editingHotel, active: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="editHotelActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Active (Visible on public site)</label>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingHotel(null)} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 22px', fontSize: '0.85rem' }}>
                      Save Hotel Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Hotel Form */}
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add New Hotel (Server-Enforced Name Uniqueness)
              </h4>
              <form onSubmit={handleCreateHotel} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input type="text" placeholder="Hotel Name *" required value={newHotel.name} onChange={e => setNewHotel({ ...newHotel, name: e.target.value })} style={inputStyle} />
                <input type="text" placeholder="Location (e.g. Munnar, Kerala)" value={newHotel.location} onChange={e => setNewHotel({ ...newHotel, location: e.target.value })} style={inputStyle} />
                <select value={newHotel.category} onChange={e => setNewHotel({ ...newHotel, category: e.target.value })} style={{ ...inputStyle, background: '#001040' }}>
                  <option value="Normal">Normal</option>
                  <option value="Premium">Premium</option>
                  <option value="5 Star">5 Star</option>
                </select>
                <input type="text" placeholder="Price Per Night (e.g. ₹3,500)" value={newHotel.pricePerNight} onChange={e => setNewHotel({ ...newHotel, pricePerNight: e.target.value })} style={inputStyle} />
                <input type="text" placeholder="Amenities (comma-separated)" value={newHotel.amenities} onChange={e => setNewHotel({ ...newHotel, amenities: e.target.value })} style={inputStyle} />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Create Hotel</button>
              </form>
            </div>

            {/* Hotels Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {hotels.map(h => (
                <div key={h.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                  {h.image && (
                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <img src={getOptimizedImageUrl(h.image, { width: 400, height: 240, crop: 'fill' })} alt={h.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>{h.category}</span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0' }}>{h.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{h.location}</p>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: h.active !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: h.active !== false ? '#86EFAC' : '#FCA5A5', fontSize: '0.65rem' }}>
                      {h.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {h.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#F59E0B', marginTop: '6px' }}>
                      <FaStar /> <span>{h.rating}</span>
                    </div>
                  )}
                  {h.amenities && h.amenities.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {h.amenities.slice(0, 3).map((a: string, i: number) => (
                        <span key={i} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>
                          {a}
                        </span>
                      ))}
                      {h.amenities.length > 3 && (
                        <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                          +{h.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F59E0B' }}>{h.pricePerNight}</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        onClick={() => setEditingHotel(JSON.parse(JSON.stringify(h)))}
                        style={{ color: 'var(--hill-blue-bright)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(h.id)}
                        style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VEHICLES TAB ── */}
        {activeTab === 'vehicles' && (
          <div>
            {/* Edit Vehicle Form */}
            {editingVehicle && (
              <div style={{ ...cardStyle, marginBottom: '2rem', border: '1px solid var(--hill-blue-bright)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>
                    Edit Vehicle: {editingVehicle.name} ({editingVehicle.numberPlate})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingVehicle(null)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Cancel <FiX />
                  </button>
                </div>
                <form onSubmit={handleUpdateVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Model Name *</label>
                    <input type="text" required value={editingVehicle.name} onChange={e => setEditingVehicle({ ...editingVehicle, name: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Number Plate *</label>
                    <input type="text" required value={editingVehicle.numberPlate} onChange={e => setEditingVehicle({ ...editingVehicle, numberPlate: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Vehicle Type</label>
                    <select value={editingVehicle.type} onChange={e => setEditingVehicle({ ...editingVehicle, type: e.target.value as any })} style={{ ...inputStyle, background: '#001040' }}>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Tempo Traveller">Tempo Traveller</option>
                      <option value="Luxury Coach">Luxury Coach</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Capacity (Seats)</label>
                    <input type="number" min={1} max={50} value={editingVehicle.capacity} onChange={e => setEditingVehicle({ ...editingVehicle, capacity: parseInt(e.target.value) || 4 })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Luggage Capacity</label>
                    <input type="text" placeholder="e.g. 4 Large Bags" value={editingVehicle.luggage || ''} onChange={e => setEditingVehicle({ ...editingVehicle, luggage: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ImageUploadField
                      label="Vehicle Image"
                      folder="vehicles"
                      token={token}
                      value={editingVehicle.image || ''}
                      onChange={(url) => setEditingVehicle({ ...editingVehicle, image: url })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Ideal For</label>
                    <input type="text" placeholder="e.g. Small families, couples" value={editingVehicle.idealFor || ''} onChange={e => setEditingVehicle({ ...editingVehicle, idealFor: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Price Note</label>
                    <input type="text" placeholder="e.g. Included in package / ₹2,800 per day" value={editingVehicle.priceNote || ''} onChange={e => setEditingVehicle({ ...editingVehicle, priceNote: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Features (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="AC, Sanitized, GPS Tracking, Professional Chauffeur"
                      value={Array.isArray(editingVehicle.features) ? editingVehicle.features.join(', ') : ''}
                      onChange={e => setEditingVehicle({ ...editingVehicle, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="editVehicleActive"
                      checked={editingVehicle.active !== false}
                      onChange={e => setEditingVehicle({ ...editingVehicle, active: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="editVehicleActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Active (Available in fleet)</label>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingVehicle(null)} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 22px', fontSize: '0.85rem' }}>
                      Save Vehicle Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Vehicle Form */}
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add New Fleet Vehicle (Server-Enforced Number Plate Uniqueness)
              </h4>
              <form onSubmit={handleCreateVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input type="text" placeholder="Vehicle Model *" required value={newVehicle.name} onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} style={inputStyle} />
                <input type="text" placeholder="Number Plate (e.g. TN 01 AB 1234) *" required value={newVehicle.numberPlate} onChange={e => setNewVehicle({ ...newVehicle, numberPlate: e.target.value })} style={inputStyle} />
                <select value={newVehicle.type} onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value as any })} style={{ ...inputStyle, background: '#001040' }}>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Tempo Traveller">Tempo Traveller</option>
                  <option value="Luxury Coach">Luxury Coach</option>
                </select>
                <input type="number" placeholder="Capacity (Seats)" min={1} max={50} value={newVehicle.capacity} onChange={e => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) || 4 })} style={inputStyle} />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Register Vehicle</button>
              </form>
            </div>

            {/* Vehicles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {vehicles.map(v => (
                <div key={v.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                  {v.image && (
                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <img src={getOptimizedImageUrl(v.image, { width: 400, height: 240, crop: 'fill' })} alt={v.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>{v.type} · {v.capacity} Seats</span>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0' }}>{v.name}</h4>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#F59E0B' }}>{v.numberPlate}</p>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: v.active !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: v.active !== false ? '#86EFAC' : '#FCA5A5', fontSize: '0.65rem' }}>
                      {v.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {v.luggage && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>Luggage: {v.luggage}</p>
                  )}
                  {v.idealFor && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Ideal for: {v.idealFor}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#86EFAC' }}>{v.priceNote || 'Included in packages'}</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        onClick={() => setEditingVehicle(JSON.parse(JSON.stringify(v)))}
                        style={{ color: 'var(--hill-blue-bright)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {activeTab === 'gallery' && (
          <div>
            {/* Edit Photo Form */}
            {editingGalleryPhoto && (
              <div style={{ ...cardStyle, marginBottom: '2rem', border: '1px solid var(--hill-blue-bright)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--hill-blue-bright)', fontWeight: 700 }}>
                    Edit Gallery Photo #{editingGalleryPhoto.id}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingGalleryPhoto(null)}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Cancel <FiX />
                  </button>
                </div>
                <form onSubmit={handleUpdateGalleryPhoto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ImageUploadField
                      label="Gallery Image"
                      folder="gallery"
                      token={token}
                      required
                      value={editingGalleryPhoto.src}
                      onChange={(url) => setEditingGalleryPhoto({ ...editingGalleryPhoto, src: url })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Caption / Alt Text</label>
                    <input type="text" value={editingGalleryPhoto.alt} onChange={e => setEditingGalleryPhoto({ ...editingGalleryPhoto, alt: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select value={editingGalleryPhoto.category || 'General'} onChange={e => setEditingGalleryPhoto({ ...editingGalleryPhoto, category: e.target.value })} style={{ ...inputStyle, background: '#001040' }}>
                      <option value="General">General</option>
                      <option value="Mountains">Mountains</option>
                      <option value="Nature">Nature</option>
                      <option value="Experiences">Experiences</option>
                      <option value="Wildlife">Wildlife</option>
                      <option value="Culture">Culture</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Display Order</label>
                    <input type="number" value={editingGalleryPhoto.displayOrder} onChange={e => setEditingGalleryPhoto({ ...editingGalleryPhoto, displayOrder: parseInt(e.target.value) || 0 })} style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '1.25rem' }}>
                    <input
                      type="checkbox"
                      id="editGalActive"
                      checked={editingGalleryPhoto.active !== false}
                      onChange={e => setEditingGalleryPhoto({ ...editingGalleryPhoto, active: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="editGalActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Active (Visible in gallery)</label>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingGalleryPhoto(null)} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 22px', fontSize: '0.85rem' }}>
                      Save Photo Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Photo Form */}
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add New Gallery Photo
              </h4>
              <form onSubmit={handleCreateGalleryPhoto} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <ImageUploadField
                    label="Photo Image"
                    folder="gallery"
                    token={token}
                    required
                    value={newGalleryPhoto.src}
                    onChange={(url) => setNewGalleryPhoto({ ...newGalleryPhoto, src: url })}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Caption / Alt Text"
                  value={newGalleryPhoto.alt}
                  onChange={e => setNewGalleryPhoto({ ...newGalleryPhoto, alt: e.target.value })}
                  style={inputStyle}
                />
                <select
                  value={newGalleryPhoto.category}
                  onChange={e => setNewGalleryPhoto({ ...newGalleryPhoto, category: e.target.value })}
                  style={{ ...inputStyle, background: '#001040' }}
                >
                  <option value="General">General</option>
                  <option value="Mountains">Mountains</option>
                  <option value="Nature">Nature</option>
                  <option value="Experiences">Experiences</option>
                  <option value="Wildlife">Wildlife</option>
                  <option value="Culture">Culture</option>
                </select>
                <input
                  type="number"
                  placeholder="Display Order (e.g. 1)"
                  value={newGalleryPhoto.displayOrder}
                  onChange={e => setNewGalleryPhoto({ ...newGalleryPhoto, displayOrder: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Add Photo
                </button>
              </form>
            </div>

            {/* Photos Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {galleryPhotos.map(photo => (
                <div key={photo.id} style={{ ...cardStyle, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', background: '#000' }}>
                    <img src={getOptimizedImageUrl(photo.src, { width: 400, height: 260, crop: 'fill' })} alt={photo.alt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {photo.category || 'General'}
                    </span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                        #{photo.displayOrder}
                      </span>
                      <span style={{ padding: '1px 6px', borderRadius: '4px', background: photo.active !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: photo.active !== false ? '#86EFAC' : '#FCA5A5', fontSize: '0.6rem' }}>
                        {photo.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem', flexGrow: 1 }}>
                    {photo.alt || 'No caption'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => setEditingGalleryPhoto(JSON.parse(JSON.stringify(photo)))}
                      style={{ color: 'var(--hill-blue-bright)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryPhoto(photo.id)}
                      style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTENT TAB ── */}
        {activeTab === 'content' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700 }}>
                Website Content Management
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Manage Categories, Curated Experiences, and Customer Testimonials with Cloudinary media.
              </p>
            </div>

            {/* 1. CATEGORIES MANAGEMENT */}
            <div style={{ ...cardStyle, marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ color: 'var(--hill-blue-bright)', fontSize: '1.1rem', fontWeight: 700 }}>
                    Tour Categories ({contentData?.categories?.length || 0})
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                    Categories featured across hero carousels and filters
                  </p>
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleCreateCategory} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>+ Add New Category</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <input
                    type="text" placeholder="Title (e.g. Honeymoon Special) *" required
                    value={newCategory.title || ''} onChange={e => setNewCategory({ ...newCategory, title: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Slug (optional, e.g. honeymoon)"
                    value={newCategory.slug || ''} onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Badge (e.g. Romantic)"
                    value={newCategory.badge || ''} onChange={e => setNewCategory({ ...newCategory, badge: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Color (e.g. #EC4899)"
                    value={newCategory.color || ''} onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                    style={inputStyle}
                  />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ImageUploadField
                      label="Category Feature Image"
                      folder="content"
                      token={token}
                      value={newCategory.image || ''}
                      onChange={(url) => setNewCategory({ ...newCategory, image: url })}
                      placeholder="Upload category cover or paste URL"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <textarea
                      rows={2} placeholder="Description"
                      value={newCategory.description || ''} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                      Add Category
                    </button>
                  </div>
                </div>
              </form>

              {/* Edit Category Modal */}
              {editingCategory && (
                <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid var(--hill-blue-bright)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ fontWeight: 700, color: 'var(--hill-blue-bright)' }}>Edit Category: {editingCategory.title}</h5>
                    <button onClick={() => setEditingCategory(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><FiX /></button>
                  </div>
                  <form onSubmit={handleUpdateCategory} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <input type="text" value={editingCategory.title} onChange={e => setEditingCategory({ ...editingCategory, title: e.target.value })} style={inputStyle} />
                    <input type="text" value={editingCategory.badge || ''} onChange={e => setEditingCategory({ ...editingCategory, badge: e.target.value })} style={inputStyle} placeholder="Badge" />
                    <input type="text" value={editingCategory.color || ''} onChange={e => setEditingCategory({ ...editingCategory, color: e.target.value })} style={inputStyle} placeholder="Color" />
                    <div style={{ gridColumn: '1 / -1' }}>
                      <ImageUploadField
                        label="Category Image"
                        folder="content"
                        token={token}
                        value={editingCategory.image || ''}
                        onChange={(url) => setEditingCategory({ ...editingCategory, image: url })}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <textarea rows={2} value={editingCategory.description || ''} onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setEditingCategory(null)} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>Cancel</button>
                      <button type="submit" className="btn-primary" style={{ padding: '6px 18px', fontSize: '0.8rem' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {contentData?.categories?.map((c: any) => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                    {c.image && (
                      <div style={{ width: '100%', height: '90px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', background: '#000' }}>
                        <img src={getOptimizedImageUrl(c.image, { width: 300, height: 160, crop: 'fill' })} alt={c.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{c.title}</span>
                      {c.badge && (
                        <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(56,189,248,0.2)', color: 'var(--hill-blue-bright)' }}>
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '4px 0 10px', flexGrow: 1 }}>
                      {c.description || 'No description'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                      <button onClick={() => setEditingCategory(JSON.parse(JSON.stringify(c)))} style={{ color: 'var(--hill-blue-bright)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        <FiEdit2 style={{ display: 'inline', marginRight: 3 }} /> Edit
                      </button>
                      <button onClick={() => handleDeleteCategory(c.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                        <FiTrash2 style={{ display: 'inline', marginRight: 3 }} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. TESTIMONIALS MANAGEMENT */}
            <div style={{ ...cardStyle, marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ color: 'var(--hill-blue-bright)', fontSize: '1.1rem', fontWeight: 700 }}>
                    Customer Testimonials ({contentData?.testimonials?.length || 0})
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                    Authentic customer reviews with traveler photos
                  </p>
                </div>
              </div>

              {/* Add Testimonial Form */}
              <form onSubmit={handleCreateTestimonial} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>+ Add New Testimonial</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <input
                    type="text" placeholder="Traveler Name (e.g. Priya & Rahul) *" required
                    value={newTestimonial.name || ''} onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Trip Taken (e.g. 5D Munnar Tea Trail)"
                    value={newTestimonial.trip || ''} onChange={e => setNewTestimonial({ ...newTestimonial, trip: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Origin City (e.g. Bangalore)"
                    value={newTestimonial.location || ''} onChange={e => setNewTestimonial({ ...newTestimonial, location: e.target.value })}
                    style={inputStyle}
                  />
                  <select
                    value={newTestimonial.rating || 5}
                    onChange={e => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) || 5 })}
                    style={{ ...inputStyle, background: '#001040' }}
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★</option>
                    <option value={3}>3 Stars ★★★</option>
                  </select>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ImageUploadField
                      label="Traveler Photo / Avatar"
                      folder="testimonials"
                      token={token}
                      value={newTestimonial.avatar || ''}
                      onChange={(url) => setNewTestimonial({ ...newTestimonial, avatar: url })}
                      placeholder="Upload traveler avatar or paste URL"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <textarea
                      rows={2} placeholder="Testimonial review text *" required
                      value={newTestimonial.review || ''} onChange={e => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                      Add Testimonial
                    </button>
                  </div>
                </div>
              </form>

              {/* Edit Testimonial Modal */}
              {editingTestimonial && (
                <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid var(--hill-blue-bright)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ fontWeight: 700, color: 'var(--hill-blue-bright)' }}>Edit Testimonial: {editingTestimonial.name}</h5>
                    <button onClick={() => setEditingTestimonial(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><FiX /></button>
                  </div>
                  <form onSubmit={handleUpdateTestimonial} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <input type="text" value={editingTestimonial.name} onChange={e => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })} style={inputStyle} />
                    <input type="text" value={editingTestimonial.trip || ''} onChange={e => setEditingTestimonial({ ...editingTestimonial, trip: e.target.value })} style={inputStyle} />
                    <input type="text" value={editingTestimonial.location || ''} onChange={e => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })} style={inputStyle} />
                    <div style={{ gridColumn: '1 / -1' }}>
                      <ImageUploadField
                        label="Traveler Photo / Avatar"
                        folder="testimonials"
                        token={token}
                        value={editingTestimonial.avatar || ''}
                        onChange={(url) => setEditingTestimonial({ ...editingTestimonial, avatar: url })}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <textarea rows={3} value={editingTestimonial.review} onChange={e => setEditingTestimonial({ ...editingTestimonial, review: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setEditingTestimonial(null)} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>Cancel</button>
                      <button type="submit" className="btn-primary" style={{ padding: '6px 18px', fontSize: '0.8rem' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Testimonials Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {contentData?.testimonials?.map((t: any) => (
                  <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'var(--hill-blue-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0 }}>
                        {t.avatar ? (
                          <img src={getOptimizedImageUrl(t.avatar, { width: 80, height: 80, crop: 'fill', gravity: 'face' })} alt={t.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          t.initials || 'HT'
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{t.trip} · {t.location}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', color: '#F59E0B', fontSize: '0.75rem', marginBottom: '6px' }}>
                      {Array.from({ length: t.rating || 5 }).map((_, i) => <FaStar key={i} />)}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, margin: '0 0 12px 0', flexGrow: 1, fontStyle: 'italic' }}>
                      "{t.review}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                      <button onClick={() => setEditingTestimonial(JSON.parse(JSON.stringify(t)))} style={{ color: 'var(--hill-blue-bright)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                        <FiEdit2 style={{ display: 'inline', marginRight: 3 }} /> Edit
                      </button>
                      <button onClick={() => handleDeleteTestimonial(t.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                        <FiTrash2 style={{ display: 'inline', marginRight: 3 }} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. EXPERIENCES MANAGEMENT */}
            <div style={{ ...cardStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ color: 'var(--hill-blue-bright)', fontSize: '1.1rem', fontWeight: 700 }}>
                    Mountain Experiences ({contentData?.experiences?.length || 0})
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                    Curated activities and trails featured on the homepage and destination showcases
                  </p>
                </div>
              </div>

              {/* Add Experience Form */}
              <form onSubmit={handleCreateExperience} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>+ Add New Experience</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  <input
                    type="text" placeholder="Title (e.g. Tea Plantation Trails) *" required
                    value={newExperience.title || ''} onChange={e => setNewExperience({ ...newExperience, title: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Subtitle (e.g. Fragrant walks)"
                    value={newExperience.subtitle || ''} onChange={e => setNewExperience({ ...newExperience, subtitle: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Location (e.g. Munnar)"
                    value={newExperience.location || ''} onChange={e => setNewExperience({ ...newExperience, location: e.target.value })}
                    style={inputStyle}
                  />
                  <input
                    type="text" placeholder="Duration (e.g. 3 Hours)"
                    value={newExperience.duration || ''} onChange={e => setNewExperience({ ...newExperience, duration: e.target.value })}
                    style={inputStyle}
                  />
                  <select
                    value={newExperience.difficulty || 'Easy'}
                    onChange={e => setNewExperience({ ...newExperience, difficulty: e.target.value })}
                    style={{ ...inputStyle, background: '#001040' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <ImageUploadField
                      label="Experience Image"
                      folder="experiences"
                      token={token}
                      value={newExperience.image || ''}
                      onChange={(url) => setNewExperience({ ...newExperience, image: url })}
                      placeholder="Upload experience photo or paste URL"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <textarea
                      rows={2} placeholder="Description *" required
                      value={newExperience.description || ''} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                      Add Experience
                    </button>
                  </div>
                </div>
              </form>

              {/* Edit Experience Modal */}
              {editingExperience && (
                <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid var(--hill-blue-bright)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ fontWeight: 700, color: 'var(--hill-blue-bright)' }}>Edit Experience: {editingExperience.title}</h5>
                    <button onClick={() => setEditingExperience(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><FiX /></button>
                  </div>
                  <form onSubmit={handleUpdateExperience} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <input type="text" value={editingExperience.title} onChange={e => setEditingExperience({ ...editingExperience, title: e.target.value })} style={inputStyle} />
                    <input type="text" value={editingExperience.location || ''} onChange={e => setEditingExperience({ ...editingExperience, location: e.target.value })} style={inputStyle} placeholder="Location" />
                    <input type="text" value={editingExperience.duration || ''} onChange={e => setEditingExperience({ ...editingExperience, duration: e.target.value })} style={inputStyle} placeholder="Duration" />
                    <div style={{ gridColumn: '1 / -1' }}>
                      <ImageUploadField
                        label="Experience Image"
                        folder="experiences"
                        token={token}
                        value={editingExperience.image || ''}
                        onChange={(url) => setEditingExperience({ ...editingExperience, image: url })}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <textarea rows={2} value={editingExperience.description} onChange={e => setEditingExperience({ ...editingExperience, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setEditingExperience(null)} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>Cancel</button>
                      <button type="submit" className="btn-primary" style={{ padding: '6px 18px', fontSize: '0.8rem' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Experiences Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {contentData?.experiences?.map((e: any) => (
                  <div key={e.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {e.image && (
                      <div style={{ width: '100%', height: '120px', background: '#000' }}>
                        <img src={getOptimizedImageUrl(e.image, { width: 400, height: 200, crop: 'fill' })} alt={e.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>{e.location}</span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{e.duration} · {e.difficulty}</span>
                      </div>
                      <h5 style={{ fontWeight: 700, fontSize: '0.9rem', margin: '4px 0' }}>{e.title}</h5>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 10px 0', flexGrow: 1 }}>{e.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                        <button onClick={() => setEditingExperience(JSON.parse(JSON.stringify(e)))} style={{ color: 'var(--hill-blue-bright)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                          <FiEdit2 style={{ display: 'inline', marginRight: 3 }} /> Edit
                        </button>
                        <button onClick={() => handleDeleteExperience(e.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
                          <FiTrash2 style={{ display: 'inline', marginRight: 3 }} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── IMAGE LIBRARY TAB ── */}
        {activeTab === 'library' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700 }}>
                Cloudinary Asset Library
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                Upload, store, and organize media across Cloudinary folders with automatic format & quality optimization.
              </p>
            </div>

            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ color: 'var(--hill-blue-bright)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Direct Cloudinary Uploader
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Target Folder</label>
                  <select
                    value={libraryFolder}
                    onChange={e => setLibraryFolder(e.target.value)}
                    style={{ ...inputStyle, background: '#001040' }}
                  >
                    <option value="packages">hills-tourism/packages</option>
                    <option value="package-itineraries">hills-tourism/package-itineraries</option>
                    <option value="hotels">hills-tourism/hotels</option>
                    <option value="vehicles">hills-tourism/vehicles</option>
                    <option value="gallery">hills-tourism/gallery</option>
                    <option value="experiences">hills-tourism/experiences</option>
                    <option value="testimonials">hills-tourism/testimonials</option>
                    <option value="content">hills-tourism/content</option>
                    <option value="hero">hills-tourism/hero</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Choose image to upload"
                folder={libraryFolder}
                token={token}
                onChange={(url, publicId) => {
                  if (url) {
                    const newAsset = { url, publicId, folder: libraryFolder, date: new Date().toLocaleDateString() }
                    const updated = [newAsset, ...libraryUploadedImages]
                    setLibraryUploadedImages(updated)
                    try { localStorage.setItem('hills_admin_uploaded_images', JSON.stringify(updated)) } catch {}
                    showMsg('success', 'Image successfully uploaded to Cloudinary!')
                  }
                }}
              />
            </div>

            {/* Uploaded History */}
            <div style={{ ...cardStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
                  Recent Cloudinary Assets ({libraryUploadedImages.length})
                </h4>
                {libraryUploadedImages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear uploaded history list? (Images remain safe in Cloudinary)')) {
                        setLibraryUploadedImages([])
                        localStorage.removeItem('hills_admin_uploaded_images')
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Clear History
                  </button>
                )}
              </div>

              {libraryUploadedImages.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem' }}>
                  No assets uploaded through this session yet. Upload an image above to populate the library!
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                  {libraryUploadedImages.map((asset, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ width: '100%', height: '140px', background: '#000', position: 'relative' }}>
                        <img src={getOptimizedImageUrl(asset.url, { width: 360, height: 210, crop: 'fill' })} alt="Cloudinary asset" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.7)', color: 'var(--hill-blue-bright)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {asset.folder}
                        </span>
                      </div>
                      <div style={{ padding: '10px' }}>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                          {asset.url}
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.url)
                              showMsg('success', 'Image URL copied to clipboard!')
                            }}
                            style={{ flex: 1, padding: '5px', background: 'rgba(56,189,248,0.15)', border: '1px solid var(--hill-blue-bright)', color: 'var(--hill-blue-bright)', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <FiCopy size={11} /> Copy URL
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHAT KNOWLEDGE TAB ── */}
        {activeTab === 'knowledge' && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '2rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--hill-blue-bright)' }}>
                Add Chat Knowledge
              </h4>
              <form onSubmit={handleCreateKnowledge} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <input type="text" placeholder="Title *" required value={newKnowledge.title} onChange={e => setNewKnowledge({ ...newKnowledge, title: e.target.value })} style={inputStyle} />
                <select value={newKnowledge.category} onChange={e => setNewKnowledge({ ...newKnowledge, category: e.target.value })} style={{ ...inputStyle, background: '#001040' }}>
                  <option value="general">General</option>
                  <option value="company">Company</option>
                  <option value="package">Package</option>
                  <option value="hotel">Hotel</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="policy">Policy</option>
                  <option value="faq">FAQ</option>
                </select>
                <input type="text" placeholder="Keywords (comma-separated)" value={newKnowledge.keywords} onChange={e => setNewKnowledge({ ...newKnowledge, keywords: e.target.value })} style={inputStyle} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <textarea placeholder="Knowledge content *" required value={newKnowledge.content} onChange={e => setNewKnowledge({ ...newKnowledge, content: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Add Knowledge</button>
              </form>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Knowledge Base ({knowledge.length})</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {knowledge.map(k => (
                <div key={k.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--hill-blue-bright)', fontWeight: 700, textTransform: 'uppercase' }}>{k.category}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '4px 0' }}>{k.title}</h4>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: k.active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: k.active ? '#86EFAC' : '#FCA5A5', fontSize: '0.65rem' }}>
                      {k.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '8px', lineHeight: 1.5 }}>{k.content}</p>
                  {k.keywords?.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {k.keywords.map((kw: string) => (
                        <span key={kw} style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SOCIAL LINKS TAB ── */}
        {activeTab === 'social' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>Social Media Links</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  Manage the official social media channels and WhatsApp chat links displayed in the website header, footer, and inquiry widgets.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  setEditingSocial(null)
                  setSocialForm({ platform: 'instagram', url: '', active: true, order: (socialList.length + 1) * 10 })
                  setIsCreatingSocial(true)
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '8px 16px' }}
              >
                <FiPlus size={16} /> Add Social Link
              </button>
            </div>

            {/* Social Link Form Modal */}
            {(isCreatingSocial || editingSocial) && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '1rem',
              }}>
                <div style={{ ...cardStyle, background: '#0a1738', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
                      {editingSocial ? 'Edit Social Link' : 'Add New Social Link'}
                    </h4>
                    <button
                      onClick={() => { setIsCreatingSocial(false); setEditingSocial(null) }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      <FiX />
                    </button>
                  </div>

                  <form onSubmit={handleSaveSocial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Platform</label>
                      <select
                        value={socialForm.platform}
                        onChange={e => setSocialForm({ ...socialForm, platform: e.target.value })}
                        style={{ ...inputStyle, background: '#001040' }}
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter / X</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>
                        URL (e.g. https://wa.me/... or https://instagram.com/...)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={socialForm.url}
                        onChange={e => setSocialForm({ ...socialForm, url: e.target.value })}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Display Order</label>
                        <input
                          type="number"
                          value={socialForm.order}
                          onChange={e => setSocialForm({ ...socialForm, order: parseInt(e.target.value) || 0 })}
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.4rem' }}>
                        <input
                          type="checkbox"
                          id="socialActive"
                          checked={socialForm.active}
                          onChange={e => setSocialForm({ ...socialForm, active: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="socialActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>Active on Site</label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="btn-outline-white"
                        onClick={() => { setIsCreatingSocial(false); setEditingSocial(null) }}
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                      >
                        {editingSocial ? 'Save Changes' : 'Create Link'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Social Links List */}
            <div style={{ overflowX: 'auto', ...cardStyle }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '12px 16px' }}>Platform</th>
                    <th style={{ padding: '12px 16px' }}>Target URL</th>
                    <th style={{ padding: '12px 16px' }}>Order</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {socialList.map(s => {
                    const isWa = s.platform.toLowerCase() === 'whatsapp'
                    const isInsta = s.platform.toLowerCase() === 'instagram'
                    const isFb = s.platform.toLowerCase() === 'facebook'
                    const isYt = s.platform.toLowerCase() === 'youtube'
                    const isTw = s.platform.toLowerCase() === 'twitter'

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '4px 10px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.08)', textTransform: 'capitalize'
                          }}>
                            {isWa && <FaWhatsapp size={16} color="#25D366" />}
                            {isInsta && <FaInstagram size={16} color="#E4405F" />}
                            {isFb && <FaFacebookF size={15} color="#1877F2" />}
                            {isYt && <FaYoutube size={16} color="#FF0000" />}
                            {isTw && <FaTwitter size={15} color="#1DA1F2" />}
                            {!isWa && !isInsta && !isFb && !isYt && !isTw && <FiShare2 size={15} />}
                            {s.platform}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--hill-blue-bright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {s.url} <FiExternalLink size={12} />
                          </a>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>
                          {s.order}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            background: s.active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: s.active ? '#86EFAC' : '#FCA5A5',
                          }}>
                            {s.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleToggleSocialActive(s)}
                              title={s.active ? 'Disable link' : 'Enable link'}
                              style={{
                                padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                                color: '#ffffff', cursor: 'pointer',
                              }}
                            >
                              {s.active ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingSocial(s)
                                setSocialForm({ platform: s.platform, url: s.url, active: s.active, order: s.order || 10 })
                                setIsCreatingSocial(false)
                              }}
                              title="Edit link"
                              style={{
                                padding: '4px 8px', borderRadius: '4px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                                color: '#ffffff', cursor: 'pointer',
                              }}
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSocial(s.id)}
                              title="Delete link"
                              style={{
                                padding: '4px 8px', borderRadius: '4px',
                                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                color: '#FCA5A5', cursor: 'pointer',
                              }}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {socialList.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        No social links configured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SEO CMS TAB ── */}
        {activeTab === 'seo' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                Search Engine Optimization (SEO CMS)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                Manage page titles, descriptions, canonical URLs, and crawler indexing rules for all public routes.
                Updates trigger instant cache revalidation.
              </p>
            </div>

            {/* SEO Edit Modal */}
            {editingSEO && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '1rem',
              }}>
                <div style={{
                  ...cardStyle, background: '#0a1738', width: '100%', maxWidth: '650px',
                  maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600 }}>
                        SEO Configuration
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--hill-blue-bright)', fontWeight: 600 }}>
                        Route: {editingSEO.route}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingSEO(null)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      <FiX />
                    </button>
                  </div>

                  {/* Google Search Live Preview */}
                  <div style={{
                    background: '#1f2023', borderRadius: '8px', padding: '1rem',
                    marginBottom: '1.5rem', border: '1px solid #3c4043',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#9aa0a6', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Google Search Preview</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#bdc1c6', marginBottom: '4px' }}>
                      https://hillstourism.com{editingSEO.route === '/' ? '' : editingSEO.route}
                    </div>
                    <div style={{
                      color: '#8ab4f8', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.3,
                      marginBottom: '6px', cursor: 'pointer',
                    }}>
                      {editingSEO.title || 'Page Title Placeholder'}
                    </div>
                    <div style={{ color: '#bdc1c6', fontSize: '0.85rem', lineHeight: 1.4 }}>
                      {editingSEO.description || 'Page meta description snippet will appear here in search engine results.'}
                    </div>
                  </div>

                  <form onSubmit={handleSaveSEO} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                          SEO Title *
                        </label>
                        <span style={{
                          fontSize: '0.7rem',
                          color: (editingSEO.title?.length || 0) > 60 ? '#FCA5A5' : 'rgba(255,255,255,0.5)',
                        }}>
                          {editingSEO.title?.length || 0} / 60 characters (recommended: 50–60)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={editingSEO.title || ''}
                        onChange={e => setEditingSEO({ ...editingSEO, title: e.target.value })}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                          SEO Description *
                        </label>
                        <span style={{
                          fontSize: '0.7rem',
                          color: (editingSEO.description?.length || 0) > 160 ? '#FCA5A5' : 'rgba(255,255,255,0.5)',
                        }}>
                          {editingSEO.description?.length || 0} / 160 characters (recommended: 120–160)
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={editingSEO.description || ''}
                        onChange={e => setEditingSEO({ ...editingSEO, description: e.target.value })}
                        style={{ ...inputStyle, resize: 'vertical' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>
                          Canonical URL Override (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder={editingSEO.route}
                          value={editingSEO.canonicalUrl || ''}
                          onChange={e => setEditingSEO({ ...editingSEO, canonicalUrl: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>
                          Robots / Indexing Directive
                        </label>
                        <select
                          value={editingSEO.robots || 'index, follow'}
                          onChange={e => setEditingSEO({ ...editingSEO, robots: e.target.value })}
                          style={{ ...inputStyle, background: '#001040' }}
                        >
                          <option value="index, follow">index, follow (Standard Indexing)</option>
                          <option value="noindex, nofollow">noindex, nofollow (Hidden from Search)</option>
                          <option value="noindex, follow">noindex, follow (No index, Follow Links)</option>
                          <option value="index, nofollow">index, nofollow (Index, Don't Follow Links)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>
                          Open Graph Title (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Defaults to SEO Title"
                          value={editingSEO.ogTitle || ''}
                          onChange={e => setEditingSEO({ ...editingSEO, ogTitle: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>
                          Open Graph Image URL (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="https://res.cloudinary.com/..."
                          value={editingSEO.ogImage || ''}
                          onChange={e => setEditingSEO({ ...editingSEO, ogImage: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        type="button"
                        onClick={() => handleResetSEO(editingSEO.route)}
                        style={{
                          background: 'none', border: '1px solid rgba(239,68,68,0.4)',
                          color: '#FCA5A5', padding: '8px 14px', borderRadius: '6px',
                          fontSize: '0.8rem', cursor: 'pointer',
                        }}
                      >
                        Reset to Default
                      </button>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="button"
                          className="btn-outline-white"
                          onClick={() => setEditingSEO(null)}
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ padding: '8px 22px', fontSize: '0.85rem' }}
                        >
                          Save SEO Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* SEO Table */}
            <div style={{ overflowX: 'auto', ...cardStyle }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '12px 16px' }}>Route</th>
                    <th style={{ padding: '12px 16px' }}>SEO Title</th>
                    <th style={{ padding: '12px 16px' }}>Meta Description</th>
                    <th style={{ padding: '12px 16px' }}>Robots</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seoList.map(item => (
                    <tr key={item.route} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px',
                          background: 'rgba(8,120,255,0.15)', color: 'var(--hill-blue-bright)',
                          fontFamily: 'monospace', fontSize: '0.8rem',
                        }}>
                          {item.route}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px',
                          background: item.robots?.includes('noindex') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                          color: item.robots?.includes('noindex') ? '#FCA5A5' : '#86EFAC',
                        }}>
                          {item.robots || 'index, follow'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setEditingSEO({ ...item })}
                            className="btn-primary"
                            style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                          >
                            Edit SEO
                          </button>
                          <button
                            onClick={() => handleResetSEO(item.route)}
                            title="Reset to default SEO"
                            style={{
                              padding: '4px 8px', borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                              color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                            }}
                          >
                            <FiRefreshCw size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {seoList.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        Loading SEO entries...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Site Settings</h3>
            {contentData?.settings ? (
              <form onSubmit={handleUpdateSettings} style={cardStyle}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {Object.entries(contentData.settings).map(([key, val]) => (
                    <div key={key}>
                      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={String(val)}
                        onChange={e => setContentData({
                          ...contentData,
                          settings: { ...contentData.settings, [key]: e.target.value },
                        })}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Save Settings</button>
              </form>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading settings...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
