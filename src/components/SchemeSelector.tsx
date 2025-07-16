import React, { useState, useEffect } from 'react';
import { MutualFund } from '../types/transaction';
import { bseApiService } from '../services/bseApi';
import { TrendingUp, Search, Shield, AlertTriangle } from 'lucide-react';

interface SchemeSelectorProps {
  selectedScheme: MutualFund | null;
  onSchemeSelect: (scheme: MutualFund) => void;
  label?: string;
}

const SchemeSelector: React.FC<SchemeSelectorProps> = ({ 
  selectedScheme, 
  onSchemeSelect, 
  label = "Select Scheme" 
}) => {
  const [schemes, setSchemes] = useState<MutualFund[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await bseApiService.getMutualFunds();
      if (response.success && response.data) {
        setSchemes(response.data);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(scheme =>
    scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.amcName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-50';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-50';
      case 'HIGH': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return <Shield className="w-3 h-3" />;
      case 'MODERATE': return <TrendingUp className="w-3 h-3" />;
      case 'HIGH': return <AlertTriangle className="w-3 h-3" />;
      default: return <Shield className="w-3 h-3" />;
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <span className={selectedScheme ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedScheme ? selectedScheme.schemeName : 'Choose a scheme'}
                </span>
                {selectedScheme && (
                  <div className="text-sm text-gray-500 truncate">
                    {selectedScheme.amcName} • NAV: ₹{selectedScheme.nav}
                  </div>
                )}
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredSchemes.length > 0 ? (
                filteredSchemes.map((scheme) => (
                  <button
                    key={scheme.schemeCode}
                    onClick={() => {
                      onSchemeSelect(scheme);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{scheme.schemeName}</div>
                        <div className="text-sm text-gray-500">{scheme.amcName}</div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">NAV: ₹{scheme.nav}</span>
                          <span className="text-sm text-gray-600">{scheme.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(scheme.riskLevel)}`}>
                          {getRiskLevelIcon(scheme.riskLevel)}
                          <span className="ml-1">{scheme.riskLevel}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  No schemes found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemeSelector;