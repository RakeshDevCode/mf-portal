import React, { useState, useEffect } from 'react';
import { Client, MutualFund, RedeemRequest } from '../types/transaction';
import { bseApiService } from '../services/bseApi';
import { TrendingDown, DollarSign, Hash, Wallet } from 'lucide-react';

interface RedeemFormProps {
  client: Client;
  selectedScheme: MutualFund;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

interface Portfolio {
  schemeCode: string;
  schemeName: string;
  units: number;
  currentValue: number;
  averageNav: number;
  investedAmount: number;
  gainLoss: number;
  gainLossPercentage: number;
}

const RedeemForm: React.FC<RedeemFormProps> = ({ 
  client, 
  selectedScheme, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    redeemType: 'AMOUNT' as const,
    amount: '',
    units: '',
  });
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redeemTypeOptions = [
    { value: 'AMOUNT', label: 'By Amount', icon: DollarSign, description: 'Redeem specific amount' },
    { value: 'UNITS', label: 'By Units', icon: Hash, description: 'Redeem specific units' },
    { value: 'ALL', label: 'All Holdings', icon: Wallet, description: 'Redeem all units' },
  ];

  useEffect(() => {
    fetchPortfolio();
  }, [client.id, selectedScheme.schemeCode]);

  const fetchPortfolio = async () => {
    setPortfolioLoading(true);
    try {
      const response = await bseApiService.getClientPortfolio(client.id);
      if (response.success && response.data) {
        const holding = response.data.find(
          (item: any) => item.schemeCode === selectedScheme.schemeCode
        );
        if (holding) {
          setPortfolio(holding);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.redeemType === 'AMOUNT') {
      const amount = parseFloat(formData.amount);
      if (!formData.amount || isNaN(amount)) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (portfolio && amount > portfolio.currentValue) {
        newErrors.amount = `Available amount is ₹${portfolio.currentValue.toFixed(2)}`;
      } else if (amount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    } else if (formData.redeemType === 'UNITS') {
      const units = parseFloat(formData.units);
      if (!formData.units || isNaN(units)) {
        newErrors.units = 'Please enter valid units';
      } else if (portfolio && units > portfolio.units) {
        newErrors.units = `Available units: ${portfolio.units}`;
      } else if (units <= 0) {
        newErrors.units = 'Units must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const request: RedeemRequest = {
        clientId: client.id,
        schemeCode: selectedScheme.schemeCode,
        redeemType: formData.redeemType,
        amount: formData.redeemType === 'AMOUNT' ? parseFloat(formData.amount) : undefined,
        units: formData.redeemType === 'UNITS' ? parseFloat(formData.units) : undefined,
      };

      const response = await bseApiService.redeemTransaction(request);
      
      if (response.success && response.data) {
        onSuccess(response.data.id);
      } else {
        setErrors({ general: response.message || 'Transaction failed' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred while processing the transaction' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateEstimatedAmount = () => {
    if (formData.redeemType === 'UNITS' && formData.units && selectedScheme.nav) {
      return (parseFloat(formData.units) * selectedScheme.nav).toFixed(2);
    }
    return '0';
  };

  const calculateEstimatedUnits = () => {
    if (formData.redeemType === 'AMOUNT' && formData.amount && selectedScheme.nav) {
      return (parseFloat(formData.amount) / selectedScheme.nav).toFixed(4);
    }
    return '0';
  };

  if (portfolioLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Holdings Found</h3>
          <p className="text-gray-500">This client doesn't have any holdings in the selected scheme.</p>
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingDown className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-900">Redeem Transaction</h2>
      </div>

      {/* Portfolio Holdings */}
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Current Holdings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Units</p>
            <p className="font-semibold text-gray-900">{portfolio.units}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Value</p>
            <p className="font-semibold text-gray-900">₹{portfolio.currentValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Invested Amount</p>
            <p className="font-semibold text-gray-900">₹{portfolio.investedAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gain/Loss</p>
            <p className={`font-semibold ${portfolio.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{portfolio.gainLoss.toLocaleString()} ({portfolio.gainLossPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Redeem Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Redeem Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {redeemTypeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, redeemType: option.value }))}
                  className={`p-4 border rounded-lg transition-colors ${
                    formData.redeemType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-sm opacity-75">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount/Units Input */}
        {formData.redeemType === 'AMOUNT' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redeem Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                max={portfolio.currentValue}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
            {formData.amount && (
              <div className="mt-2 text-sm text-blue-600">
                Estimated Units: {calculateEstimatedUnits()}
              </div>
            )}
          </div>
        )}

        {formData.redeemType === 'UNITS' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redeem Units
            </label>
            <input
              type="number"
              value={formData.units}
              onChange={(e) => handleInputChange('units', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter units"
              max={portfolio.units}
              step="0.0001"
            />
            {errors.units && (
              <p className="mt-1 text-sm text-red-600">{errors.units}</p>
            )}
            {formData.units && (
              <div className="mt-2 text-sm text-blue-600">
                Estimated Amount: ₹{calculateEstimatedAmount()}
              </div>
            )}
          </div>
        )}

        {formData.redeemType === 'ALL' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Complete Redemption</h4>
            <p className="text-sm text-blue-700">
              All {portfolio.units} units will be redeemed for approximately ₹{portfolio.currentValue.toLocaleString()}
            </p>
          </div>
        )}

        {/* Error Display */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4" />
                <span>Redeem</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RedeemForm;