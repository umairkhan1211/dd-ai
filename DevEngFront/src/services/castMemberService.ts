import apiClient from '@/lib/api';
import { CastMemberType } from '@/components/deviation/CastMemberCard';

// Payload for creating a cast member (matches backend CreateCastMemberDTO without userId)
export interface CreateCastMemberPayload {
  name: string;
  functionalRole: string;
  description?: string;
  defaultTone: string;
  invocationPhrases?: string[];
  priority?: number;
  aiModelId?: string; // <-- add
  deductedDucks?:string;
}
// Payload for updating a cast member (matches backend UpdateCastMemberDTO)
// All fields are optional for update
export interface UpdateCastMemberPayload {
  id: string;
  name?: string;
  functionalRole?: string;
  description?: string;
  defaultTone?: string;
  invocationPhrases?: string[];
  priority?: number;
  avatar?: string | File;
  aiModelId?: string; // <-- add
}
const API_BASE_URL = '/cast';

// Service methods
const getCastMembers = async (): Promise<CastMemberType[]> => {
  const response = await apiClient.get<CastMemberType[]>(API_BASE_URL);
  return response.data;
};

const getCastMember = async (id: string): Promise<CastMemberType> => {
  const response = await apiClient.get<CastMemberType>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// const createCastMember = async (payload: CreateCastMemberPayload): Promise<CastMemberType> => {
//   const response = await apiClient.post<CastMemberType>(API_BASE_URL, payload);
//   return response.data;
// };

const createCastMember = async (payload: CreateCastMemberPayload & { avatar?: File | string }): Promise<CastMemberType> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // avatar can be File or string
    if (key === "avatar") {
      if (value instanceof File) {
        formData.append("avatar", value);
      } else {
        formData.append("avatar", String(value));
      }
      return;
    }

    // append arrays
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(`${key}[]`, String(v)));
      return;
    }

    formData.append(key, String(value));
  });

  const response = await apiClient.post<CastMemberType>(API_BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
;



// const updateCastMember = async (payload: UpdateCastMemberPayload): Promise<CastMemberType> => {
//   const { id, ...updateData } = payload;
//   const response = await apiClient.put<CastMemberType>(`${API_BASE_URL}/${id}`, updateData);
//   return response.data;
// };


const updateCastMember = async (payload: UpdateCastMemberPayload): Promise<CastMemberType> => {
  const { id, ...updateData } = payload;
  const formData = new FormData();

  Object.entries(updateData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "avatar") {
      // avatar could be File or base64 string
      const v = value as unknown;
      if (v instanceof File) formData.append("avatar", v);
      else formData.append("avatar", String(v));
      return;
    }
    // append arrays if any (eg invocationPhrases)
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(`${key}[]`, String(v)));
      return;
    }
    formData.append(key, String(value));
  });

  const response = await apiClient.put<CastMemberType>(
    `${API_BASE_URL}/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};


const deleteCastMember = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/${id}`);
};

export const castMemberService = {
  getCastMembers,
  getCastMember,
  createCastMember,
  updateCastMember,
  deleteCastMember,
};
