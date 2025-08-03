/**
 * @fileoverview This file initializes and configures the Genkit AI toolkit.
 * It sets up the Google AI plugin and exports a global `ai` object that
 * is used throughout the application to define and run AI flows.
 */
import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const google = googleAI({
  apiVersion: ['v1beta'],
});

export const plugins: Plugin[] = [google];

export const ai = genkit({
  plugins: plugins,
  // We recommend using a different log level in production.
  logLevel: 'debug',
  // We recommend using a different flow state store in production.
  flowStateStore: 'firebase',
  // We recommend using a different trace store in production.
  traceStore: 'firebase',
  // We recommend using a different credentials store in production.
  credentialStore: 'firebase',
});
