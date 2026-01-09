import { create } from 'zustand';
import { SchemaField } from '@/components/GeneratorEngine';

interface SchemaState {
    schema: SchemaField[];
    setSchema: (schema: SchemaField[]) => void;
    resetSchema: () => void;
}

const DEFAULT_SCHEMA: SchemaField[] = [
    { key: 'id', type: 'uuid' },
    { key: 'full_name', type: 'name' },
    { key: 'email_address', type: 'email' },
    { key: 'role', type: 'company' },
    { key: 'is_active', type: 'boolean' },
];

export const useSchemaStore = create<SchemaState>((set) => ({
    schema: DEFAULT_SCHEMA,
    setSchema: (schema) => set({ schema }),
    resetSchema: () => set({ schema: DEFAULT_SCHEMA }),
}));
