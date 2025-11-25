import { useRef, useState, useContext } from "react";
import { dataCntxt } from "../../context/DataContext";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from "react-router-dom";

const Sidebar = () => {
    const sideRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const { menuData } = useContext(dataCntxt);
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev, // FIXED — keep previous sections
            [sectionId]: !prev[sectionId]
        }));
    };

    return (
        <div>
            {/* Mobile toggle button */}
            <button
                onClick={() => setIsOpen(true)}
                className="text-white lg:hidden hover:bg-[#313131] px-4 py-3 cursor-pointer rounded-4xl tracking-[1.25rem] min-h-[3rem] min-w-[3rem]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill="none" d="M0 0h24v24H0V0z" />
                    <path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="fixed top-0 left-0 w-screen h-screen z-100"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        ref={sideRef}
                        className="bg-[#1f1f1f] h-screen overflow-y-auto relative w-[280px] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <div
                            onClick={() => setIsOpen(false)}
                            className="cursor-pointer p-2 my-4 mx-2 hover:bg-[#313131] w-fit rounded-4xl text-white absolute right-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fill="none" d="M0 0h24v24H0V0z" />
                                <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89a.996.996 0 0 0 0-1.4z" />
                            </svg>
                        </div>

                        {/* Menu */}
                        <div className="text-white pt-4 mt-10 clear-both cursor-pointer">
                            {menuData?.map((section) => {
                                const isExpanded = expandedSections[section.id];

                                return (
                                    <div key={section.id}>
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between pr-4 group transition cursor-pointer duration-200 hover:bg-[#313131]"
                                        >
                                            <img
                                                src={section.icon}
                                                alt={`${section.name} icon`}
                                                className={`w-6 h-6 transition m-3 ${
                                                    isExpanded
                                                        ? "white-to-yellow"
                                                        : "invert opacity-50 group-hover:opacity-100"
                                                }`}
                                            />

                                            <span
                                                className={`flex-1 text-left text-md transition-colors ${
                                                    isExpanded
                                                        ? "text-amber-400"
                                                        : "group-hover:text-white text-white"
                                                }`}
                                            >
                                                {section.name}
                                            </span>

                                            {section.items?.length > 0 && (
                                                isExpanded
                                                    ? <ChevronUp size={18} className="text-white" />
                                                    : <ChevronDown size={18} className="opacity-50 group-hover:opacity-100" />
                                            )}
                                        </button>

                                        {isExpanded && section.items?.length > 0 && (
                                            <div className="border-b border-gray-700">
                                                {section.items.map((item, index) => (
                                                    <Link
                                                        key={index}
                                                        to={item.url}
                                                        onClick={() => setIsOpen(false)}
                                                        className="block pl-12 pr-4 py-2 text-md hover:text-white hover:bg-[#313131]"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
