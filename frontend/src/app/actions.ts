"use server";

import { filterNotifications } from "@/ai/flows/smart-notification-filtering";
import { z } from "zod";

const FilterMessagesInput = z.object({
  messages: z.array(z.string()),
});

export async function filterImportantMessages(messages: string[]) {
  try {
    const validatedInput = FilterMessagesInput.parse({ messages });
    const result = await filterNotifications(validatedInput);
    return result;
  } catch (error) {
    console.error("Error in filterImportantMessages server action:", error);
    if (error instanceof z.ZodError) {
      throw new Error("Invalid input for filtering messages.");
    }
    throw new Error("Failed to filter messages due to a server error.");
  }
}
