"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { FoodWasteData } from "@/lib/data/types";
import { saveAs } from "file-saver";
import { useState } from "react";

interface ExportOptionsProps {
  data: FoodWasteData[];
  filteredData: FoodWasteData[];
}

export function ExportOptions({ data, filteredData }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Export as CSV
  const exportToCSV = async (exportData: FoodWasteData[], filename: string) => {
    setIsExporting(true);

    try {
      // Create CSV header
      const header = [
        "Country",
        "Combined Figures (kg/capita/year)",
        "Household Estimate (kg/capita/year)",
        "Household Estimate (tonnes/year)",
        "Retail Estimate (kg/capita/year)",
        "Retail Estimate (tonnes/year)",
        "Food Service Estimate (kg/capita/year)",
        "Food Service Estimate (tonnes/year)",
        "Confidence in Estimate",
        "M49 Code",
        "Region",
        "Source",
      ].join(",");

      // Create CSV rows
      const rows = exportData.map((item) =>
        [
          `"${item.country.replace(/"/g, '""')}"`,
          item.combinedFigures,
          item.householdEstimatePerCapita,
          item.householdEstimateTotal,
          item.retailEstimatePerCapita,
          item.retailEstimateTotal,
          item.foodServiceEstimatePerCapita,
          item.foodServiceEstimateTotal,
          `"${item.confidenceInEstimate}"`,
          item.m49Code,
          `"${item.region.replace(/"/g, '""')}"`,
          `"${item.source.replace(/"/g, '""')}"`,
        ].join(","),
      );

      // Combine header and rows
      const csv = [header, ...rows].join("\n");

      // Create a Blob and save it
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `${filename}.csv`);

      toast({
        title: "Export Successful",
        description: `Data exported to ${filename}.csv`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting CSV data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export as PDF
  const exportToPDF = async (exportData: FoodWasteData[], filename: string) => {
    setIsExporting(true);

    try {
      // Dynamically import jsPDF to avoid SSR issues
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");

      if (!jsPDFModule.default) {
        throw new Error("Failed to load jsPDF");
      }

      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;

      // Create new PDF document - catch errors from document creation
      let doc;
      try {
        doc = new jsPDF("landscape");
      } catch (e) {
        console.error("Error creating PDF document:", e);
        throw new Error("Failed to create PDF document");
      }

      // Add title
      doc.setFontSize(18);
      doc.text("Food Waste Data Report", 14, 22);

      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      // Prepare table data - limit to 500 rows to prevent memory issues
      const tableColumn = [
        "Country",
        "Combined Waste",
        "Household",
        "Retail",
        "Food Service",
        "Region",
        "Confidence",
      ];

      // Limit data if too large
      const limitedData =
        exportData.length > 500 ? exportData.slice(0, 500) : exportData;

      const tableRows = limitedData.map((item) => [
        item.country,
        item.combinedFigures.toString(),
        item.householdEstimatePerCapita.toString(),
        item.retailEstimatePerCapita.toString(),
        item.foodServiceEstimatePerCapita.toString(),
        item.region,
        item.confidenceInEstimate,
      ]);

      // Note if data was limited
      if (exportData.length > 500) {
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        doc.text(
          "Note: Export limited to 500 rows due to size constraints.",
          14,
          35,
        );
        doc.setTextColor(0, 0, 0);
      }

      // Add table to PDF with error handling
      try {
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: exportData.length > 500 ? 40 : 40,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [46, 125, 50] },
          didDrawPage: (data) => {
            // Footer with page numbers
            doc.setFontSize(8);
            doc.text(
              `Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: "center" },
            );
          },
        });
      } catch (e) {
        console.error("Error generating table:", e);
        throw new Error("Failed to generate PDF table");
      }

      // Save the PDF with error handling
      try {
        doc.save(`${filename}.pdf`);
      } catch (e) {
        console.error("Error saving PDF:", e);
        throw new Error("Failed to save PDF file");
      }

      toast({
        title: "Export Successful",
        description: `Data exported to ${filename}.pdf`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while exporting PDF data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = (format: "csv" | "pdf") => {
    const filename = `food-waste-data-all-${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") {
      exportToCSV(data, filename);
    } else {
      exportToPDF(data, filename);
    }
  };

  const handleExportFiltered = (format: "csv" | "pdf") => {
    if (filteredData.length === 0) {
      toast({
        title: "No Data to Export",
        description:
          "There's no filtered data to export. Please adjust your filters.",
        variant: "destructive",
      });
      return;
    }

    const filename = `food-waste-data-filtered-${new Date().toISOString().split("T")[0]}`;
    if (format === "csv") {
      exportToCSV(filteredData, filename);
    } else {
      exportToPDF(filteredData, filename);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>Download data in CSV or PDF format</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                Export All Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleExportAll("csv")}
                data-export-csv
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportAll("pdf")}
                data-export-pdf
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isExporting || filteredData.length === 0}
              >
                Export Filtered Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleExportFiltered("csv")}
                data-export-csv
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExportFiltered("pdf")}
                data-export-pdf
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExporting && (
          <div className="flex items-center mt-2">
            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
            <span className="text-sm">Generating export file...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
