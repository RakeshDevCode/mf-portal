import React, { useState, useEffect } from 'react';
import { Transaction, Client } from '../types/transaction';
import { bseApiService } from '../services/bseApi';
import { Clock, CheckCircle, XCircle, AlertCircle, Filter, Calendar, Search } from 'lucide-react';

interface TransactionHistoryProps {
  client: Client;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ client }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'ALL',
    status: 'ALL',
    dateRange: '30' // days
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [client.id]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await bseApiService.getTransactionHistory(client.id);
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'PENDING':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return 'bg-blue-100 text-blue-800';
      case 'REDEEM':
        return 'bg-red-100 text-red-800';
      case 'SWITCH':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filter.type === 'ALL' || transaction.transactionType === filter.type;
    const matchesStatus = filter.status === 'ALL' || transaction.status === filter.status;
    const matchesSearch = !searchTerm || 
      transaction.schemeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    const transactionDate = new Date(transaction.timestamp);
    const daysDiff = Math.floor((Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
    const matchesDate = filter.dateRange === 'ALL' || daysDiff <= parseInt(filter.dateRange);

    return matchesType && matchesStatus && matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTransactions}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by scheme or order..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type
          </label>
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="PURCHASE">Purchase</option>
            <option value="REDEEM">Redeem</option>
            <option value="SWITCH">Switch</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="ALL">All time</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.schemeCode}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.orderNumber && `Order: ${transaction.orderNumber}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {transaction.amount && `₹${transaction.amount.toLocaleString()}`}
                      {transaction.units && `${transaction.units} units`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transactionType)}`}>
                      {transaction.transactionType}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {transaction.remarks && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {transaction.remarks}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">
              {searchTerm || filter.type !== 'ALL' || filter.status !== 'ALL'
                ? 'Try adjusting your filters'
                : 'No transactions have been made yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;