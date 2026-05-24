import { z } from 'zod';

export const AddPersonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export const AddTransactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  direction: z.enum(['lent', 'borrowed']),
  date: z.date(),
  note: z.string().max(200, 'Note must be under 200 characters').optional(),
});

export const SignUpSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});
