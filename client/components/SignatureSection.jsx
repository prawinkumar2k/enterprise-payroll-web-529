import React from "react";

// Signature Section (Reused everywhere)
const SignatureSection = ({ isFooter = false }) => (
    <div className={`signature-section w-full ${isFooter ? 'h-full flex flex-col justify-end' : ''}`}>
        <table className="w-full border-collapse">
            <tbody>
                <tr className="align-bottom h-24">
                    <td className="w-1/4 px-2 text-center align-bottom border-none">
                        <div className="border-t border-black pt-1 font-bold uppercase text-[10px]">Prepared By</div>
                    </td>
                    <td className="w-1/4 px-2 text-center align-bottom border-none">
                        <div className="border-t border-black pt-1 font-bold uppercase text-[10px]">Checked By</div>
                    </td>
                    <td className="w-1/4 px-2 text-center align-bottom border-none">
                        <div className="border-t border-black pt-1 font-bold uppercase text-[10px]">Superintendent</div>
                    </td>
                    <td className="w-1/4 px-2 text-center align-bottom border-none">
                        <div className="border-t border-black pt-1 font-bold uppercase text-[10px]">Principal / Signatory</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
);

export default SignatureSection;
