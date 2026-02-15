import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const PrintHeader = ({ title, showMonthYear, month, year }) => {
    const { settings } = useSettings();

    return (
        <div className="print-header-container">
            <div className="print-logo-section">
                {settings.org_logo_url && <img src={settings.org_logo_url} alt="Logo" className="print-header-logo" />}
            </div>
            <div className="print-org-details">
                <h1 className="print-org-name">{settings.org_name}</h1>
                <p className="print-org-address">
                    {settings.org_address}
                </p>
                <p className="print-org-contact">
                    {settings.org_phone && `Phone: ${settings.org_phone}`} {settings.org_email && `| Email: ${settings.org_email}`}
                </p>
                {settings.org_tagline && <p className="print-org-tagline">{settings.org_tagline}</p>}
            </div>
            <div className="print-report-title-section">
                <h2 className="print-report-title">{title}</h2>
                {showMonthYear && (
                    <p className="print-report-period">
                        For the Month of {month} {year}
                    </p>
                )}
            </div>
            <div className="print-header-divider"></div>
        </div>
    );
};

export default PrintHeader;
