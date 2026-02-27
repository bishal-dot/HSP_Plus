import { QueryDefault } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const [
            ethnic,
            caseType,
            rjClassification,
            modeOfDetection,
            treatmentStatus,
            todayMajorProblem,
            nerveFunctionAssessment,
            newCaseReferredCounselling,
            lepraReaction,
            biopsy,
            biopsyResult,
            drugReaction,
            genders,
            maritalStatus,
            pregnancyStatus
        ] = await Promise.all([ 
            QueryDefault(`SELECT EthnicID AS value, EthnicName AS label FROM EthnicMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT CaseTypeID AS value, CaseTypeName AS label FROM CaseTypeMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT RjClassificationID AS value, RjClassificationName AS label FROM RjClassificationMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT ModeOfDetectionID AS value, ModeOfDetectionName AS label FROM ModeOfDetectionMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT TreatmentStatusID AS value, TreatmentStatusName AS label FROM TreatmentStatusMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT TodaysMajorProblemID AS value, TodaysMajorProblemName AS label FROM TodaysMajorProblemMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT NerveFunctionAssessmentID AS value, NerveFunctionAssessmentName AS label FROM NerveFunctionAssessmentMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT NewCaseReferredCounsellingID AS value, NewCaseReferredCounsellingName AS label FROM NewCaseReferredCounsellingMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT LepraReactionID AS value, LepraReactionName AS label FROM LepraReactionMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT BiopsyID AS value, BiopsyName AS label FROM BiopsyMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT BiopsyResultID AS value, BiopsyResultName AS label FROM BiopsyResultMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT DrugReactionID AS value, DrugReactionName AS label FROM DrugReactionMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT GenderID AS value, GenderName AS label FROM GenderMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT MaritalStatusID AS value, MaritalStatusName AS label FROM MaritalStatusMaster WHERE IsActive = 1;`),
            QueryDefault(`SELECT PregnancyStatusID AS value, PregnancyStatusName AS label FROM PregnancyStatusMaster WHERE IsActive = 1;`)
        ]);

        return NextResponse.json({
            ethnic,
            caseType,
            rjClassification,
            modeOfDetection,
            treatmentStatus,
            todayMajorProblem,
            nerveFunctionAssessment,
            newCaseReferredCounselling,
            lepraReaction,
            biopsy,
            biopsyResult,
            drugReaction,
            genders,
            maritalStatus,
            pregnancyStatus
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message || "Failed to load master data" }, { status: 500 }); 
    }
}