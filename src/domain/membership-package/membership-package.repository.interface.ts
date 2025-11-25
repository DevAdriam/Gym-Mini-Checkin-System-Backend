export interface MembershipPackageRepositoryInterface {
  findById(id: string, includeDeleted?: boolean): Promise<any | null>;
  findAll(filters: any): Promise<any[]>;
  create(data: any): Promise<any | null>;
  update(id: string, data: any): Promise<any | null>;
  updateStatus(id: string, isActive: boolean): Promise<any | null>;
  softDelete(id: string): Promise<any | null>;
  restore(id: string): Promise<any | null>;
}
