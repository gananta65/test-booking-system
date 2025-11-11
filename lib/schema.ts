// schema.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string | null;
  image: string | null;
  emailVerified: Date | null;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  userId: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  description: string | null;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Barber {
  id: string;
  userId: string;
  name: string | null;
  specialization: string | null;
  photo: string | null;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  branchId: string;
  barberId: string | null;
  name: string;
  duration: number;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkHour {
  id: string;
  barberId: string | null;
  branchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  barberId: string | null;
  branchId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  barberId: string | null;
  branchId: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  reminderSent: boolean;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface StaffRole {
  id: string;
  userId: string;
  branchId: string;
  role: "STAFF" | "MANAGER";
  createdAt: Date;
  updatedAt: Date;
}

export type DatabaseRow = Record<string, unknown>;
