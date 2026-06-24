import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { optionsAPI, policyAPI, type Policy } from '../../services/Api'
import { getErrorMessage } from '../../lib/Utils'

interface PoliciesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PoliciesModal({ isOpen, onClose }: PoliciesModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [policies, setPolicies] = useState<Policy[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPolicyName, setNewPolicyName] = useState('')
  const [newPolicyCategory, setNewPolicyCategory] = useState('Operational')
  const [newPolicyDescription, setNewPolicyDescription] = useState('')
  const [newPolicyEffectiveDate, setNewPolicyEffectiveDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [showPolicyDetails, setShowPolicyDetails] = useState(false)

  const { data: policyCategories = [] } = useQuery({ queryKey: ['policyCategories'], queryFn: optionsAPI.fetchPolicyCategories })

  const POLICIES_PER_PAGE = 6

  useEffect(() => {
    if (!isOpen) return

    const loadPolicies = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await policyAPI.fetchAll()
        setPolicies(data)
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load policies.'))
      } finally {
        setLoading(false)
      }
    }

    loadPolicies()
  }, [isOpen])

  const handleClose = () => {
    setSearchTerm('')
    setCurrentPage(1)
    setShowAddForm(false)
    setNewPolicyName('')
    setNewPolicyCategory('Operational')
    setNewPolicyDescription('')
    setNewPolicyEffectiveDate('')
    setError('')
    onClose()
  }

  const filteredPolicies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return policies

    return policies.filter((policy) =>
      policy.name.toLowerCase().includes(query) || policy.category.toLowerCase().includes(query)
    )
  }, [policies, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredPolicies.length / POLICIES_PER_PAGE))

  // Clamp the page during render if filtering reduced the total page count.
  if (currentPage > totalPages) {
    setCurrentPage(totalPages)
  }

  const startIndex = (currentPage - 1) * POLICIES_PER_PAGE
  const endIndex = startIndex + POLICIES_PER_PAGE
  const visiblePolicies = filteredPolicies.slice(startIndex, endIndex)

  const handleAddPolicy = async () => {
    if (!newPolicyName.trim() || !newPolicyEffectiveDate.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const created = await policyAPI.add({
        name: newPolicyName.trim(),
        category: newPolicyCategory as Policy['category'],
        description: newPolicyDescription.trim(),
        effectiveDate: newPolicyEffectiveDate,
        lastUpdated: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      })
      setPolicies((current) => [created, ...current])
      setNewPolicyName('')
      setNewPolicyCategory('Operational')
      setNewPolicyDescription('')
      setNewPolicyEffectiveDate('')
      setShowAddForm(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to add policy.'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePolicy = async (id: string | number) => {
    setError('')
    setLoading(true)

    try {
      await policyAPI.delete(id)
      setPolicies((current) => current.filter((policy) => policy.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete policy.'))
    } finally {
      setLoading(false)
    }
  }

  const handleViewPolicy = (id: string | number) => {
    const policy = policies.find((p) => p.id === id)
    if (policy) {
      setSelectedPolicy(policy)
      setShowPolicyDetails(true)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Operational':
        return 'bg-primary/10 text-primary'
      case 'General':
        return 'bg-secondary/10 text-secondary'
      case 'Legal':
        return 'bg-tertiary-container/20 text-tertiary'
      default:
        return 'bg-surface-container text-on-surface-variant'
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-surface-container-highest bg-surface-container-lowest shadow-deep">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-container-highest p-4">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface">Company Policies</h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              View and manage company policies and documents.
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

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search policies..."
                className="w-full rounded-2xl border border-outline-variant bg-surface-container px-10 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-error/10 p-4 text-error text-body-sm font-body-sm">
              {error}
            </div>
          )}

          {/* Add Policy Form */}
          {showAddForm && (
          <div className="grid gap-3 rounded-3xl border border-surface-container-highest bg-surface-container p-4">
            <div className="grid gap-3">
              {/* Policy Name */}
              <div className="col-span-2">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="e.g., Remote Work Protocol 2024"
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              {/* Category and Effective Date */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                    Category
                  </label>
                  <select
                    value={newPolicyCategory}
                    onChange={(e) => setNewPolicyCategory(e.target.value)}
                    className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors"
                  >
                    {policyCategories.map((category) => (
                      <option key={category.id} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={newPolicyEffectiveDate}
                    onChange={(e) => setNewPolicyEffectiveDate(e.target.value)}
                    className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                  Description
                </label>
                <textarea
                  value={newPolicyDescription}
                  onChange={(e) => setNewPolicyDescription(e.target.value)}
                  placeholder="Briefly describe the objective and scope of this policy..."
                  rows={3}
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewPolicyName('')
                    setNewPolicyCategory('Operational')
                    setNewPolicyDescription('')
                    setNewPolicyEffectiveDate('')
                    setError('')
                    setShowAddForm(false)
                  }}
                  className="flex-1 rounded-2xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPolicy}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-primary px-3 py-2 text-body-md text-on-primary font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Add Policy Button - Show when form is hidden */}
          {!showAddForm && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-on-primary text-label-sm font-label-sm hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
                Add New Policy
              </button>
            </div>
          )}

          {/* Policies Table */}
          <div className="overflow-x-auto border border-surface-container-highest rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider">
                  <th className="p-3 font-medium">Policy Name</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Last Updated</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-sm divide-y divide-surface-container-highest">
                {visiblePolicies.length > 0 ? (
                  visiblePolicies.map((policy) => (
                    <tr
                      key={policy.id}
                      className="hover:bg-surface-container-low/50 transition-colors group"
                    >
                      <td className="p-3 font-medium text-on-surface">{policy.name}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-label-sm font-label-sm ${getCategoryColor(
                            policy.category
                          )}`}
                        >
                          {policy.category}
                        </span>
                      </td>
                      <td className="p-3 text-on-surface-variant">{policy.lastUpdated}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewPolicy(policy.id)}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                            title="View policy"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePolicy(policy.id)}
                            className="p-1 text-on-surface-variant hover:text-error transition-colors"
                            title="Delete policy"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-50">
                          policy
                        </span>
                        <p className="text-body-sm font-body-sm">No policies found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>
                Showing {startIndex + 1}–{Math.min(endIndex, filteredPolicies.length)} of{' '}
                {filteredPolicies.length}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="px-3 py-1">
                  {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Policy Details Modal */}
      {showPolicyDetails && selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowPolicyDetails(false)} />
          <div className="relative w-full max-w-2xl rounded-3xl border border-surface-container-highest bg-surface-container-lowest shadow-deep overflow-hidden">
            {/* Details Header */}
            <div className="flex items-center justify-between border-b border-surface-container-highest p-4">
              <div>
                <h2 className="text-headline-md font-headline-md text-on-surface">{selectedPolicy.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyDetails(false)}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-4">
                {/* Category */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                    Category
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-label-sm font-label-sm ${getCategoryColor(
                      selectedPolicy.category
                    )}`}
                  >
                    {selectedPolicy.category}
                  </span>
                </div>

                {/* Effective Date */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                    Effective Date
                  </label>
                  <p className="text-body-md text-on-surface">{selectedPolicy.effectiveDate}</p>
                </div>

                {/* Last Updated */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                    Last Updated
                  </label>
                  <p className="text-body-md text-on-surface">{selectedPolicy.lastUpdated}</p>
                </div>

                {/* Description */}
                {selectedPolicy.description && (
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface-variant mb-2">
                      Description
                    </label>
                    <p className="text-body-md text-on-surface whitespace-pre-wrap">{selectedPolicy.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details Footer */}
            <div className="border-t border-surface-container-highest p-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPolicyDetails(false)}
                className="px-4 py-2 rounded-2xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors text-label-md font-label-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
