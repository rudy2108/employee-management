import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { holidayAPI, optionsAPI, type Holiday } from '../../services/Api'
import { getErrorMessage } from '../../lib/Utils'

interface HolidaysModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HolidaysModal({ isOpen, onClose }: HolidaysModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [newHolidayName, setNewHolidayName] = useState('')
  const [newHolidayDate, setNewHolidayDate] = useState('')
  const [newHolidayType, setNewHolidayType] = useState<Holiday['type']>('Public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: holidayTypes = [] } = useQuery({ queryKey: ['holidayTypes'], queryFn: optionsAPI.fetchHolidayTypes })

  const HOLIDAYS_PER_PAGE = 6

  useEffect(() => {
    if (!isOpen) return

    const loadHolidays = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await holidayAPI.fetchAll()
        setHolidays(data)
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load holidays.'))
      } finally {
        setLoading(false)
      }
    }

    loadHolidays()
  }, [isOpen])

  const handleClose = () => {
    setSearchTerm('')
    setCurrentPage(1)
    setNewHolidayName('')
    setNewHolidayDate('')
    setNewHolidayType('Public')
    setError('')
    onClose()
  }

  const filteredHolidays = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return holidays

    return holidays.filter((holiday) =>
      holiday.name.toLowerCase().includes(query) || holiday.date.toLowerCase().includes(query)
    )
  }, [holidays, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredHolidays.length / HOLIDAYS_PER_PAGE))

  // Clamp the page during render if filtering reduced the total page count.
  if (currentPage > totalPages) {
    setCurrentPage(totalPages)
  }

  const startIndex = (currentPage - 1) * HOLIDAYS_PER_PAGE
  const endIndex = startIndex + HOLIDAYS_PER_PAGE
  const visibleHolidays = filteredHolidays.slice(startIndex, endIndex)

  const handleAddHoliday = async () => {
    if (!newHolidayName.trim() || !newHolidayDate.trim()) return

    setError('')

    try {
      const created = await holidayAPI.add({
        name: newHolidayName.trim(),
        date: newHolidayDate.trim(),
        type: newHolidayType,
      })
      setHolidays((current) => [...current, created])
      setNewHolidayName('')
      setNewHolidayDate('')
      setNewHolidayType('Public')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to add holiday.'))
    }
  }

  const handleDeleteHoliday = async (id: string | number) => {
    setError('')

    try {
      await holidayAPI.delete(id)
      setHolidays((current) => current.filter((holiday) => holiday.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete holiday.'))
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest shadow-deep">
        <div className="flex items-center justify-between border-b border-surface-container-highest p-4">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface">Company Holidays</h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              View and manage company holiday dates.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search holidays..."
                className="w-full rounded-2xl border border-outline-variant bg-surface-container px-10 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleAddHoliday}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-on-primary text-label-sm font-label-sm hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Add Holiday
            </button>
          </div>

          <div className="grid gap-3 rounded-3xl border border-surface-container-highest bg-surface-container p-4">
            <div className="grid gap-2.5 md:grid-cols-3">
              <input
                type="text"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                placeholder="Holiday name"
                className="rounded-2xl border border-outline-variant bg-white px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <input
                type="text"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                placeholder="Date (e.g. Jan 1, 2024)"
                className="rounded-2xl border border-outline-variant bg-white px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <select
                value={newHolidayType}
                onChange={(e) => setNewHolidayType(e.target.value as Holiday['type'])}
                className="rounded-2xl border border-outline-variant bg-white px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                {holidayTypes.map((type) => (
                  <option key={type.id} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-h-[40vh] overflow-y-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
                  <th className="p-3 font-medium">Holiday Name</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-body-sm font-body-sm text-on-surface">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-on-surface-variant">
                      Loading holidays...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-error">
                      {error}
                    </td>
                  </tr>
                ) : filteredHolidays.length > 0 ? (
                  visibleHolidays.map((holiday) => (
                    <tr key={holiday.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-3 font-medium text-on-surface">{holiday.name}</td>
                      <td className="p-3 text-on-surface-variant">{holiday.date}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-label-sm font-label-sm ${
                          holiday.type === 'Public'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary/10 text-secondary'
                        }`}>
                          {holiday.type}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="rounded-2xl border border-error px-3 py-2 text-error text-label-sm font-label-sm hover:bg-error/10 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-on-surface-variant">
                      No holidays found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-surface-container-highest text-on-surface-variant md:flex-row md:items-center md:justify-between">
            <p className="text-label-sm font-label-sm">
              Showing {visibleHolidays.length} of {filteredHolidays.length} holidays
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-2xl border border-outline-variant bg-surface-container px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container-high transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-label-sm font-label-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-2xl border border-outline-variant bg-surface-container px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container-high transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
