export type ReportBody = {
  companyId: number | string;
  from?: string; // ISO date string optional
  to?: string; // ISO date string optional
};

export type WorkerLike = {
  id: number;
  dni: string;
  name: string;
  lastName: string;
  active: boolean;
};

export type WorkTimeLike = {
  workerId: number;
  clockIn: Date;
  clockOut: Date | null;
  date?: Date | null;
};

export type ReportBodyByWorker = {
  name: string;
  from?: string | undefined;
  to?: string | undefined;
};
