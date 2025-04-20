import { z } from "zod";

// Full validation schema (same as server-side)
const WorkerSchema = z
  .object({
    matchWords: z
      .record(
        z.object({
          className: z.string().optional(),
          asciColor: z
            .string()
            .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
            .optional(),
          bold: z.boolean().optional(),
          italic: z.boolean().optional(),
          dim: z.boolean().optional(),
          underline: z.boolean().optional(),
        }),
      )
      .optional(),
    matchPatterns: z
      .array(
        z.object({
          pattern: z.instanceof(RegExp),
          options: z.object({
            className: z.string().optional(),
            asciColor: z.string().optional(),
            bold: z.boolean().optional(),
            italic: z.boolean().optional(),
            dim: z.boolean().optional(),
            underline: z.boolean().optional(),
          }),
        }),
      )
      .optional(),
    defaultStyle: z
      .object({
        className: z.string().optional(),
        asciColor: z.string().optional(),
        bold: z.boolean().optional(),
        italic: z.boolean().optional(),
        dim: z.boolean().optional(),
        underline: z.boolean().optional(),
      })
      .optional(),
    lineNumbers: z.boolean().optional(),
  })
  .strict();

// Handle messages from main thread
self.onmessage = (event) => {
  const { id, schema } = event.data;

  try {
    const result = WorkerSchema.safeParse(schema);
    self.postMessage({
      id,
      result: {
        valid: result.success,
        errors: result.success
          ? null
          : result.error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
      },
    });
  } catch (error) {
    self.postMessage({
      id,
      result: {
        valid: false,
        errors: [{ path: "root", message: "Invalid schema structure" }],
      },
    });
  }
};
