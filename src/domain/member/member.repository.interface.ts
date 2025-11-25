export interface MemberRepositoryInterface {
  findById(id: string): Promise<any | null>;
  findByMemberId(memberId: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  findByPhone(phone: string): Promise<any | null>;
  findAll(
    filters: any,
    page: number,
    limit: number,
  ): Promise<{ members: any[]; total: number }>;
  create(data: any): Promise<any | null>;
  update(id: string, data: any): Promise<any | null>;
  updateStatus(id: string, status: any): Promise<any | null>;
  softDelete(id: string): Promise<any | null>;
  restore(id: string): Promise<any | null>;
}
