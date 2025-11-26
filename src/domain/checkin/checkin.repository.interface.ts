export interface CheckInRepositoryInterface {
  findAll(
    filters: any,
    page: number,
    limit: number,
  ): Promise<{ checkIns: any[]; total: number }>;
  findByMemberId(
    memberId: string,
    filters: any,
    page: number,
    limit: number,
  ): Promise<{ checkIns: any[]; total: number }>;
  create(data: any): Promise<any | null>;
  findLatestCheckIn(memberId: string): Promise<any | null>;
  findLatestCheckInRecord(memberId: string): Promise<any | null>;
  updateCheckOut(checkInLogId: string, checkOutTime: Date): Promise<any | null>;
}
