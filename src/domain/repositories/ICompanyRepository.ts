import { Company, CreateCompanyDTO, UpdateCompanyDTO } from '../entities/Company';

export interface ICompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: number): Promise<Company | null>;
  create(data: CreateCompanyDTO): Promise<Company>;
  update(id: number, data: UpdateCompanyDTO): Promise<Company>;
  delete(id: number): Promise<void>;
}

