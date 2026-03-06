export interface BackendProfile {
  id: string;
  full_name: string;
  occupation?: string;
  date_of_birth?: string;
  location?: string;
  email: string;
  phone?: string;
  profile_photo_url?: string;
  role: string;
  status: string;
  next_period_date?: string;
  pad_allocation_limit: number;
  assigned_distributor_id?: string;
  created_at: string;
  updated_at: string;
}

export class Profile {
  id: string;
  fullName: string;
  occupation?: string;
  dateOfBirth?: string;
  location?: string;
  email: string;
  phone?: string;
  profilePhotoUrl?: string;
  role: string;
  status: string;
  nextPeriodDate?: string;
  padAllocationLimit: number;
  assignedDistributorId?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data?: BackendProfile | null) {
    this.id = data?.id ?? '';
    this.fullName = data?.full_name ?? '';
    this.occupation = data?.occupation;
    this.dateOfBirth = data?.date_of_birth;
    this.location = data?.location;
    this.email = data?.email ?? '';
    this.phone = data?.phone;
    this.profilePhotoUrl = data?.profile_photo_url;
    this.role = data?.role ?? 'beneficiary';
    this.status = data?.status ?? 'pending';
    this.nextPeriodDate = data?.next_period_date;
    this.padAllocationLimit = data?.pad_allocation_limit ?? 0;
    this.assignedDistributorId = data?.assigned_distributor_id;
    this.createdAt = data?.created_at ?? '';
    this.updatedAt = data?.updated_at ?? '';
  }

  static from(data: any): Profile {
    if (data instanceof Profile) return data;
    return new Profile(data);
  }

  toBackend(): BackendProfile {
    return {
      id: this.id,
      full_name: this.fullName,
      occupation: this.occupation,
      date_of_birth: this.dateOfBirth,
      location: this.location,
      email: this.email,
      phone: this.phone,
      profile_photo_url: this.profilePhotoUrl,
      role: this.role,
      status: this.status,
      next_period_date: this.nextPeriodDate,
      pad_allocation_limit: this.padAllocationLimit,
      assigned_distributor_id: this.assignedDistributorId,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
