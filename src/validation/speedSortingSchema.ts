import z from "zod";

export const speedSortingCategorySchema = z
  .array(
    z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(50, "Category name must be less than 50 characters")
      .regex(
        /^[a-zA-Z0-9\s\-_]+$/,
        "Category name can only contain letters, numbers, spaces, hyphens, and underscores",
      ),
  )
  .min(1, "At least one category is required")
  .max(5, "No more than five categories are allowed")
  .refine(
    (categories) => {
      const uniqueCategories = new Set(
        categories.map((cat) => cat.toLowerCase()),
      );
      return uniqueCategories.size === categories.length;
    },
    { message: "Categories must be unique" },
  );

const wordSchema = z.object({
  text: z
    .string()
    .min(2, "Word must be at least 2 characters")
    .max(30, "Word must be less than 30 characters"),
  categoryIndex: z.number().min(0, "Invalid category selection"),
  image: z.instanceof(File).optional().nullable(),
});

export const speedSortingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  thumbnail: z.instanceof(File, { message: "Thumbnail is required" }),
  categories: speedSortingCategorySchema,
  words: z
    .array(wordSchema)
    .min(1, "At least one word is required")
    .max(20, "No more than twenty words are allowed"),
});
