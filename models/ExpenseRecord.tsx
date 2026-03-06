export interface BackendExpenseRecord {
  id: string;
  category: string;
  amount_given: number;
  amount_spent: number;
  remaining_balance: number;
  date_of_allocation: string;
  date_of_expenditure?: string;
  linked_distribution_id?: string;
  recorded_by: string;
  document_url?: string;
  notes?: string;
  is_confirmed: boolean;
  created_at: string;
}

export class ExpenseRecord {
  id: string;
  category: string;
  amountGiven: number;
  amountSpent: number;
  remainingBalance: number;
  dateOfAllocation: string;
  dateOfExpenditure?: string;
  linkedDistributionId?: string;
  recordedBy: string;
  documentUrl?: string;
  notes?: string;
  isConfirmed: boolean;
  createdAt: string;

  constructor(data?: BackendExpenseRecord | null) {
    this.id = data?.id ?? '';
    this.category = data?.category ?? '';
    this.amountGiven = data?.amount_given ?? 0;
    this.amountSpent = data?.amount_spent ?? 0;
    this.remainingBalance = data?.remaining_balance ?? 0;
    this.dateOfAllocation = data?.date_of_allocation ?? '';
    this.dateOfExpenditure = data?.date_of_expenditure;
    this.linkedDistributionId = data?.linked_distribution_id;
    this.recordedBy = data?.recorded_by ?? '';
    this.documentUrl = data?.document_url;
    this.notes = data?.notes;
    this.isConfirmed = data?.is_confirmed ?? false;
    this.createdAt = data?.created_at ?? '';
  }

  static from(data: any): ExpenseRecord {
    if (data instanceof ExpenseRecord) return data;
    return new ExpenseRecord(data);
  }

  toBackend(): BackendExpenseRecord {
    return {
      id: this.id,
      category: this.category,
      amount_given: this.amountGiven,
      amount_spent: this.amountSpent,
      remaining_balance: this.remainingBalance,
      date_of_allocation: this.dateOfAllocation,
      date_of_expenditure: this.dateOfExpenditure,
      linked_distribution_id: this.linkedDistributionId,
      recorded_by: this.recordedBy,
      document_url: this.documentUrl,
      notes: this.notes,
      is_confirmed: this.isConfirmed,
      created_at: this.createdAt,
    };
  }
}

export interface BackendNotification {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  channel: string;
  created_at: string;
}

export class Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  channel: string;
  createdAt: string;

  constructor(data?: BackendNotification | null) {
    this.id = data?.id ?? '';
    this.recipientId = data?.recipient_id ?? '';
    this.type = data?.type ?? '';
    this.title = data?.title ?? '';
    this.message = data?.message ?? '';
    this.isRead = data?.is_read ?? false;
    this.channel = data?.channel ?? 'in_app';
    this.createdAt = data?.created_at ?? '';
  }

  static from(data: any): Notification {
    if (data instanceof Notification) return data;
    return new Notification(data);
  }

  toBackend(): BackendNotification {
    return {
      id: this.id,
      recipient_id: this.recipientId,
      type: this.type,
      title: this.title,
      message: this.message,
      is_read: this.isRead,
      channel: this.channel,
      created_at: this.createdAt,
    };
  }
}
