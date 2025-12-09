export interface Provider {
  id: number;
  name: string;
  taxId?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateProviderDTO {
  name: string;
  taxId?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateProviderDTO {
  name?: string;
  taxId?: string;
  contactEmail?: string;
  contactPhone?: string;
}

