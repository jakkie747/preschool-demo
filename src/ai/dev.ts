/**
 * @fileoverview This file is the entry point for running Genkit in a development
 * environment. It imports the necessary flows and starts the Genkit development
 * server, allowing you to test and interact with your AI flows locally.
 */
import {dev} from 'genkit';
import {plugins}_ from './genkit';

// Import flows here.
import './flows/creative-ideas-flow';

dev({
  plugins: plugins,
  // You can specify a different port here.
  port: 3400,
});
