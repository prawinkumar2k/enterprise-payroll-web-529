import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const PrintFooter = () => {
    const { settings, isEnabled } = useSettings();

    return (
        <div className="print-footer-container">
            <div className="print-signature-grid">
                <div className="print-sig-box">
                    <div className="print-sig-line"></div>
                    <p className="print-sig-label">{settings.sig_1_label}</p>
                </div>
                <div className="print-sig-box">
                    <div className="print-sig-line"></div>
                    <p className="print-sig-label">{settings.sig_2_label}</p>
                </div>
                <div className="print-sig-box">
                    <div className="print-sig-line"></div>
                    <p className="print-sig-label">{settings.sig_3_label}</p>
                </div>
                <div className="print-sig-box">
                    <div className="print-sig-line"></div>
                    <p className="print-sig-label">{settings.sig_4_label}</p>
                </div>
            </div>

            <div className="print-system-info">
                {isEnabled('print_show_timestamp') && (
                    <span>Printed on: {new Date().toLocaleString('en-IN')}</span>
                )}
                {isEnabled('print_show_page_number') && (
                    <span className="page-number"></span>
                )}
                <span>System Generated Report</span>
            </div>
        </div>
    );
};

export default PrintFooter;
