export interface ImageRepositoryInterface {
  findByMemberId(memberId: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(memberId: string, data: any): Promise<any | null>;
  update(id: string, data: any): Promise<any | null>;
  delete(id: string): Promise<boolean>;
}
