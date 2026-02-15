import React from 'react';
import PropTypes from 'prop-types';
import { useSettings } from '../../context/SettingsContext';

/**
 * ReportHeader - Standard header for all government reports
 * Repeats on every printed page. Fully driven by System Configuration.
 */
const ReportHeader = ({
    reportTitle,
    month,
    year,
    showLogo = true
}) => {
    const { settings } = useSettings();

    // Prioritize custom title if provided in props, otherwise use a generic fallback
    const displayTitle = reportTitle || 'REPORT';

    return (
        <div className="report-header">
            {showLogo && settings.org_logo_url && (
                <div className="report-logo">
                    <img src={settings.org_logo_url} alt="Logo" className="print-logo-img" style={{ maxHeight: '40px' }} />
                </div>
            )}

            <div className="report-institution">
                <h1 className="institution-name">{settings.org_name || "SEARCHFIRST ENTERPRISE"}</h1>
                <p className="institution-address">{settings.org_address || "Trichy, Tamil Nadu"}</p>
                {settings.org_phone && <p className="institution-contact">PH: {settings.org_phone} {settings.org_email && `| EMAIL: ${settings.org_email}`}</p>}
            </div>

            <div className="report-title-section">
                <h2 className="report-title">{displayTitle}</h2>
                {month && year && (
                    <p className="report-period">
                        For the month of {month} {year}
                    </p>
                )}
            </div>

            <div className="report-header-divider"></div>
        </div>
    );
};

ReportHeader.propTypes = {
    reportTitle: PropTypes.string,
    month: PropTypes.string,
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showLogo: PropTypes.bool
};

export default ReportHeader;
