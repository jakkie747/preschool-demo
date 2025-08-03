'use server';
/**
 * @fileOverview A flow for generating creative ideas for a preschool classroom.
 *
 * This file defines a Genkit flow that takes a category (like "Story Starters"
 * or "Activity Ideas") and generates a list of five unique, age-appropriate ideas.
 *
 * - generateCreativeIdeas - A function that handles the idea generation process.
 * - CreativeIdeaInput - The input type for the flow.
 * - CreativeIdeaOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the creative ideas flow.
const CreativeIdeaInputSchema = z.object({
  category: z.string().describe('The category of ideas to generate, e.g., "Story Starters" or "Activity Ideas"'),
});
export type CreativeIdeaInput = z.infer<typeof CreativeIdeaInputSchema>;

// Define the output schema for a single creative idea.
const IdeaSchema = z.object({
  title: z.string().describe('A short, catchy title for the idea.'),
  description: z.string().describe('A one or two-sentence description of the idea, appropriate for a preschool teacher.'),
});

// Define the output schema for the entire flow, which is an array of ideas.
const CreativeIdeaOutputSchema = z.object({
  ideas: z.array(IdeaSchema).length(5).describe('An array of exactly 5 creative ideas.'),
});
export type CreativeIdeaOutput = z.infer<typeof CreativeIdeaOutputSchema>;

// Exported wrapper function that calls the Genkit flow.
export async function generateCreativeIdeas(input: CreativeIdeaInput): Promise<CreativeIdeaOutput> {
  return creativeIdeasFlow(input);
}

// Define the prompt for the AI model.
const creativePrompt = ai.definePrompt({
  name: 'creativeIdeasPrompt',
  input: {schema: CreativeIdeaInputSchema},
  output: {schema: CreativeIdeaOutputSchema},
  prompt: `You are an expert in early childhood education. Your task is to generate 5 unique and creative ideas for a preschool classroom based on the given category. The ideas should be engaging, age-appropriate for 3-5 year olds, and easy for a teacher to implement.

Category: {{{category}}}

Please provide exactly 5 ideas in the specified JSON format.`,
});

// Define the Genkit flow.
const creativeIdeasFlow = ai.defineFlow(
  {
    name: 'creativeIdeasFlow',
    inputSchema: CreativeIdeaInputSchema,
    outputSchema: CreativeIdeaOutputSchema,
  },
  async (input) => {
    const llmResponse = await creativePrompt(input);
    const output = llmResponse.output;

    if (!output) {
      throw new Error("The AI model did not return any output.");
    }
    
    return output;
  }
);
