export interface labReportDataRequest{
    Patientcode: string;
}

export interface labReportsResponse {
 // Main Identifiers
  TestTranId: string;
  CollectionDate_Eng: string;
  CollectionDate_Nep: string;
  
  // Grouping Info
  Alias: string;        // e.g., "HAEMATOLOGY"
  GroupName: string;    // e.g., "CBC FULL"
  
  // The Actual Test Data
  TestAlias: string;    // e.g., "Platelets"
  Findingvalue: string; // The result
  Unit: string;
  Referencerange: string;
  resultflag: string;   // "N", "H", "L"
  
  // Extra Info
  comment: string;
  footnote: string;
  majorGroups: any[];
}
