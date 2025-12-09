export interface CompanyArea {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCompanyAreaDTO {
  companyId: number;
  name: string;
  description?: string;
}

export interface UpdateCompanyAreaDTO {
  name?: string;
  description?: string;
}

