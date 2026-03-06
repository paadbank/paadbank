export interface BackendCycleLog {
  id: string;
  beneficiary_id: string;
  start_date: string;
  end_date?: string;
  duration_days?: number;
  flow_intensity?: string;
  notes?: string;
  status: string;
  logged_at: string;
  created_at: string;
}

export class CycleLog {
  id: string;
  beneficiaryId: string;
  startDate: string;
  endDate?: string;
  durationDays?: number;
  flowIntensity?: string;
  notes?: string;
  status: string;
  loggedAt: string;
  createdAt: string;

  constructor(data?: BackendCycleLog | null) {
    this.id = data?.id ?? '';
    this.beneficiaryId = data?.beneficiary_id ?? '';
    this.startDate = data?.start_date ?? '';
    this.endDate = data?.end_date;
    this.durationDays = data?.duration_days;
    this.flowIntensity = data?.flow_intensity;
    this.notes = data?.notes;
    this.status = data?.status ?? 'open';
    this.loggedAt = data?.logged_at ?? '';
    this.createdAt = data?.created_at ?? '';
  }

  static from(data: any): CycleLog {
    if (data instanceof CycleLog) return data;
    return new CycleLog(data);
  }

  toBackend(): BackendCycleLog {
    return {
      id: this.id,
      beneficiary_id: this.beneficiaryId,
      start_date: this.startDate,
      end_date: this.endDate,
      duration_days: this.durationDays,
      flow_intensity: this.flowIntensity,
      notes: this.notes,
      status: this.status,
      logged_at: this.loggedAt,
      created_at: this.createdAt,
    };
  }
}
