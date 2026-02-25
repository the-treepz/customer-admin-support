"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { SlashIcon } from "lucide-react"

import { fetchFlightById } from "@/lib/api"
import { ApiBookingDetailResponse } from "@/types/api_booking"
import { Spinner } from "@/components/ui/spinner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>()

  const [data, setData] = useState<ApiBookingDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) {
      console.warn("⚠️ bookingId is undefined")
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchFlightById(bookingId)
        setData(res)
      } catch (err: any) {
        console.error("❌ fetchFlightById failed:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [bookingId])

  if (loading) {
    return <Spinner className="h-8 w-8 mx-auto mt-20" />
  }

  if (error) {
    return <p className="text-red-600 text-center mt-20">{error}</p>
  }

  if (!data) {
    console.warn("⚠️ No data after loading")
    return <p className="text-center mt-20">No booking found</p>
  }

  const { bookingSummary, userInfo, flightInfo, paymentInfo } = data.data

  function SummaryRow({
    label,
    value,
  }: {
    label: string
    value: React.ReactNode
  }) {
    return (
      <div className="flex justify-between items-center gap-3">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right">{value}</span>
      </div>
    )
  }

  function Section({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold uppercase text-xs tracking-wide text-muted-foreground">
          {title}
        </h3>
        <div className="space-y-1">{children}</div>
      </div>
    )
  }
  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
      confirmed: "bg-green-600",
      pending: "bg-yellow-500",
      cancelled: "bg-gray-500",
      failed: "bg-red-600",
    }

    return (
      <Badge className={map[status] ?? "bg-gray-400"}>
        {status.toUpperCase()}
      </Badge>
    )
  }
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Booking Details</h1>
        </div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/bookings">Bookings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
        <Card className="w-full md:w-[360px]">
          <CardContent className="p-5 space-y-3 text-sm">
            <SummaryRow label="Booking ID" value={bookingSummary.id} />
            <SummaryRow label="Type" value={bookingSummary.type} />
            <SummaryRow
              label="Status"
              value={<StatusBadge status={bookingSummary.status} />}
            />
            <SummaryRow
              label="Created"
              value={new Date(
                bookingSummary.createdDate
              ).toLocaleString()}
            />
            <Separator />
            <SummaryRow
              label="Total Amount"
              value={
                <span className="font-semibold">
                  {bookingSummary.currency}{" "}
                  {Number(bookingSummary.totalAmount).toLocaleString()}
                </span>
              }
            />
            <SummaryRow
              label="Currency"
              value={bookingSummary.currency}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-8 space-y-6 text-sm leading-7">
          <Section title="Customer Information">
            <p>Name: {userInfo.fullName}</p>
            <p>Email: {userInfo.email}</p>
            <p>Phone: {userInfo.phoneNumber}</p>
          </Section>
          <Section title="Flight Information">
            <p>Airline: {flightInfo.airlineName}</p>
            <p>Flight Number: {flightInfo.flightNumber}</p>
            <p>Trip Type: {flightInfo.BookingType}</p>
            <p>
              Departure:{" "}
              {new Date(
                flightInfo.departureDateTime
              ).toLocaleString()}
            </p>
            <p>
              Arrival:{" "}
              {new Date(
                flightInfo.arrivalDateTime
              ).toLocaleString()}
            </p>
            <p>Passengers: {flightInfo.passengerCount}</p>
          </Section>

          <Section title="Payment Information">
            <p>Provider: {paymentInfo.provider}</p>
            <p>Status: {paymentInfo.status}</p>
            <p>
              Amount Paid:{" "}
              {bookingSummary.currency}{" "}
              {Number(paymentInfo.amountPaid).toLocaleString()}
            </p>
            <p>Reference: {paymentInfo.reference}</p>
            {paymentInfo.failureReason && (
              <p className="text-red-600">
                Failure Reason: {paymentInfo.failureReason}
              </p>
            )}
          </Section>
        </CardContent>
      </Card>
    </div>
  )
}
