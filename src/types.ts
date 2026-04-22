export type DistrictCode = "LVO" | "MVO" | "YVO" | "CVO" | "VVO";

export interface District {
  code: DistrictCode;
  name: string;
  short: string;
  color: string;
  hq: string;
  regions?: string;
  area?: string;
  commander?: string;
  chiefOfStaff?: string;
  prosecutorOffice?: string;
  prosecutor?: string;
  prosecutorAddress?: string;
  prosecutorPhone?: string;
  prosecutorEmail?: string;
  garrisons?: string[];
}

export type UnitStatus = "active" | "reformed" | "disbanded";

export interface Unit {
  id: string;
  number: string;
  fullName: string;
  branch: string;
  subordination: string;
  district: DistrictCode;
  garrison: string;
  region: string;
  city: string;
  address: string;
  postalIndex: string;
  coords: [number, number];
  commander: string;
  chiefOfStaff: string;
  dutyPhone: string;
  prosecutorOffice: string;
  prosecutorAddress: string;
  prosecutorPhone: string;
  prosecutorEmail: string;
  prosecutor: string;
  supervisionSince: string;
  caseNumber: string;
  status: UnitStatus;
  statusSince?: string;
  formed?: string;
  honors?: string;
}
