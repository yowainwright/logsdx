import { z } from 'zod';
import { styleOptionsSchema, tokenSchema, tokenListSchema } from './index';
import { ThemePreset } from '../types';
export type Theme = ThemePreset;

export type StyleOptions = z.infer<typeof styleOptionsSchema>;
export type Token = z.infer<typeof tokenSchema>;
export type TokenList = z.infer<typeof tokenListSchema>;

export type JsonSchemaOptions ={
  name?: string;
  $description?: string;
  description?: string;
}