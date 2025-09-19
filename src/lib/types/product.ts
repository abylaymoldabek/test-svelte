// Типы для продукта и создания продукта

export interface Product {
  id: string;
  name: string;
  gtin: string;
  groupGtin?: string;
  url?: string;
  documentType?: string;
  documentNumber?: string;
  documentDate?: string;
  createdAt: string;
  // Дополнительные поля
  extraFields?: Array<{
    name: string;
    value: string | number | boolean;
    type: 'string' | 'number' | 'boolean';
  }>;
  // Дополнительный контент
  extraContent?: Array<{
    title: string;
    type: 'text' | 'image' | 'video';
    value: string;
  }>;
}

export interface ProductCreateRequest {
  name: string;
  gtin: string;
  groupGtin?: string;
  url?: string;
  documentType?: string;
  documentNumber?: string;
  documentDate?: string;
  extraFields?: Array<{
    name: string;
    value: string | number | boolean;
    type: 'string' | 'number' | 'boolean';
  }>;
  extraContent?: Array<{
    title: string;
    type: 'text' | 'image' | 'video';
    value: string;
  }>;
}
