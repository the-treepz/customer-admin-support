'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { convertCurrency, formatCurrency } from "@/lib/currency"

import { Badge } from '@/components/ui/badge'
import {
  BookingTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/bookingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaginationControl } from '@/components/ui/pagination-control'
import { Spinner } from '@/components/ui/spinner'

import { fetchFlights } from '@/lib/api'
import { Booking, BookingStatus, SUPPORTED_CURRENCIES } from '@/types/booking'
import { fetchExchangeRates } from '@/lib/exchange-rate'
import { Currency } from '@/types'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    Confirmed: 'bg-green-600',
    Pending: 'bg-yellow-500',
    Cancelled: 'bg-gray-500',
    Failed: 'bg-red-600',
    Initialized: 'bg-yellow-600',
  }

  return <Badge className={styles[status]}>{status}</Badge>
}

const normalizeStatus = <T extends string>(value: string): T =>
  (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()) as T


export default function BookingPage() {
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [allFlightsBooking, setAllFlightsBooking] = useState<Booking[]>([])
  const [totalFlightsBooking, setTotalFlightsBooking] = useState(0)
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [rates, setRates] = useState<Record<string, number>>({})
  const [currency, setCurrency] = useState<Currency>('NGN')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase())
      setCurrentPage(1)
    }, 500)

  return () => clearTimeout(t)
}, [search])


  useEffect(() => {
    const loadFlight = async () => {
      console.log(loadFlight)
      try {
        setLoading(true)

        const res = await fetchFlights({
          page: currentPage,
          limit: 20,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: "flight",
          date: dateFilter || undefined,
          search: debouncedSearch || undefined
        })

        setAllFlightsBooking(res.data ?? [])
        setTotalFlightsBooking(res.total ?? 0)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadFlight()
  }, [currentPage, statusFilter, dateFilter, debouncedSearch])

  useEffect(() => {
    const loadRates = async () => {
      try {
        const data = await fetchExchangeRates("NGN")
        setRates(data)
      } catch (err) {
        console.error("Exchange rate error", err)
      }
    }

    loadRates()
  }, [])

const filteredBookings = useMemo(() => {
  const searchLower = search.trim().toLowerCase()
  if (!searchLower) return allFlightsBooking

  return allFlightsBooking.filter((booking) =>
    booking.id.toLowerCase().includes(searchLower) ||
    String(booking.user).toLowerCase().includes(searchLower)
  )
}, [allFlightsBooking, search])

  const totalPages = Math.max(1, Math.ceil(totalFlightsBooking / 20))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Booking Table</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by booking ID or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white max-w-sm"
        />

        <div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value === 'all'
                ? "all"
                : normalizeStatus<BookingStatus>(value)
              )
            }
          >
            <SelectTrigger className="w-140px h-9 bg-muted/30 border-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Initialized">Initialized</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as Currency)}
          >
            <SelectTrigger className="w-140px h-9">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SUPPORTED_CURRENCIES.map((cur) => (
                  <SelectItem key={cur} value={cur}>
                    {cur}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSearch('')
            setDebouncedSearch('')
            setStatusFilter('all')
            setDateFilter('')
            setCurrentPage(1)
          }}
        >
          Reset
        </Button>
      </div>

      {/* Table */}
      <BookingTable>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Airline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                <Spinner className="h-6 w-6 mx-auto" />
              </TableCell>
            </TableRow>
          ) : allFlightsBooking.length ? (
            filteredBookings.map((flight) => (
              <TableRow
                key={flight.id}
                onClick={() => router.push(`/admin/bookings/${flight.id}`)}
                className="cursor-pointer"
              >
                <TableCell>{flight.id}</TableCell>
                <TableCell>{String(flight.user)}</TableCell>
                <TableCell>{flight.flightIdentifier}</TableCell>
                <TableCell>
                  <StatusBadge status={flight.status} />
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    convertCurrency(flight.totalAmount, currency, rates),
                    currency
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {new Date(flight.created).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                No bookings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </BookingTable>

      {/* Pagination */}
      {totalFlightsBooking > 20 && (
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

