import React, { useState } from 'react';
import { Client, MutualFund } from '../types/transaction';
import ClientSelector from './ClientSelector';
import SchemeSelector from './SchemeSelector';
import PurchaseForm from './PurchaseForm';
import RedeemForm from './RedeemForm';
import SwitchForm from './SwitchForm';
import TransactionHistory from './TransactionHistory';
import { ShoppingCart, TrendingDown, RefreshCw, History, CheckCircle, ArrowLeft } from 'lucide-react';

type TransactionType = 'PURCHASE' | 'REDEEM' | 'SWITCH';
type ViewType = 'SELECTION' | 'TRANSACTION' | 'HISTORY' | 'SUCCESS';

const TransactionProcessor: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<MutualFund | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>('PURCHASE');
  const [currentView, setCurrentView] = useState<ViewType>('SELECTION');
  const [successTransactionId, setSuccessTransactionId] = useState<string>('');

  const transactionTypes = [
    {
      type: 'PURCHASE' as const,
      label: 'Purchase',
      icon: ShoppingCart,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      description: 'Buy mutual fund units'
    },
    {
      type: 'REDEEM' as const,
      label: 'Redeem',
      icon: TrendingDown,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      description: 'Sell mutual fund units'
    },
    {
      type: 'SWITCH' as const,
      label: 'Switch',
      icon: RefreshCw,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      description: 'Switch between schemes'
    }
  ];

  const handleTransactionSuccess = (transactionId: string) => {
    setSuccessTransactionId(transactionId);
    setCurrentView('SUCCESS');
  };

  const handleStartOver = () => {
    setSelectedClient(null);
    setSelectedScheme(null);
    setTransactionType('PURCHASE');
    setCurrentView('SELECTION');
    setSuccessTransactionId('');
  };

  const canProceed = selectedClient && selectedScheme && selectedClient.kycStatus === 'VERIFIED';

  const renderSelectionView = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">BSE Star Mutual Fund Platform</h1>
        <p className="text-lg text-gray-600">Process transactions for your clients with ease</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ClientSelector
            selectedClient={selectedClient}
            onClientSelect={setSelectedClient}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <SchemeSelector
            selectedScheme={selectedScheme}
            onSchemeSelect={setSelectedScheme}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Transaction Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transactionTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.type}
                onClick={() => setTransactionType(type.type)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  transactionType === type.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg ${
                    transactionType === type.type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setCurrentView('HISTORY')}
          disabled={!selectedClient}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <History className="w-5 h-5" />
          <span>View Transaction History</span>
        </button>

        <button
          onClick={() => setCurrentView('TRANSACTION')}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Proceed to Transaction</span>
        </button>
      </div>

      {selectedClient && selectedClient.kycStatus !== 'VERIFIED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 text-yellow-600">⚠️</div>
            <div>
              <div className="font-medium text-yellow-800">KYC Verification Required</div>
              <div className="text-sm text-yellow-700">
                Client's KYC status is {selectedClient.kycStatus}. Please complete KYC verification before proceeding.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTransactionView = () => {
    if (!selectedClient || !selectedScheme) return null;

    const commonProps = {
      client: selectedClient,
      selectedScheme,
      onSuccess: handleTransactionSuccess,
      onCancel: () => setCurrentView('SELECTION')
    };

    switch (transactionType) {
      case 'PURCHASE':
        return <PurchaseForm {...commonProps} />;
      case 'REDEEM':
        return <RedeemForm {...commonProps} />;
      case 'SWITCH':
        return <SwitchForm {...commonProps} />;
      default:
        return null;
    }
  };

  const renderHistoryView = () => {
    if (!selectedClient) return null;

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          </div>
          <button
            onClick={() => setCurrentView('SELECTION')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Selection</span>
          </button>
        </div>

        <TransactionHistory client={selectedClient} />
      </div>
    );
  };

  const renderSuccessView = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction Successful!</h2>
      <p className="text-gray-600 mb-6">
        Your {transactionType.toLowerCase()} transaction has been processed successfully.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600">Transaction ID</div>
        <div className="font-mono text-lg font-semibold text-gray-900">{successTransactionId}</div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setCurrentView('HISTORY')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Transaction History
        </button>
        <button
          onClick={handleStartOver}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start New Transaction
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {currentView === 'SELECTION' && renderSelectionView()}
      {currentView === 'TRANSACTION' && renderTransactionView()}
      {currentView === 'HISTORY' && renderHistoryView()}
      {currentView === 'SUCCESS' && renderSuccessView()}
    </div>
  );
};

export default TransactionProcessor;