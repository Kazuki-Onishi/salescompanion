import React, { useState, useRef, useEffect } from 'react';
import type { Mode } from '../types';
import { BriefcaseIcon, UserGroupIcon, LanguageIcon, Cog6ToothIcon, ArrowUpTrayIcon, QuestionMarkCircleIcon } from './icons/Icons';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  onImportCSV: (file: File) => void;
  isImporting: boolean;
  onOpenCsvHelp: () => void;
  isDemoMode: boolean;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (lang: 'en' | 'ja') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <LanguageIcon className="w-5 h-5" />
                <span>{language === 'en' ? 'English' : '日本語'}</span>
                <svg className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical">
                    <button 
                      onClick={() => handleLanguageChange('en')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange('ja')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      日本語
                    </button>
                </div>
            )}
        </div>
    );
};

const SettingsMenu: React.FC<{ onImportCSV: (file: File) => void; isImporting: boolean; onOpenCsvHelp: () => void; }> = ({ onImportCSV, isImporting, onOpenCsvHelp }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          onImportCSV(file);
        }
        if (event.target) {
          event.target.value = '';
        }
        setIsOpen(false);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleHelpClick = () => {
        onOpenCsvHelp();
        setIsOpen(false);
    };


    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                disabled={isImporting}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-wait"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={t('settings')}
            >
                {isImporting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                ) : (
                    <Cog6ToothIcon className="w-5 h-5" />
                )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv"
            />
            {isOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100" role="menu" aria-orientation="vertical">
                    <div className="py-1">
                        <button 
                          onClick={handleImportClick}
                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          <ArrowUpTrayIcon className="w-5 h-5" />
                          <span>{t('importCSV')}</span>
                        </button>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={handleHelpClick}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                        >
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                            <span>{t('csvImportGuide')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ mode, setMode, onImportCSV, isImporting, onOpenCsvHelp, isDemoMode }) => {
  const { t } = useLanguage();
  const commonButtonClasses = "flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
  const activeButtonClasses = "bg-indigo-600 text-white shadow";
  const inactiveButtonClasses = "bg-white text-gray-700 hover:bg-gray-50";

  return (
    <div className="sticky top-0 z-10">
      <header className="bg-white shadow-md h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">{t('appName')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-4 bg-gray-200 p-1 rounded-lg">
              <button
              onClick={() => setMode('hotel')}
              className={`${commonButtonClasses} ${mode === 'hotel' ? activeButtonClasses : inactiveButtonClasses}`}
              >
              <BriefcaseIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('hotelSales')}</span>
              </button>
              <button
              onClick={() => setMode('tourGuide')}
              className={`${commonButtonClasses} ${mode === 'tourGuide' ? activeButtonClasses : inactiveButtonClasses}`}
              >
              <UserGroupIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('tourGuideSales')}</span>
              </button>
          </div>
          <LanguageSwitcher />
          <SettingsMenu onImportCSV={onImportCSV} isImporting={isImporting} onOpenCsvHelp={onOpenCsvHelp}/>
        </div>
      </header>
      {isDemoMode && (
        <div className="bg-yellow-100 border-b-2 border-yellow-200 text-yellow-800 px-4 py-2 text-center text-sm">
          <p>
            <strong className="font-semibold">{t('demoModeWarning')}</strong> {t('demoModeDescription')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Header;