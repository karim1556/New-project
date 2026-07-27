"use client";

import { useState, useRef, useEffect } from "react";
import { ClubRegistration } from "@/lib/types";
import {
  exportRegistrationsToExcel,
  exportRegistrationsToPdf,
  exportRegistrationsToCsv
} from "@/lib/export-utils";

interface ExportButtonProps {
  data: ClubRegistration[];
  customFileName?: string;
}

export function ExportButton({ data, customFileName }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting("excel");
      setIsOpen(false);
      await exportRegistrationsToExcel(data, customFileName ? `${customFileName}.xlsx` : undefined);
      triggerToast("Successfully exported to Excel (.xlsx)");
    } catch (err) {
      console.error("Excel Export Error:", err);
      triggerToast("Failed to export Excel file");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting("pdf");
      setIsOpen(false);
      await exportRegistrationsToPdf(data, customFileName ? `${customFileName}.pdf` : undefined);
      triggerToast("Successfully exported to PDF (.pdf)");
    } catch (err) {
      console.error("PDF Export Error:", err);
      triggerToast("Failed to export PDF file");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting("csv");
      setIsOpen(false);
      exportRegistrationsToCsv(data, customFileName ? `${customFileName}.csv` : undefined);
      triggerToast("Successfully exported to CSV (.csv)");
    } catch (err) {
      console.error("CSV Export Error:", err);
      triggerToast("Failed to export CSV file");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="export-dropdown-wrap" ref={dropdownRef}>
      {toastMessage && (
        <div className="export-toast">
          <span>✨ {toastMessage}</span>
        </div>
      )}

      <div className="export-btn-group">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="export-trigger-btn"
          disabled={!data || data.length === 0 || !!isExporting}
        >
          {isExporting ? (
            <>
              <span className="spinner"></span> Exporting...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export Data</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`caret ${isOpen ? "open" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </>
          )}
        </button>

        {isOpen && (
          <div className="export-menu">
            <div className="export-menu-header">
              <span>DOWNLOAD FORMAT</span>
            </div>

            <button type="button" onClick={handleExportExcel} className="export-option-btn excel">
              <div className="export-option-icon excel-icon">
                📊
              </div>
              <div className="export-option-info">
                <strong>Export to Excel (.xlsx)</strong>
                <small>Formatted workbook with auto columns</small>
              </div>
            </button>

            <button type="button" onClick={handleExportPdf} className="export-option-btn pdf">
              <div className="export-option-icon pdf-icon">
                📄
              </div>
              <div className="export-option-info">
                <strong>Export to PDF (.pdf)</strong>
                <small>Formatted printable document</small>
              </div>
            </button>

            <button type="button" onClick={handleExportCsv} className="export-option-btn csv">
              <div className="export-option-icon csv-icon">
                📝
              </div>
              <div className="export-option-info">
                <strong>Export to CSV (.csv)</strong>
                <small>Raw data table for spreadsheets</small>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
