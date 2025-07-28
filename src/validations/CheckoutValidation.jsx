import { z } from "zod";
import { addressType } from "@/helpers/Data";

const addressEnum = addressType.map((item) => item.value);

export const AddressSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  addressType: z.enum(addressEnum, {
    required_error: "Address type is required",
  }),
  addressline1: z.string().min(1, "Address Line 1 is required"),
  addressline2: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  states: z.string().min(1, "State is required"),
  city: z.string().min(1, "city is required"),
  pincode: z.coerce
    .number({
      required_error: "Pincode is required",
      invalid_type_error: "Pincode must be a number",
    })
    .refine((val) => !isNaN(val), {
      message: "Pincode must be a number",
    }),
  countryCode: z.string().min(1, "Country Code is required"),
  phone: z.string().min(1, "Phone number is required"),
  primary: z.boolean(),
});

export const CheckoutSchema = z
  .object({
    email: z.string().email("Invalid email"),
    emailSubscribedStatus: z.boolean().default(true),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .optional(),

    useShippingAsBilling: z.boolean().default(true),
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema.optional(),
    paymentMethod: z.string().default("credit-card"),
    cardDetails: z.object({
      cardNumber: z
        .string()
        .min(12, "Card number must be at least 12 digits")
        .max(19, "Card number must not exceed 19 digits")
        .regex(/^\d+$/, "Card number must contain only digits"),
      cardExpire: z.string().min(1, "Card expire is required"),
      cardCvv: z
        .string()
        .min(3, "CVV must be at least 3 digits")
        .max(4, "CVV must not exceed 4 digits")
        .regex(/^\d+$/, "CVV must contain only digits"),
      cardHolderName: z.string().min(1, "Card holder name is required"),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.useShippingAsBilling && !data.billingAddress) {
      ctx.addIssue({
        path: ["billingAddress"],
        code: z.ZodIssueCode.custom,
        message: "Billing address is required when not using shipping address",
      });
    }
  });
