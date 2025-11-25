'use server';

/**
 * @fileOverview A smart notification filtering AI agent.
 *
 * - filterNotifications - A function that filters messages based on importance and relevance.
 * - FilterNotificationsInput - The input type for the filterNotifications function.
 * - FilterNotificationsOutput - The return type for the filterNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterNotificationsInputSchema = z.object({
  messages: z
    .array(z.string())
    .describe('An array of messages to be filtered.'),
});
export type FilterNotificationsInput = z.infer<typeof FilterNotificationsInputSchema>;

const FilterNotificationsOutputSchema = z.object({
  filteredMessages: z
    .array(z.string())
    .describe('An array of messages filtered for importance and relevance.'),
});
export type FilterNotificationsOutput = z.infer<typeof FilterNotificationsOutputSchema>;

export async function filterNotifications(input: FilterNotificationsInput): Promise<FilterNotificationsOutput> {
  return filterNotificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterNotificationsPrompt',
  input: {schema: FilterNotificationsInputSchema},
  output: {schema: FilterNotificationsOutputSchema},
  prompt: `You are an AI assistant helping to filter notifications for a user to avoid information overload.

  Given the following messages, determine which messages are most important and relevant to the ongoing conversation or project updates. Filter out any messages that are redundant, trivial, or not immediately actionable.

  Messages:
  {{#each messages}}- {{{this}}}\n{{/each}}

  Return only the messages that need immediate attention or provide critical updates.
  `, 
});

const filterNotificationsFlow = ai.defineFlow(
  {
    name: 'filterNotificationsFlow',
    inputSchema: FilterNotificationsInputSchema,
    outputSchema: FilterNotificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
