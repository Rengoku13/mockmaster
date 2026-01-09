import { faker } from '@faker-js/faker';

export type FieldType = 'name' | 'email' | 'phone' | 'address' | 'company' | 'date' | 'uuid' | 'boolean' | 'amount' | 'avatar' | 'sentence' | 'enum';

export interface FieldOptions {
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  values?: string[]; // For enum
}

export interface SchemaField {
  key: string;
  type: FieldType;
  options?: FieldOptions;
}

export const generateData = (schema: SchemaField[], count: number = 5) => {
  return Array.from({ length: count }).map(() => {
    const row: Record<string, any> = {};

    schema.forEach((field) => {
      const opts = field.options || {};

      switch (field.type) {
        case 'name':
          row[field.key] = faker.person.fullName();
          break;
        case 'email':
          row[field.key] = faker.internet.email();
          break;
        case 'phone':
          row[field.key] = faker.phone.number();
          break;
        case 'address':
          row[field.key] = faker.location.streetAddress();
          break;
        case 'company':
          row[field.key] = faker.company.name();
          break;
        case 'date':
          if (opts.minDate && opts.maxDate) {
            row[field.key] = faker.date.between({ from: opts.minDate, to: opts.maxDate }).toISOString();
          } else {
            row[field.key] = faker.date.recent().toISOString();
          }
          break;
        case 'uuid':
          row[field.key] = faker.string.uuid();
          break;
        case 'boolean':
          row[field.key] = faker.datatype.boolean();
          break;
        case 'amount':
          const min = opts.min !== undefined ? opts.min : 0;
          const max = opts.max !== undefined ? opts.max : 1000;
          row[field.key] = parseFloat(faker.finance.amount({ min, max }));
          break;
        case 'avatar':
          row[field.key] = faker.image.avatar();
          break;
        case 'sentence':
          row[field.key] = faker.lorem.sentence();
          break;
        case 'enum':
          if (opts.values && opts.values.length > 0) {
            row[field.key] = faker.helpers.arrayElement(opts.values);
          } else {
            row[field.key] = null;
          }
          break;
        default:
          row[field.key] = null;
      }
    });

    // Add some realistic relationships (Contextual Data)
    if (row.email && row.name) {
      // Only simplify email if it wasn't customized? Actually keep this behavior for now as it makes data look coherent
      // But if we had options for email provider, we might want to respect that.
      // For now, let's keep the correlation
      const namePart = row.name.toLowerCase().replace(/\s+/g, '.');
      row.email = `${namePart}@${faker.internet.domainName()}`;
    }

    return row;
  });
};
