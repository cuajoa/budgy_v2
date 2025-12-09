export type PermissionType = 'admin' | 'company' | 'cost_center' | 'viewer';

export interface UserPermission {
  id: number;
  userId: string; // User ID
  permissionType: PermissionType;
  companyId?: number;
  costCenterId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPermissionDTO {
  userId: string;
  permissionType: PermissionType;
  companyId?: number;
  costCenterId?: number;
}

export interface UpdateUserPermissionDTO {
  permissionType?: PermissionType;
  companyId?: number;
  costCenterId?: number;
}

