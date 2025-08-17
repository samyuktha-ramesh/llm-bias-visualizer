import { ApiResonseDataType, WeatDataType } from '../../types/data';
import axiosClient from '../apiClient'

/**
 * Fetch cosine data from the API
 * @param model The model name
 * @param layer The layer name
 * @param name The file name
 * @param type The type ('contextualized' or 'context-0)
 * @param avg Whether to calculate the average or not
 */

export function fetchCosineData(layer: number, type: string, threshold:number): Promise<ApiResonseDataType | undefined> {
  const url = `cosine/${layer}/${type}/${threshold}`
  const promise = axiosClient.get<ApiResonseDataType>(url)
  return promise
    .then((res) => {
      if (res.status !== 204) {
        return res.data;
      }
      return undefined;
    })
    .catch((err) => {
      console.error("Error fetching cosine data:", err);
      throw err;
    });
}

/**
 * get the data points through a post request
 * @param id the identifier of the point array
*/
export function postPoints(id: string): Promise<ApiResonseDataType | undefined> {
  const url = `data/${id}`
  const promise = axiosClient.get<ApiResonseDataType>(url)
  return promise
    .then((res) => {
      if (res.status !== 204) {
        return res.data;
      }
      return undefined;
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
}