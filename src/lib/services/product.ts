// Сервис для работы с продуктами (получение списка, добавление)
import type { Product, ProductCreateRequest } from '../types/product';
import { httpClient } from '../utils/http-client.js';

const API_BASE_URL = '/api/v1';

class ProductService {
  // Получить список продуктов
  async getProducts(): Promise<Product[]> {
    return httpClient.get<Product[]>(`${API_BASE_URL}/products`);
  }

  // Получить один продукт по ID
  async getProduct(id: string): Promise<Product> {
    return httpClient.get<Product>(`${API_BASE_URL}/products/${id}`);
  }

  // Добавить продукт
  async addProduct(data: ProductCreateRequest): Promise<Product> {
    return httpClient.post<Product>(`${API_BASE_URL}/products`, data);
  }

  // Обновить продукт
  async updateProduct(id: string, data: Partial<ProductCreateRequest>): Promise<Product> {
    return httpClient.put<Product>(`${API_BASE_URL}/products/${id}`, data);
  }

  // Удалить продукт
  async deleteProduct(id: string): Promise<void> {
    return httpClient.delete<void>(`${API_BASE_URL}/products/${id}`);
  }
}

export const productService = new ProductService();
