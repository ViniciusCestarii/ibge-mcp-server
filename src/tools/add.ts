import { z } from "zod";

export const addTool = {
  name: "add",
  description: "Add two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async (args: { a: number; b: number }) => {
    return String(args.a + args.b);
  },
};
