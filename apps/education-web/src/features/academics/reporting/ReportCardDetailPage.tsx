import { useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomButton } from "@sitehookz/ui";
import {
  ReportCard,
  ReportCardStatus,
  ReportCardPassStatus,
} from "@sitehookz/api-client";
import { useApiClient } from "../../../hooks/useApiClient";
import {
  ArrowLeft,
  Printer,
  Send,
  Archive,
  
  
  AlertCircle,
  
  Calendar,
  
  
  GraduationCap,
} from "lucide-react";

export default function ReportCardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const api = useApiClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const printRef = useRef<HTMLDivElement>(null);

  const { data: reportCard, isLoading, error } = useQuery<ReportCard>({
    queryKey: ["reportCard", id],
    queryFn: () => api.reportCards.get(id!),
    enabled: !!id,
  });

  const publishMutation = useMutation({
    mutationFn: () => api.reportCards.publish({ reportCardIds: [id!] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reportCard", id] });
      queryClient.invalidateQueries({ queryKey: ["reportCards"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.reportCards.archive(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reportCard", id] });
      queryClient.invalidateQueries({ queryKey: ["reportCards"] });
    },
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>{t("common.loading", "Loading report card...")}</span>
      </div>
    );
  }

  if (error || !reportCard) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{t("reporting.errorNotFound", "Report card not found or failed to load.")}</span>
        </div>
        <CustomButton variant="outline" onClick={() => navigate("/academics/report-cards")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("reporting.backToList", "Back to Report Cards")}
        </CustomButton>
      </div>
    );
  }

  const student = (reportCard as any).studentEnrollment?.student;
  const section = (reportCard as any).section;
  const batch = (reportCard as any).batch;
  const session = (reportCard as any).academicSession;
  const subjectResults = reportCard.subjectResults || [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar - Hidden during print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden bg-card border rounded-xl p-4 shadow-sm">
        <Link
          to="/academics/report-cards"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          {t("reporting.backToList", "Back to Report Cards")}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {reportCard.status === ReportCardStatus.DRAFT && (
            <CustomButton
              size="sm"
              onClick={() => publishMutation.mutate()}
              isLoading={publishMutation.isPending}
              className="flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              {t("reporting.publish", "Publish")}
            </CustomButton>
          )}

          {reportCard.status !== ReportCardStatus.ARCHIVED && (
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => archiveMutation.mutate()}
              isLoading={archiveMutation.isPending}
              className="text-muted-foreground hover:text-destructive"
            >
              <Archive className="h-4 w-4 mr-1.5" />
              {t("common.archive", "Archive")}
            </CustomButton>
          )}

          <CustomButton
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            {t("reporting.printOrPdf", "Print / Save as PDF")}
          </CustomButton>
        </div>
      </div>

      {/* Printable Report Card Document */}
      <div
        ref={printRef}
        id="report-card-printable"
        className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 md:p-12 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:rounded-none space-y-8"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg tracking-wider uppercase">
            <GraduationCap className="h-6 w-6 text-primary inline-block" />
            <span>SiteHookz Education System</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">
            {reportCard.title}
          </h1>
          <p className="text-sm font-semibold text-slate-600">
            {session?.name ? `Academic Session: ${session.name}` : ""}
          </p>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full print:bg-transparent print:border">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Evaluation Period: {new Date(reportCard.periodStart).toLocaleDateString()} &mdash;{" "}
              {new Date(reportCard.periodEnd).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Student Profile Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl print:bg-transparent print:border">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Student Name
            </span>
            <span className="text-base font-bold text-slate-900">
              {student
                ? `${student.firstName || ""} ${student.lastName || ""}`
                : "Student"}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Roll / Admission No
            </span>
            <span className="text-sm font-semibold text-slate-800 font-mono">
              {student?.rollNumber || student?.admissionNumber || "—"}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Section / Batch
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {section?.name
                ? `Section: ${section.name}`
                : batch?.name
                ? `Batch: ${batch.name}`
                : "—"}
            </span>
          </div>

          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Status & Date
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {reportCard.status === ReportCardStatus.PUBLISHED
                ? "Official / Published"
                : "Draft"}
            </span>
          </div>
        </div>

        {/* Subject-wise Academic Performance Table */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 border-l-4 border-primary pl-2.5">
            Subject-wise Academic Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-300">
                  <th className="p-3 border-r border-slate-300 w-12 text-center">#</th>
                  <th className="p-3 border-r border-slate-300">Subject</th>
                  <th className="p-3 border-r border-slate-300 text-center w-28">Max Marks</th>
                  <th className="p-3 border-r border-slate-300 text-center w-28">Obtained</th>
                  <th className="p-3 border-r border-slate-300 text-center w-24">Percentage</th>
                  <th className="p-3 border-r border-slate-300 text-center w-20">Grade</th>
                  <th className="p-3 border-r border-slate-300 text-center w-24">Result</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                      No subject evaluations found for this period.
                    </td>
                  </tr>
                ) : (
                  subjectResults.map((sub, index) => (
                    <tr key={sub.id} className="break-inside-avoid">
                      <td className="p-3 text-center border-r border-slate-200 text-slate-500 font-mono text-xs">
                        {index + 1}
                      </td>
                      <td className="p-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{sub.subjectName}</div>
                        {sub.subjectCode && (
                          <div className="text-xs text-slate-500 font-mono">{sub.subjectCode}</div>
                        )}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 font-mono">
                        {Number(sub.maximumMarks)}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 font-mono font-bold">
                        {sub.isAbsent
                          ? "Absent"
                          : sub.isExempt
                          ? "Exempt"
                          : Number(sub.obtainedMarks)}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 font-mono">
                        {sub.isAbsent || sub.isExempt
                          ? "—"
                          : `${Number(sub.percentage).toFixed(1)}%`}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200 font-bold">
                        {sub.gradeCode || "—"}
                      </td>
                      <td className="p-3 text-center border-r border-slate-200">
                        <span
                          className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                            sub.isPassing
                              ? "text-emerald-700 bg-emerald-50 print:text-black print:bg-transparent"
                              : "text-rose-700 bg-rose-50 print:text-black print:bg-transparent"
                          }`}
                        >
                          {sub.isAbsent
                            ? "Absent"
                            : sub.isExempt
                            ? "Exempt"
                            : sub.isPassing
                            ? "PASS"
                            : "FAIL"}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {sub.remarks || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overall Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Marks & Grade Box */}
          <div className="border-2 border-slate-900 rounded-xl p-5 space-y-3 bg-slate-50 print:bg-transparent">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b pb-2">
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border-r border-slate-200 pr-2">
                <span className="block text-xs text-slate-500 uppercase font-semibold">Total Marks</span>
                <span className="text-xl font-black font-mono text-slate-900">
                  {Number(reportCard.totalObtainedMarks)} / {Number(reportCard.totalMaximumMarks)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500 uppercase font-semibold">Overall Percentage</span>
                <span className="text-xl font-black font-mono text-slate-900">
                  {Number(reportCard.percentage).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t border-slate-200">
              <div className="border-r border-slate-200 pr-2">
                <span className="block text-xs text-slate-500 uppercase font-semibold">Overall Grade</span>
                <span className="text-2xl font-black text-slate-900">
                  {reportCard.overallGradeCode || "—"}
                </span>
                {reportCard.overallGradeName && (
                  <span className="block text-xs text-slate-500">
                    ({reportCard.overallGradeName})
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="block text-xs text-slate-500 uppercase font-semibold">Final Result</span>
                <span
                  className={`text-lg font-black tracking-wide ${
                    reportCard.passStatus === ReportCardPassStatus.PASS
                      ? "text-emerald-600 print:text-black"
                      : "text-rose-600 print:text-black"
                  }`}
                >
                  {reportCard.passStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks Box */}
          <div className="border border-slate-300 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b pb-2 mb-3">
                Teacher's General Remarks & Observations
              </h3>
              <p className="text-sm text-slate-700 italic min-h-[60px]">
                {reportCard.remarks
                  ? `"${reportCard.remarks}"`
                  : "Satisfactory academic performance and steady progress maintained throughout the term."}
              </p>
            </div>
            <div className="text-xs text-slate-400 pt-3 border-t">
              System generated electronic academic transcript verified by SiteHookz.
            </div>
          </div>
        </div>

        {/* Official Signatures Block */}
        <div className="grid grid-cols-3 gap-8 pt-12 text-center text-xs font-bold text-slate-800 break-inside-avoid">
          <div className="space-y-1">
            <div className="border-b-2 border-slate-800 pb-1 mb-2 h-10 flex items-end justify-center">
              <span className="text-slate-400 font-normal italic text-[11px]">Class In-charge Signature</span>
            </div>
            <span>Class Teacher</span>
          </div>

          <div className="space-y-1">
            <div className="border-b-2 border-slate-800 pb-1 mb-2 h-10 flex items-end justify-center">
              <span className="text-slate-400 font-normal italic text-[11px]">Official School Stamp</span>
            </div>
            <span>Institution Seal</span>
          </div>

          <div className="space-y-1">
            <div className="border-b-2 border-slate-800 pb-1 mb-2 h-10 flex items-end justify-center">
              <span className="text-slate-400 font-normal italic text-[11px]">Authorized Signature</span>
            </div>
            <span>Principal / Headmaster</span>
          </div>
        </div>
      </div>
    </div>
  );
}
