export interface SchemaProperty {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  example?: string;
}

export interface SchemaSection {
  title: string;
  description: string;
  properties: SchemaProperty[];
}
