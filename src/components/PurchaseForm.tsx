import React, { useState } from 'react';
import { Client, MutualFund, PurchaseRequest } from '../types/transaction';
import { bseApiService } from '../services/bseApi';
import { ShoppingCart, CreditCard, Smartphone, Globe, Calendar, CheckCircle } from 'lucide-react';

interface PurchaseFormProps {
  client: Client;
  selectedScheme: MutualFund;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ 
  client, 
  selectedScheme, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMode: 'NETBANKING' as const,
    sipFlag: false,
    sipFrequency: 'MONTHLY' as const,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentModeOptions = [
    { value: 'NETBANKING', label: 'Net Banking', icon: Globe },
    { value: 'UPI', label: 'UPI', icon: Smartphone },
    { value: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
  ];

  const sipFrequencyOptions = [
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amount < selectedScheme.minAmount) {
      newErrors.amount = `Minimum amount is ₹${selectedScheme.minAmount}`;
    } else if (amount > selectedScheme.maxAmount) {
      newErrors.amount = `Maximum amount is ₹${selectedScheme.maxAmount}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const request: PurchaseRequest = {
        clientId: client.id,
        schemeCode: selectedScheme.schemeCode,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        sipFlag: formData.sipFlag,
        sipFrequency: formData.sipFlag ? formData.sipFrequency : undefined,
      };

      const response = await bseApiService.purchaseTransaction(request);
      
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateUnits = () => {
    const amount = parseFloat(formData.amount);
    if (amount && selectedScheme.nav) {
      return (amount / selectedScheme.nav).toFixed(4);
    }
    return '0';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <ShoppingCart className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Purchase Transaction</h2>
      </div>

      {/* Client & Scheme Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Client Information</h3>
          <p className="text-sm text-gray-600">{client.name}</p>
          <p className="text-sm text-gray-600">{client.panCard}</p>
          <div className="flex items-center space-x-1 mt-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">KYC Verified</span>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Scheme Details</h3>
          <p className="text-sm text-gray-600 truncate">{selectedScheme.schemeName}</p>
          <p className="text-sm text-gray-600">{selectedScheme.amcName}</p>
          <p className="text-sm text-gray-600">NAV: ₹{selectedScheme.nav}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter amount"
              min={selectedScheme.minAmount}
              max={selectedScheme.maxAmount}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            Min: ₹{selectedScheme.minAmount.toLocaleString()} | Max: ₹{selectedScheme.maxAmount.toLocaleString()}
          </div>
          {formData.amount && (
            <div className="mt-2 text-sm text-blue-600">
              Estimated Units: {calculateUnits()}
            </div>
          )}
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Mode
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentModeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('paymentMode', option.value)}
                  className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                    formData.paymentMode === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SIP Options */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              id="sipFlag"
              checked={formData.sipFlag}
              onChange={(e) => handleInputChange('sipFlag', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="sipFlag" className="flex items-center space-x-2 font-medium text-gray-900">
              <Calendar className="w-4 h-4" />
              <span>Set up SIP (Systematic Investment Plan)</span>
            </label>
          </div>
          
          {formData.sipFlag && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SIP Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {sipFrequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('sipFrequency', option.value)}
                    className={`p-3 border rounded-lg font-medium transition-colors ${
                      formData.sipFrequency === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Purchase</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;