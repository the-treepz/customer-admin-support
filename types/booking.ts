import { PaymentDetails } from './payment';

export type BookingStatus =
  | 'Confirmed'
  | 'Pending'
  | 'Cancelled'
  | 'Failed'
  | 'Initialized';

export type BookingType = 'hotel' | 'flight';

export type Currency = "NGN" | "USD" | "EUR" | "GBP"

export const SUPPORTED_CURRENCIES: Currency[] = [
  "NGN",
  "USD",
  "EUR",
  "GBP",
]

export type Booking = {
  id: string;
  user: string;
  flightIdentifier: string;
  status: BookingStatus;
  type: BookingType;
  totalAmount: string;
  provider?: string;
  created: string;
  currency?: 'NGN'
};

export type BookingSummary = {
  id: string;
  type: BookingType;
  status: BookingStatus;
  createdDate: string;
  totalAmount: number;
  currency: 'USD' | 'NGN' | 'GBP';
};

export type BookingListResponse = {
  data: BookingSummary[];
  total: number;
};

export type BookingDetail = {
  booking: BookingSummary;
  user: User;
  flight: FlightDetails;
  payment: PaymentDetails;
};

export type FlightDetails = {
  airlineName: string;
  flightNumber: string;
  BookingType: BookingType;
  departureAirport: { city: string };
  arrivalAirport: { city: string };
  departureDateTime: string;
  arrivalDateTime: string;
  passengerCount: number;
};

export type User = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  onClick?: () => void;
};

