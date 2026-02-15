import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/printEngine';
import { useSettings } from '../../context/SettingsContext';

/**
 * ReportFooter - Standard footer for all government reports
 * Repeats on every printed page. Displays signature grid and system info.
 */
const ReportFooter = ({
    printedDate = new Date()
}) => {
    const { settings } = useSettings();

    // Pull signature labels from settings
    const sigs = [
        settings.sig_1_label,
        settings.sig_2_label,
        settings.sig_3_label,
        settings.sig_4_label
    ].filter(Boolean); // Only show defined signatures

    const showTimestamp = settings.print_show_timestamp === 'true' || settings.print_show_timestamp === true;

    return (
        <div className="report-footer">
            {sigs.length > 0 && (
                <div className="print-signature-grid">
                    {sigs.map((label, idx) => (
                        <div key={idx} className="print-sig-box">
                            <div className="print-sig-line"></div>
                            <div className="print-sig-label uppercase">{label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="report-footer-content mt-4">
                <div className="system-info">
                    <span>Software by: {settings.org_name || "Enterprise Payroll"}</span>
                </div>
                {showTimestamp && (
                    <div className="print-timestamp">
                        <span>Generated on: {formatDate(printedDate)} {new Date().toLocaleTimeString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

ReportFooter.propTypes = {
    printedDate: PropTypes.instanceOf(Date)
};

export default ReportFooter;
