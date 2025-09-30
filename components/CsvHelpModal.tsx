import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, ArrowDownTrayIcon } from './icons/Icons';

interface CsvHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CsvHelpModal: React.FC<CsvHelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const handleDownloadSample = () => {
    const sampleCsvData = 
`name_en,name_ja,type,countryStrengths,contactName,contactEmail,contactPhone,website
Grand Palace Hotel,グランドパレスホテル,hotel,"South Korea;USA;Taiwan",Mr. Kim,kim@grandpalace.com,123-456-7890,https://www.grandpalace-hotel.com
Sunrise Tours,サンライズツアー,tourGuide;hotel,"Singapore;Malaysia",Mr. Tanaka,tanaka@sunrise.jp,234-567-8901,
Adventure Guides Inc.,アドベンチャーガイズ社,tourGuide,"USA;Canada;Australia",,,,\n`;

    const blob = new Blob([sampleCsvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_clients.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const requiredColumns = ['name_en', 'name_ja', 'type'];
  const optionalColumns = ['countryStrengths', 'contactName', 'contactEmail', 'contactPhone', 'website'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <header className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('guideTitle')}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-600">{t('guideDescription')}</p>
          
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-800">{t('requiredColumns')}</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('columnHeader')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('columnDescription')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requiredColumns.map(col => (
                    <tr key={col}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-mono bg-gray-50"><code>{col}</code></td>
                      <td className="px-4 py-2 text-sm text-gray-600">{t(`column_${col}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-800">{t('optionalColumns')}</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('columnHeader')}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('columnDescription')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {optionalColumns.map(col => (
                        <tr key={col}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-mono bg-gray-50"><code>{col}</code></td>
                            <td className="px-4 py-2 text-sm text-gray-600">{t(`column_${col}`)}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-800">{t('sampleData')}</h3>
            <pre className="bg-gray-800 text-white p-4 rounded-lg text-xs overflow-x-auto">
              <code>
{`name_en,name_ja,type,countryStrengths,contactName
Grand Palace Hotel,グランドパレスホテル,hotel,"USA;South Korea",Mr. Kim
Sunrise Tours,サンライズツアー,hotel;tourGuide,Singapore,Mr. Tanaka`}
              </code>
            </pre>
          </div>

        </main>
        <footer className="flex justify-between items-center gap-3 p-6 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={handleDownloadSample} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
            <ArrowDownTrayIcon className="w-5 h-5" />
            {t('downloadSampleCSV')}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50">
            {t('cancel')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CsvHelpModal;