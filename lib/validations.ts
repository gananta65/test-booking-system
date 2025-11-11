import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const barberProfileSchema = z.object({
  description: z.string().optional(),
  photo: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  duration: z.number().min(15, "Minimum duration is 15 minutes"),
  price: z.number().positive("Price must be positive"),
});

export const bookingSchema = z.object({
  barberId: z.string().min(1, "Barber is required"),
  serviceId: z.string().min(1, "Service is required"),
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  notes: z.string().optional(),
});

export const workHourSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

export const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  photo: z.string().optional(),
});

export const barberSchema = z.object({
  name: z.string().optional(),
  specialization: z.string().optional(),
  photo: z.string().optional(),
});
