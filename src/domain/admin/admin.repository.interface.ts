export interface AdminRepositoryInterface {
  findById(id: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  update(id: string, data: any): Promise<any | null>;
  updatePassword(id: string, hashedPassword: string): Promise<any | null>;
  updateLastLogin(id: string): Promise<any | null>;
}
