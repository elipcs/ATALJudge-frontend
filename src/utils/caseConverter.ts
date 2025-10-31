/**
 * Utilitários para conversão entre camelCase e snake_case
 * Backend retorna camelCase após refatoração com DTOs
 */

/**
 * Converte uma string de snake_case para camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte uma string de camelCase para snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converte um objeto de snake_case para camelCase (shallow)
 */
export function objectToCamelCase<T = any>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => objectToCamelCase(item)) as any;
  }
  
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = objectToCamelCase(obj[key]);
    }
  }
  return result;
}

/**
 * Converte um objeto de camelCase para snake_case (shallow)
 */
export function objectToSnakeCase<T = any>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => objectToSnakeCase(item)) as any;
  }
  
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = objectToSnakeCase(obj[key]);
    }
  }
  return result;
}

