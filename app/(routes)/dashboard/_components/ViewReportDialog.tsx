"use client";

import React, { useState } from 'react';
import jsPDF from 'jspdf'; // Import jsPDF
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, FileText, Loader2, User as UserIcon } from 'lucide-react'; // Added UserIcon
import moment from 'moment';

// --- Type Definitions ---
// Define a more specific type for the report based on your JSON structure
type ReportData = {
  sessionId: string;
  agent: string;
  "Name of the patient": string | null; // Use exact keys from JSON
  "Age": string | null;
  "Sex": string | null;
  user?: string; // Keep optional fallback if needed
  timestamp: string;
  chiefComplaint: string | null;
  historyOfPresentIllness: string | null;
  symptoms: string[] | null;
  duration: string | null;
  severity: string | null;
  summary: string | null;
  prescribedMedicines: string[] | null;
  "list of tests recommended": string[] | null;
  recommendations: string[] | null;
  closingNotes: string | null;
};

type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt?: string;
  voiceId?: string;
};

type Session = {
  id: number;
  sessionId: string;
  userEmail: string;
  note: string;
  conversation: any;
  report: ReportData | null; // Use the specific ReportData type
  selectedDoctor: DoctorAgent;
  createdOn: string;
};

type ViewReportDialogProps = {
  item: Session;
}

// --- Helper Function to Render Report ---
const renderReportContent = (report: ReportData | null) => {
    if (!report || Object.keys(report).length === 0) {
      return <p className="text-slate-500 italic">No report data available for this session.</p>;
    }

    const ReportItem = ({ label, value }: { label: string, value: string | undefined | null }) => (
      value ? (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</p>
          <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">{value}</p>
        </div>
      ) : null
    );

     const ReportGridItem = ({ label, value }: { label: string, value: string | undefined | null }) => (
       <div className="bg-slate-50 p-2 rounded border border-slate-200">
           <span className="text-xs text-slate-500 block">{label}</span>
           <span className="font-medium text-sm text-slate-800">{value || 'N/A'}</span>
       </div>
     );

    const ReportList = ({ label, items }: { label: string, items: string[] | undefined | null }) => (
      items && items.length > 0 ? (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</p>
          <ul className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200 list-disc list-inside space-y-1">
            {items.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null // Don't render if list is empty or null
    );

    return (
      <div className="space-y-4 pt-4">
        {/* --- FIX: Added Patient Details Section --- */}
        <div className="mb-4">
            <h5 className="text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide border-b border-orange-200 pb-1 flex items-center gap-2">
                <UserIcon size={16} /> Patient Information
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <ReportGridItem label="Name" value={report["Name of the patient"]} />
                <ReportGridItem label="Age" value={report.Age} />
                <ReportGridItem label="Sex" value={report.Sex} />
            </div>
             {/* Optional Fallback for old 'user' field if needed */}
             {!(report["Name of the patient"] || report.Age || report.Sex) && report.user && (
                  <div className="mt-2"><ReportItem label="User Info (Legacy)" value={report.user} /></div>
             )}
        </div>

        <ReportItem label="Chief Complaint" value={report.chiefComplaint} />
        <ReportList label="Symptoms" items={report.symptoms} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ReportGridItem label="Duration" value={report.duration} />
            <ReportGridItem label="Severity" value={report.severity} />
        </div>
        <ReportItem label="History Of Present Illness" value={report.historyOfPresentIllness} />
        <ReportItem label="Summary" value={report.summary} />
        <ReportList label="Recommendations" items={report.recommendations} />
        <ReportList label="Prescribed Medicines" items={report.prescribedMedicines} />
        <ReportList label="Tests Recommended" items={report["list of tests recommended"]} />
        <ReportItem label="Closing Notes" value={report.closingNotes} />
      </div>
    );
};


// --- The Main Dialog Component ---
function ViewReportDialog({ item }: ViewReportDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePdf = () => {
    const report = item.report; // Use typed report
    if (!report) {
      alert("No report data available to generate PDF.");
      return;
    }
    setIsGeneratingPdf(true);

    const doc = new jsPDF({
        unit: 'pt', // Use points for better sizing consistency
        format: 'a4'
    });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - 2 * margin;
    let yPos = margin; // Start position

    // --- PDF Header ---
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text("Medical Consultation Report", pageWidth / 2, yPos, { align: 'center' });
    yPos += 25;
    doc.setFontSize(10);
    doc.setFont('normal');
    doc.text(`Specialist: ${item.selectedDoctor.specialist}`, margin, yPos);
    doc.text(`Date: ${moment(item.createdOn).format('DD MMM YYYY, h:mm A')}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 20;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos); // Horizontal line
    yPos += 20;

    // --- PDF Body Helper ---
    // Improved helper with page break handling
    const addSection = (title: string, content: string | string[] | undefined | null) => {
        if (!content || (Array.isArray(content) && content.length === 0)) {
            // Optional: Render title with 'N/A' if you want to show all sections
            // doc.setFont(undefined, 'bold');
            // doc.setFontSize(10);
            // doc.setTextColor(150);
            // if (yPos + 20 > pageHeight - margin) { doc.addPage(); yPos = margin; }
            // doc.text(title.toUpperCase(), margin, yPos);
            // yPos += 15;
            // doc.setFont(undefined, 'normal');
            // doc.setTextColor(100);
            // doc.text("Not specified", margin, yPos);
            // yPos += 20;
            return; // Skip section entirely if no content
        }

        // Check space before adding title
        if (yPos + 20 > pageHeight - margin) { // Need space for title + minimum content
            doc.addPage();
            yPos = margin;
        }

        doc.setFont('bold');
        doc.setFontSize(10);
        doc.setTextColor(50); // Darker grey for title
        doc.text(title.toUpperCase(), margin, yPos);
        yPos += 15;

        doc.setFont('normal');
        doc.setFontSize(10);
        doc.setTextColor(0); // Black for content

        const addTextLines = (textLines: string[], isList: boolean = false) => {
            textLines.forEach(line => {
                const prefix = isList ? '• ' : '';
                const fullLine = prefix + line;
                const splitLines = doc.splitTextToSize(fullLine, usableWidth - (isList ? 10 : 0)); // Indent list slightly

                splitLines.forEach((splitLine: string) => {
                    if (yPos + 10 > pageHeight - margin) { // Check space for each line
                        doc.addPage();
                        yPos = margin;
                        // Optional: Re-add section title on new page if needed
                        // doc.setFont(undefined, 'bold');
                        // doc.setFontSize(10);
                        // doc.setTextColor(50);
                        // doc.text(title.toUpperCase(), margin, yPos - 15); // Adjust position
                        // doc.setFont(undefined, 'normal');
                    }
                    doc.text(splitLine, margin + (isList ? 10 : 0), yPos);
                    yPos += 12; // Line height
                });
                if(isList) yPos += 2; // Extra space between list items
            });
        };

        if (Array.isArray(content)) {
            addTextLines(content, true);
        } else {
            addTextLines([content]); // Treat single string as an array of one
        }
        yPos += 8; // Extra space after section
    };

    // --- Add Patient Details to PDF ---
    if (report["Name of the patient"] || report.Age || report.Sex || report.user) {
        if (yPos + 40 > pageHeight - margin) { doc.addPage(); yPos = margin; } // Check space
        doc.setFont('bold');
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text("PATIENT INFORMATION", margin, yPos);
        yPos += 15;
        doc.setFont('normal');
        doc.setFontSize(10);
        doc.setTextColor(0);
        const patientName = `Name: ${report["Name of the patient"] || 'N/A'}`;
        const patientAge = `Age: ${report.Age || 'N/A'}`;
        const patientSex = `Sex: ${report.Sex || 'N/A'}`;
        let textLine = patientName;
        if(report.Age) textLine += `    ${patientAge}`;
        if(report.Sex) textLine += `    ${patientSex}`;
         const nameLines = doc.splitTextToSize(textLine, usableWidth);
         doc.text(nameLines, margin, yPos);
         yPos += (nameLines.length * 12) + 8;
        // Fallback for old user field
        if (!(report["Name of the patient"] || report.Age || report.Sex) && report.user) {
             const userLines = doc.splitTextToSize(`User Info (Legacy): ${report.user}`, usableWidth);
             if (yPos + (userLines.length*12) > pageHeight - margin) { doc.addPage(); yPos = margin; }
             doc.text(userLines, margin, yPos);
             yPos += (userLines.length * 12) + 8;
        }
    }


    // --- Add Other Report Sections to PDF ---
    addSection("Chief Complaint", report.chiefComplaint);
    addSection("Symptoms", report.symptoms);
    addSection("Duration", report.duration);
    addSection("Severity", report.severity);
    addSection("History of Present Illness", report.historyOfPresentIllness);
    addSection("Summary", report.summary);
    addSection("Prescribed Medicines", report.prescribedMedicines);
    addSection("Tests Recommended", report["list of tests recommended"]);
    addSection("Recommendations", report.recommendations);
    addSection("Closing Notes", report.closingNotes);

    // --- Save the PDF ---
    doc.save(`report_${item.sessionId}.pdf`);
    setIsGeneratingPdf(false);
  };

  const hasReportData = item.report && Object.keys(item.report).length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild disabled={!hasReportData}>
        <Button
          className="w-full text-xs font-bold
                     bg-gradient-to-r from-orange-500 to-yellow-500
                     hover:from-orange-600 hover:to-yellow-600
                     text-white shadow-md hover:shadow-xl
                     transition-all duration-300
                     group/btn relative overflow-hidden
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={hasReportData ? "View Full Report" : "Report not available"}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            View Full Report
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col sm:max-w-2xl"> {/* Adjusted width */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             <FileText className="text-orange-600" /> Consultation Report
          </DialogTitle>
          <DialogDescription>
            Session with {item.selectedDoctor.specialist} on {moment(item.createdOn).format('DD MMM YYYY, h:mm A')}.
            Session ID: {item.sessionId}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Report Content Area */}
        {/* Added padding */}
        <div className="flex-grow overflow-y-auto px-1 py-4 border-t border-b custom-scrollbar"> 
           {renderReportContent(item.report)}
        </div>

        <DialogFooter className="mt-4 flex-shrink-0 sm:justify-between"> {/* Adjust footer alignment */}
           <DialogClose asChild>
              <Button variant="outline">Close</Button>
           </DialogClose>
           <Button
              onClick={generatePdf}
              disabled={isGeneratingPdf || !hasReportData}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGeneratingPdf ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                 <Download className="mr-2 h-4 w-4" />
              )}
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;