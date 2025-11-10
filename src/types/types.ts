export type Branch = {
  branchId: string;
  name: string;
  location?: string;
};

export type Volunteer = {
  volunteerId: string;
  name: string;
  branchId?: string;
};

export type Student = {
  studentId: string;
  name: string;
  branchId?: string;
  group?: string;
  notes?: string;
};

export type TimesheetEntry = {
  entryId?: string;
  date: string;
  volunteerId: string;
  volunteerName?: string;
  branchId?: string;
  group?: string;
  studentId: string;
  studentName?: string;
  taught?: string;
  lacking?: string;
  liked?: string;
  homework?: string;
  volunteerNotes?: string;
  createdAt?: string;
};
