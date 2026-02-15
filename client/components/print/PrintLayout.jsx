import React from 'react';
import PrintHeader from './PrintHeader';
import PrintFooter from './PrintFooter';

const PrintLayout = ({ children, title, showMonthYear, month, year, orientation = 'landscape' }) => {
    return (
        <div className={`print-page ${orientation === 'landscape' ? 'print-landscape' : ''}`}>
            <div className="print-container">
                <PrintHeader
                    title={title}
                    showMonthYear={showMonthYear}
                    month={month}
                    year={year}
                />

                <main className="print-main-content">
                    {children}
                </main>

                <PrintFooter />
            </div>
        </div>
    );
};

export default PrintLayout;
