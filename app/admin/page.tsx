"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  BookingTable, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/bookingTable"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar, CreditCard, AlertTriangle, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchAllPayment, fetchFlights } from "@/lib/api"
import { Booking, BookingStatus, BookingType, MetricCardProps } from "@/types/booking"
import { Currency, Payment, PaymentStatus } from "@/types/payment"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchExchangeRates } from "@/lib/exchange-rate"


function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    Confirmed: "bg-green-600",
    Pending: "bg-yellow-500",
    Cancelled: "bg-gray-500",
    Failed: "bg-red-600",
    Initialized: "bg-yellow-700",
  }

  return <Badge className={styles[status]}>{status}</Badge>
}

const MetricCard = ({ title, value, icon: Icon, onClick }: MetricCardProps) => (
  <Card
    className="cursor-pointer hover:shadow-lg transition-shadow"
    onClick={onClick}
  >
    <CardHeader className="flex justify-between items-center">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent className="text-2xl font-semibold">{value}</CardContent>
  </Card>
)
const AdminDashboard = () => {
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [bookingType, setBookingType] = useState<BookingType>('flight')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [totalBookings, setTotalBookings] = useState(0)

  const [currency, setCurrency] = useState<Currency>('NGN')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)


  const amountToNumber = (amount: number | string) =>
    Number(amount.toString().replace(/[^\d.]/g, ""))

  const normalizeStatus = <T extends string>(status: string): T => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    ) as T
  }

  const metrics = useMemo(() => {
    const successful = allPayments.filter(
      p => normalizeStatus<PaymentStatus>(p.status) === 'Success'
    ).length

    const failed = allPayments.filter(p => p.status === 'Failed').length;
    const revenue = allPayments
      .filter(p => normalizeStatus<PaymentStatus>(p.status) === 'Success')
      .reduce((sum, p) => sum + amountToNumber(p.amount), 0)

    return {
      totalBookings,
      successfulPayments: successful,
      failedPayments: failed,
      totalRevenue: revenue,
    };
  }, [allPayments, totalBookings]);

  useEffect(() => {  
    if (bookingType === 'hotel') {
      setBookings([])
      setTotalBookings(0)
      setLoading(false)
      return
    }
    const loadDashboard = async () => {
      setLoading(true)
      try {
        const [flightsRes, paymentsRes] = await Promise.all([
          fetchFlights({ page: currentPage, limit: 5, type: 'flight' }),
          fetchAllPayment({ page: 1, limit: 1000 }),
        ])

        setBookings(Array.isArray(flightsRes.data) ? flightsRes.data : [])
        setTotalBookings(flightsRes.total ?? 0,)
        setAllPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
      } catch (error: any) {
        console.error("Dashboard fetch error:", error)
        if (error.status === 401) router.replace("/")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [currentPage, router, bookingType])

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

  const convertAmount = (amount: number) => {
    if (currency === "NGN") return amount
    return rates[currency]
      ? amount * rates[currency]
      : amount
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Treepz Admin Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Bookings"
          value={metrics.totalBookings}
          icon={Calendar}
        />
        <MetricCard
          title="Successful Payments"
          value={metrics.successfulPayments}
          icon={CreditCard}
        />
        <MetricCard
          title="Failed Payments"
          value={metrics.failedPayments}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Total Revenue"
          value={`${convertAmount(metrics.totalRevenue).toLocaleString(
            undefined, {
            style: 'currency',
            currency,
          }
          )}`}
          icon={Wallet}
          onClick={() => router.push("/admin/payments")}
        />
      </div>

      <div className="p-2 flex justify-between">
        <Tabs
          value={bookingType}
          onValueChange={(value) => {
            if (value === 'hotel') return
            setBookingType(value as BookingType)
            setCurrentPage(1)
          }}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="flight">Flight</TabsTrigger>
            <TabsTrigger
              value="hotel"
              disabled
              className="opacity-50 cursor-not-allowed">Hotel(coming soon)</TabsTrigger>
          </TabsList>

          <TabsContent value="hotel">
            <BookingTable />
          </TabsContent>
          <TabsContent value="flight">
            {/* <PaymentTable /> */}
          </TabsContent>
        </Tabs>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/bookings")}
        >
          View More
        </Button>
      </div>
      <BookingTable>
        <TableHeader>
          <TableRow>
            <TableHead className="w-100px">Index</TableHead>
            <TableHead className="w-100px">Booking ID</TableHead>
            <TableHead className="w-100px">User</TableHead>
            <TableHead className="w-100px">Trip Type</TableHead>
            <TableHead className="w-100px">Status</TableHead>
            <TableHead className="w-100px">Amount</TableHead>
            <TableHead className="w-100px">Created date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bookings.map((booking, index) => (
            <TableRow
              key={booking.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{booking.id}</TableCell>
              <TableCell className="font-medium">{booking.user}</TableCell>
              <TableCell className="font-medium">{booking.type}</TableCell>
              <TableCell className="font-medium">
                <StatusBadge status={booking.status} />
              </TableCell>
              <TableCell className="font-medium">
                {convertAmount(booking.totalAmount).toLocaleString(undefined, {
                  style: "currency",
                  currency,
                })}
              </TableCell>
              <TableCell className="font-medium">
                {new Date(booking.created).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </BookingTable>
    </div>
  )
}

export default AdminDashboard
