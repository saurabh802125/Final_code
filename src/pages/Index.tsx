import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MarketOverview from '@/components/MarketOverview';
import StockChart from '@/components/StockChart';
import StockList from '@/components/StockList';
import WatchlistComponent from '@/components/WatchlistComponent';
import StockSearch from '@/components/StockSearch';
import CSVUpload from '@/components/CSVUpload';
import DynamicStockView from '@/components/DynamicStockView';
import { Stock, StockService } from '@/services/StockData';
import { ApiStockService } from '@/services/ApiStockService';
import { useToast } from '@/components/ui/use-toast';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';
import { AuthService } from '@/services/AuthService';

const Index = () => {
  // State management
  const [showWelcome, setShowWelcome] = useState(true);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initial data fetch
  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      try {
        const apiStocks = await ApiStockService.getStocks();
        if (apiStocks.length > 0) {
          setAllStocks(apiStocks);
          setFilteredStocks(apiStocks);
          if (!selectedStock) {
            setSelectedStock(apiStocks[0]);
          }
        } else {
          const mockStocks = StockService.getStocks();
          setAllStocks(mockStocks);
          setFilteredStocks(mockStocks);
          if (!selectedStock) {
            setSelectedStock(mockStocks[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
        const stocks = StockService.getStocks();
        setAllStocks(stocks);
        setFilteredStocks(stocks);
        if (!selectedStock) {
          setSelectedStock(stocks[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Welcome splash timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // Search handler
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (query) {
      const results = StockService.searchStocks(query);
      setFilteredStocks(results);
    } else {
      setFilteredStocks(allStocks);
    }
  };

  // Stock selection handler
  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    
    // Scroll to chart section on mobile
    if (window.innerWidth < 768) {
      const chartSection = document.getElementById('chart-section');
      if (chartSection) {
        chartSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (showWelcome) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a1929] z-50">
        <div className="text-center animate-fade-up">
          <h1 className="text-5xl font-bold text-[#00f2fe] mb-4 animate-pulse">
            Welcome to StockVision
          </h1>
          <p className="text-xl text-[#8f9faa]">
            Your Real-Time Market Intelligence Platform
          </p>
          <div className="mt-8 space-y-2">
            <div className="w-64 h-1 bg-[rgba(0,242,254,0.2)] rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#00f2fe] animate-loading-bar"></div>
            </div>
            <p className="text-[#8f9faa] text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#051019] opacity-0 animate-fade-in">
      {/* Auth Header */}
      <div className="bg-[#0a1929] text-white py-2 px-4 flex justify-end space-x-2 border-b border-[rgba(255,255,255,0.1)]">
        {AuthService.isAuthenticated() ? <UserMenu /> : <AuthModal />}
      </div>
      
      {/* Main Header */}
      <Header onSearch={handleSearch} />
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Dynamic Chart View */}
        <section className="mb-8">
          <DynamicStockView />
        </section>

        {/* Market Overview */}
        <section className="mb-8">
          <MarketOverview stocks={allStocks} onSelectStock={handleStockSelect} />
        </section>
        
        {/* Selected Stock Chart */}
        <section id="chart-section" className="mb-8">
          {selectedStock && <StockChart stock={selectedStock} />}
        </section>
        
        {/* CSV Upload */}
        <section className="mb-8">
          <CSVUpload />
        </section>
        
        {/* Watchlist */}
        <section id="watchlist" className="mb-8">
          <WatchlistComponent onSelectStock={handleStockSelect} />
        </section>
        
        {/* Stock Discovery */}
        <section id="stocks" className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Discover Stocks</h2>
          <StockSearch 
            stocks={allStocks}
            onFilteredStocks={setFilteredStocks}
          />
          <StockList 
            stocks={filteredStocks} 
            title="All Stocks" 
            onSelectStock={handleStockSelect}
            refreshWatchlist={() => {
              const event = new CustomEvent('watchlist-changed');
              window.dispatchEvent(event);
            }}
          />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#0a1929] text-white py-6 border-t border-[rgba(255,255,255,0.1)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-[#00f2fe]">StockVision</h2>
              <p className="text-sm text-[#8f9faa]">Dynamic stock market analysis</p>
            </div>
            <div className="text-sm text-[#8f9faa]">
              <p>© 2025 StockVision. All rights reserved.</p>
              <p>Real-time market intelligence platform</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;