export interface Company {
  id: number;
  name: string;
  cuit?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCompanyDTO {
  name: string;
  cuit?: string;
}

export interface UpdateCompanyDTO {
  name?: string;
  cuit?: string;
}

