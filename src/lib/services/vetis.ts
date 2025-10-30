import { writable, derived } from "svelte/store";
import type { Batch } from "$lib/types/batch";

const VETIS_API_URL = "http://158.160.90.93:8082/api/v1/batches"; // Direct API endpoint

export function createVetisStore() {
  const batches = writable<Batch[]>([]);
  const loading = writable(false);
  const error = writable<string | null>(null);
  const deadlineTimezone = writable("Europe/Moscow");
  const currentTime = writable(new Date());

  async function loadBatchesFromApi(filters: any = {}) {
    loading.set(true);
    error.set(null);
    try {
      const body = {
        ...filters,
        auth_token: "eyJhbGciOiJIUzI1NiIsImp0aSI6ImhtYWNfc2VjcmV0IiwidHlwIjoiSldUIn0.eyJjb21wYW55X2lkIjoiYjU0MjBkYjgtMjhjMi00MzY3LThhMzUtNmNlYzNkZWU0ZjNhIiwiY29tcGFueV9uYW1lIjoiTWFycyBNb3Njb3ciLCJleHAiOjE3NjQzNTM3MjQsImlhdCI6MTc2MTY3NTMyNH0.LhQgTC5WybTTochB3U90UMfBn9n0_2uGLakkjXUENvE"
      };

      const response = await fetch(VETIS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();
      
      // Преобразуем данные API в формат, ожидаемый компонентом
      const transformedBatches = apiResponse.items ? apiResponse.items.map((apiBatch: any) => ({
        id: apiBatch.id,
        party: apiBatch.batch_id,
        product: apiBatch.product_id,
        productionDate: apiBatch.produced_at ? apiBatch.produced_at.split('T')[0] : '',
        expiryDate: apiBatch.expire_at ? apiBatch.expire_at.split('T')[0] : '',
        produced: apiBatch.produced_count || 0,
        vetis: apiBatch.planned_count || 0,
        status: apiBatch.status || 'Неизвестно',
        deadline: apiBatch.send_at || '',
        reports_sent_count: apiBatch.reports_sent_count || 0,
        reports_total_count: apiBatch.reports_total_count || 0,
        sent_at: apiBatch.sent_at || '',
      })) : [];
      
      
      batches.set(transformedBatches);
      loading.set(false);
    } catch (e: any) {
      error.set(e.message);
    } finally {
      loading.set(false);
    }
  }

  async function sendToVetis(batchId: string) {
    try {
      const response = await fetch(`${VETIS_API_URL}/${batchId}/send`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send to Vetis");
      }
      // Refresh data after sending
      await loadBatchesFromApi();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Start a timer to update currentTime every minute
  const timer = setInterval(() => {
    currentTime.set(new Date());
  }, 60000);

  // Stop the timer when it's no longer needed (e.g., component unmounts)
  // This needs to be handled in the component lifecycle.
  function cleanup() {
    clearInterval(timer);
  }

  return {
    batches,
    loading,
    error,
    deadlineTimezone,
    currentTime,
    loadBatches: loadBatchesFromApi,
    sendToVetis,
    cleanup,
  };
}
