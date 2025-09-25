import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async ({ url }: RequestEvent) => {
    const limit = Number(url.searchParams.get('limit')) || 10;
    const offset = Number(url.searchParams.get('offset')) || 0;
    const sort_by = url.searchParams.get('sort_by') || 'name';
    const sort_desc = url.searchParams.get('sort_desc') === 'true';

    // Моковые данные для примера
    const mockProducts = Array.from({ length: 20 }, (_, i) => ({
        id: `product-${i + 1}`,
        name: `Product ${i + 1}`,
        gtin_number: `04603721574${String(i + 1).padStart(3, '0')}`,
        gtin_package: `12345678901${String(i + 1).padStart(3, '0')}`,
        status: i % 2 === 0 ? 'active' : 'blocked'
    }));

    // Сортировка
    const sortedProducts = [...mockProducts].sort((a, b) => {
        const aValue = a[sort_by as keyof typeof a];
        const bValue = b[sort_by as keyof typeof b];
        if (sort_desc) {
            return String(bValue).localeCompare(String(aValue));
        }
        return String(aValue).localeCompare(String(bValue));
    });

    // Пагинация
    const paginatedProducts = sortedProducts.slice(offset, offset + limit);

    return json({
        items: paginatedProducts,
        total: mockProducts.length,
        limit,
        offset
    });
};
