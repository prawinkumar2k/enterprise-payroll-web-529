import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * PrintPage - Single A4 page component
 * This represents ONE physical printed page
 * STRICT A4 dimensions, no responsive behavior
 * Uses React Portals to render into a clean #print-root
 */
const PrintPage = ({
    children,
    pageNumber,
    totalPages,
    orientation = 'portrait',
    header,
    footer
}) => {
    const printRoot = document.getElementById('print-root');

    const content = (
        <div className={`print-page print-page-${orientation}`}>
            {/* Header - Repeats on every page */}
            {header && (
                <div className="print-page-header">
                    {header}
                </div>
            )}

            {/* Main content area */}
            <div className="print-page-content">
                {children}
            </div>

            {/* Footer - Repeats on every page */}
            {footer && (
                <div className="print-page-footer">
                    {footer}
                    <div className="print-page-number">
                        Page {pageNumber} of {totalPages}
                    </div>
                </div>
            )}
        </div>
    );

    // If print-root doesn't exist, fall back to normal rendering
    if (!printRoot) return content;

    // Use a portal to render into the dedicated #print-root
    // This removes content from the app's flex/grid constraints
    return createPortal(content, printRoot);
};

PrintPage.propTypes = {
    children: PropTypes.node.isRequired,
    pageNumber: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    orientation: PropTypes.oneOf(['portrait', 'landscape']),
    header: PropTypes.node,
    footer: PropTypes.node
};

export default PrintPage;
