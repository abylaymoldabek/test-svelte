// Сервис для работы с продуктами (получение списка, добавление)
import type { Product, ProductCreateRequest } from '../types/product';

const API_BASE_URL = '';

class ProductService {
  // Получить список продуктов
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) throw new Error('Ошибка получения списка продуктов');
    return response.json();
  }

  // Добавить продукт
  async addProduct(data: ProductCreateRequest): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Ошибка добавления продукта');
    return response.json();
  }
}

export const productService = new ProductService();
