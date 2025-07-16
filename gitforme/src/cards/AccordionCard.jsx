import React, { useState, useEffect, useMemo, useRef } from 'react';


export const AccordionCard = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-3xl" role="img" aria-label="icon">{icon}</span>}
                    <h3 className="font-bold text-xl">{title}</h3>
                </div>
                <svg className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 sm:p-6 pt-0">{children}</div>
            </div>
        </div>
    );
};