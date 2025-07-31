import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

// Simple inline companies list for immediate functionality
const companies: Company[] = [
  { id: 'tcs', name: 'TCS' },
  { id: 'infosys', name: 'Infosys' },
  { id: 'wipro', name: 'Wipro' },
  { id: 'accenture', name: 'Accenture' },
  { id: 'cognizant', name: 'Cognizant' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'google', name: 'Google' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'oracle', name: 'Oracle' },
  { id: 'ibm', name: 'IBM' },
  { id: 'deloitte', name: 'Deloitte' },
  { id: 'pwc', name: 'PWC' },
  { id: 'ey', name: 'E&Y' },
  { id: 'tech-mahindra', name: 'Tech Mahindra' },
  { id: 'lt-infotech', name: 'L&T Infotech' },
  { id: 'mindtree', name: 'Mindtree' },
  { id: 'mphasis', name: 'Mphasis' },
  { id: 'capgemini', name: 'Capgemini' },
  { id: 'hcl', name: 'HCL Technologies' },
  { id: 'cts', name: 'Cognizant Technology Solutions' },
  { id: 'freshworks', name: 'Freshworks' },
  { id: 'zoho', name: 'ZOHO' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'cisco', name: 'Cisco' },
  { id: 'salesforce', name: 'Salesforce' },
  { id: 'vmware', name: 'VMware' },
  { id: 'adobe', name: 'Adobe' },
  { id: 'dell', name: 'Dell' },
  { id: 'hp', name: 'HP' },
  { id: 'other', name: 'Other' }
];

interface CompanySelectorProps {
  value: string;
  onChange: (company: string) => void;
  error?: string;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [searchQuery]);

  const handleCompanySelect = (company: Company) => {
    onChange(company.name);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    onChange(inputValue);
    setIsOpen(true);
  };

  const clearSelection = () => {
    onChange('');
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery || value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a company..."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCompanies.length > 0 ? (
            <div className="py-2">
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleCompanySelect(company)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-blue-600">
                      {company.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-900">{company.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No companies found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySelector; 