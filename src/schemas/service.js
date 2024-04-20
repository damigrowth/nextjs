import { z } from "zod";

export const objectSchema = z.object({
  id: z.number(),
  title: z.string(),
});


export const featureSchema = z.array({
  id: z.number(),
  title: z.string(),
  isCheckField: z.boolean(),
  checked: z.boolean(),
  value: z.string()
});

export const arraySchema = z.array(objectSchema);


export const featuresSchema = z.array(featureSchema);

export const packageSchema = z.object({
  id: z.number(),
  description: z.string(),
  price: z.number(),
  features: featuresSchema.optional()
});


// Define a schema for form validation
export const serviceFormSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    category: objectSchema.optional(),
    skills: arraySchema.optional(),
    price: z.number(),
    time: z.number(),
    packages: z.array(packageSchema)
  });