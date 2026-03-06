export interface BackendDistribution {
  id: string;
  beneficiary_id: string;
  distributor_id?: string;
  distribution_date: string;
  num_pads: number;
  pads_per_day?: number;
  transport_mode: string;
  delivery_address?: string;
  pad_cost?: number;
  delivery_cost?: number;
  status: string;
  pickup_reference_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class Distribution {
  id: string;
  beneficiaryId: string;
  distributorId?: string;
  distributionDate: string;
  numPads: number;
  padsPerDay?: number;
  transportMode: string;
  deliveryAddress?: string;
  padCost?: number;
  deliveryCost?: number;
  status: string;
  pickupReferenceCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data?: BackendDistribution | null) {
    this.id = data?.id ?? '';
    this.beneficiaryId = data?.beneficiary_id ?? '';
    this.distributorId = data?.distributor_id;
    this.distributionDate = data?.distribution_date ?? '';
    this.numPads = data?.num_pads ?? 0;
    this.padsPerDay = data?.pads_per_day;
    this.transportMode = data?.transport_mode ?? 'pickup';
    this.deliveryAddress = data?.delivery_address;
    this.padCost = data?.pad_cost;
    this.deliveryCost = data?.delivery_cost;
    this.status = data?.status ?? 'pending';
    this.pickupReferenceCode = data?.pickup_reference_code;
    this.notes = data?.notes;
    this.createdAt = data?.created_at ?? '';
    this.updatedAt = data?.updated_at ?? '';
  }

  static from(data: any): Distribution {
    if (data instanceof Distribution) return data;
    return new Distribution(data);
  }

  toBackend(): BackendDistribution {
    return {
      id: this.id,
      beneficiary_id: this.beneficiaryId,
      distributor_id: this.distributorId,
      distribution_date: this.distributionDate,
      num_pads: this.numPads,
      pads_per_day: this.padsPerDay,
      transport_mode: this.transportMode,
      delivery_address: this.deliveryAddress,
      pad_cost: this.padCost,
      delivery_cost: this.deliveryCost,
      status: this.status,
      pickup_reference_code: this.pickupReferenceCode,
      notes: this.notes,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
