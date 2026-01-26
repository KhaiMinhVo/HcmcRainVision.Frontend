/**
 * Header Component
 * Top navigation bar with search, filters, and statistics
 */

import { useState } from 'react';
import type { RainFilter } from '../types';

interface HeaderProps {
  onSearchChange: (search: string) => void;
  onDistrictFilterChange: (district: string) => void;
  onRainFilterChange: (rainFilter: RainFilter) => void;
  districts: string[];
  totalCameras: number;
  camerasWithRain: number;
}

export default function Header({
  onSearchChange,
  onDistrictFilterChange,
  onRainFilterChange,
  districts,
  totalCameras,
  camerasWithRain,
}: HeaderProps) {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [rainFilter, setRainFilter] = useState<RainFilter>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDistrictFilter(value);
    onDistrictFilterChange(value);
  };

  const handleRainFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RainFilter;
    setRainFilter(value);
    onRainFilterChange(value);
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto">
        {/* Top Section - Title and Stats */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                HCMC Rain Detection System
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Live micro-weather rain visualization across Ho Chi Minh City
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-4 ml-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Cameras</div>
                <div className="text-lg font-semibold text-gray-900">{totalCameras}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">With Rain</div>
                <div className="text-lg font-semibold text-red-600">{camerasWithRain}</div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden ml-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className={`px-4 sm:px-6 lg:px-8 pb-4 border-t border-gray-100 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by camera name or address..."
                  value={search}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* District Filter */}
            <div className="sm:w-48">
              <select
                value={districtFilter}
                onChange={handleDistrictChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Districts</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {/* Rain Status Filter */}
            <div className="sm:w-40">
              <select
                value={rainFilter}
                onChange={handleRainFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="rain">With Rain</option>
                <option value="no-rain">No Rain</option>
              </select>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="text-sm">
              <span className="text-gray-600">Total: </span>
              <span className="font-semibold text-gray-900">{totalCameras}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Rain: </span>
              <span className="font-semibold text-red-600">{camerasWithRain}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
