import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Download, 
  Eye, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { deleteSurveyResponse } from '../services/supabaseService';
import { Button } from './Button';

interface SurveyAnswer {
  id: string;
  question_number: number;
  question: string;
  answer: string;
}

interface SurveyResponse {
  id: string;
  created_at: string;
  visitor_id: string;
  age_group: string;
  state: string;
  city: string;
  occupation: string;
  income_range: string;
  business_interest: string;
  business_ranking: string[];
  suggestions?: string;
  device_type?: string;
  browser?: string;
  completion_time: number;
  survey_answers: SurveyAnswer[];
}

interface AdminResponsesProps {
  responses: SurveyResponse[];
  onRefresh: () => void;
}

export const AdminResponses: React.FC<AdminResponsesProps> = ({ responses, onRefresh }) => {
  // Navigation & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof SurveyResponse>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filters state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    occupation: '',
    income: '',
    business: '',
    device: '',
    browser: ''
  });

  // Selected Response for details drawer
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    visitorId: true,
    state: true,
    city: true,
    occupation: true,
    income: true,
    business: true,
    duration: true,
    actions: true
  });
  const [colToggleOpen, setColToggleOpen] = useState(false);

  // Clear all filters helper
  const handleClearFilters = () => {
    setFilters({
      state: '',
      city: '',
      occupation: '',
      income: '',
      business: '',
      device: '',
      browser: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Sorting Handler
  const handleSort = (field: keyof SurveyResponse) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Unique lists for filtering dropdowns (computed from raw responses)
  const filterDropdownOptions = useMemo(() => {
    const states = new Set<string>();
    const cities = new Set<string>();
    const occupationsList = new Set<string>();
    const incomes = new Set<string>();
    const businesses = new Set<string>();
    const devices = new Set<string>();
    const browsers = new Set<string>();

    responses.forEach(r => {
      if (r.state) states.add(r.state);
      if (r.city) cities.add(r.city);
      if (r.occupation) occupationsList.add(r.occupation);
      if (r.income_range) incomes.add(r.income_range);
      if (r.business_interest) businesses.add(r.business_interest);
      if (r.device_type) devices.add(r.device_type);
      if (r.browser) browsers.add(r.browser);
    });

    return {
      states: Array.from(states).sort(),
      cities: Array.from(cities).sort(),
      occupations: Array.from(occupationsList).sort(),
      incomes: Array.from(incomes).sort(),
      businesses: Array.from(businesses).sort(),
      devices: Array.from(devices).sort(),
      browsers: Array.from(browsers).sort()
    };
  }, [responses]);

  // Filtered and Sorted list
  const filteredAndSortedResponses = useMemo(() => {
    let result = [...responses];

    // 1. Text Search Filter
    if (searchTerm.trim().length > 0) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.state.toLowerCase().includes(term) ||
        r.city.toLowerCase().includes(term) ||
        r.occupation.toLowerCase().includes(term) ||
        r.visitor_id.toLowerCase().includes(term) ||
        (r.suggestions && r.suggestions.toLowerCase().includes(term))
      );
    }

    // 2. Multi-dropdown Filters
    if (filters.state) result = result.filter(r => r.state === filters.state);
    if (filters.city) result = result.filter(r => r.city === filters.city);
    if (filters.occupation) result = result.filter(r => r.occupation === filters.occupation);
    if (filters.income) result = result.filter(r => r.income_range === filters.income);
    if (filters.business) result = result.filter(r => r.business_interest === filters.business);
    if (filters.device) result = result.filter(r => r.device_type === filters.device);
    if (filters.browser) result = result.filter(r => r.browser === filters.browser);

    // 3. Apply Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle null/undef
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB as string)
          : (valB as string).localeCompare(valA);
      } else if (sortField === 'created_at') {
        const dateA = new Date(valA as any).getTime();
        const dateB = new Date(valB as any).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // Numbers
        return sortDirection === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    return result;
  }, [responses, searchTerm, filters, sortField, sortDirection]);

  // Paginated Subset
  const paginatedResponses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedResponses.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedResponses, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedResponses.length / pageSize) || 1;

  // Deletion logic
  const handleDeleteResponse = async (id: string) => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete this response? This will also remove the visitor answers and cannot be undone.')) {
      try {
        await deleteSurveyResponse(id);
        onRefresh();
        if (selectedResponse?.id === id) {
          setSelectedResponse(null);
        }
      } catch (err: any) {
        alert('Failed to delete response: ' + err.message);
      }
    }
  };

  // EXPORT UTILITIES
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getExportData = () => {
    // Return either filtered list or full dataset based on confirmation
    const exportAll = window.confirm('Click OK to export the entire dataset, or Cancel to export only the current filtered rows.');
    return exportAll ? responses : filteredAndSortedResponses;
  };

  const handleExportCSV = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data available to export.');

    const headers = ['Date', 'Visitor ID', 'Age Group', 'State', 'City', 'Occupation', 'Income Bracket', 'Venture Chosen', 'Suggestions', 'Completion Time (s)', 'Device', 'Browser'];
    const csvRows = [headers.join(',')];

    data.forEach(r => {
      const row = [
        new Date(r.created_at).toLocaleDateString(),
        r.visitor_id,
        r.age_group,
        `"${r.state.replace(/"/g, '""')}"`,
        `"${r.city.replace(/"/g, '""')}"`,
        `"${r.occupation.replace(/"/g, '""')}"`,
        `"${r.income_range.replace(/"/g, '""')}"`,
        `"${r.business_interest.replace(/"/g, '""')}"`,
        `"${(r.suggestions || 'None').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
        r.completion_time,
        r.device_type || 'Unknown',
        r.browser || 'Unknown'
      ];
      csvRows.push(row.join(','));
    });

    downloadFile(csvRows.join('\n'), `Survey_Responses_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data available to export.');
    downloadFile(JSON.stringify(data, null, 2), `Survey_Responses_${Date.now()}.json`, 'application/json');
  };

  const handleExportExcel = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data available to export.');

    // Renders a simple HTML table loaded as spreadsheet
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
      <table border="1">
        <tr style="background-color:#6366F1; color:#ffffff; font-weight:bold;">
          <td>Date</td>
          <td>Visitor ID</td>
          <td>Age Group</td>
          <td>State</td>
          <td>City</td>
          <td>Occupation</td>
          <td>Monthly Income</td>
          <td>Chosen Business</td>
          <td>Completion Time (s)</td>
          <td>Suggestions</td>
          <td>Device</td>
          <td>Browser</td>
        </tr>`;

    data.forEach(r => {
      excelContent += `
        <tr>
          <td>${new Date(r.created_at).toLocaleDateString()}</td>
          <td>${r.visitor_id}</td>
          <td>${r.age_group}</td>
          <td>${r.state}</td>
          <td>${r.city}</td>
          <td>${r.occupation}</td>
          <td>${r.income_range}</td>
          <td>${r.business_interest}</td>
          <td>${r.completion_time}</td>
          <td>${r.suggestions || 'None'}</td>
          <td>${r.device_type || 'Unknown'}</td>
          <td>${r.browser || 'Unknown'}</td>
        </tr>`;
    });

    excelContent += `</table></body></html>`;
    downloadFile(excelContent, `Survey_Responses_${Date.now()}.xls`, 'application/vnd.ms-excel');
  };

  const handleExportPDF = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data available to export.');

    // Premium Printable window structure
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Popups are blocked by your browser. Please allow popups to export PDF.');

    let tableRows = '';
    data.forEach((r, idx) => {
      tableRows += `
        <tr style="background-color: ${idx % 2 === 0 ? '#f9fafb' : '#ffffff'};">
          <td>${new Date(r.created_at).toLocaleDateString()}</td>
          <td>${r.visitor_id.slice(0, 8)}...</td>
          <td>${r.state}</td>
          <td>${r.city}</td>
          <td>${r.occupation}</td>
          <td>${r.income_range}</td>
          <td>${r.business_interest}</td>
          <td>${r.completion_time}s</td>
        </tr>`;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Executive Survey Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; color: #1e1b4b; }
            h1 { font-family: 'Outfit', sans-serif; font-size: 24px; margin-bottom: 0.25rem; }
            p { font-size: 14px; color: #475569; margin-bottom: 1.5rem; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th { background-color: #6366F1; color: white; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>Survey Responses Report</h1>
          <p>Generated on ${new Date().toLocaleString()} | Total records: ${data.length}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Visitor ID</th>
                <th>State</th>
                <th>City</th>
                <th>Occupation</th>
                <th>Income</th>
                <th>Chosen Business</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            Survey Responses Table
          </h1>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
            Search, filter, inspect and manage individual survey submissions.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleExportCSV}
            className="glass-panel"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="glass-panel"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <Download size={14} /> JSON
          </button>
          <button
            onClick={handleExportExcel}
            className="glass-panel"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <Download size={14} /> Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="glass-panel"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <Download size={14} /> PDF Report
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '440px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-body)', opacity: 0.6 }} />
          <input
            type="text"
            placeholder="Search state, city, occupation or Visitor ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '12px',
              border: '1.5px solid var(--border-color)',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* Filter / Column Toggles */}
        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
          
          {/* Filter Trigger */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.1rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: filterDrawerOpen ? 'var(--primary)' : 'var(--text-main)',
              borderColor: filterDrawerOpen ? 'var(--primary)' : 'var(--border-color)',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={16} />
            Filters
            {(filters.state || filters.city || filters.occupation || filters.income || filters.business || filters.device || filters.browser) && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
            )}
          </button>

          {/* Columns Visibility Trigger */}
          <button
            onClick={() => setColToggleOpen(!colToggleOpen)}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.1rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            Columns <ChevronDown size={14} />
          </button>

          {colToggleOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.75rem',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)',
                minWidth: '160px'
              }}
            >
              {Object.keys(visibleColumns).map(key => {
                const col = key as keyof typeof visibleColumns;
                return (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </label>
                );
              })}
            </div>
          )}

          {/* Clear Filters (Dynamic visibility) */}
          {(searchTerm || filters.state || filters.city || filters.occupation || filters.income || filters.business || filters.device || filters.browser) && (
            <button
              onClick={handleClearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#EF4444',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0 0.5rem'
              }}
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Side Filters Drawer Panel */}
      {filterDrawerOpen && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            animation: 'var(--transition-fast)'
          }}
        >
          {/* State */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>State</span>
            <select
              value={filters.state}
              onChange={(e) => { setFilters({ ...filters, state: e.target.value }); setCurrentPage(1); }}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">All States</option>
              {filterDropdownOptions.states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* City */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>City</span>
            <select
              value={filters.city}
              onChange={(e) => { setFilters({ ...filters, city: e.target.value }); setCurrentPage(1); }}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">All Cities</option>
              {filterDropdownOptions.cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Occupation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>Occupation</span>
            <select
              value={filters.occupation}
              onChange={(e) => { setFilters({ ...filters, occupation: e.target.value }); setCurrentPage(1); }}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">All Occupations</option>
              {filterDropdownOptions.occupations.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Income */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>Income Range</span>
            <select
              value={filters.income}
              onChange={(e) => { setFilters({ ...filters, income: e.target.value }); setCurrentPage(1); }}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">All Incomes</option>
              {filterDropdownOptions.incomes.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* Business Chosen */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>Venture Chosen</span>
            <select
              value={filters.business}
              onChange={(e) => { setFilters({ ...filters, business: e.target.value }); setCurrentPage(1); }}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">All Ventures</option>
              {filterDropdownOptions.businesses.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Device */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>Device</span>
            <select
              value={filters.device}
              onChange={(e) => { setFilters({ ...filters, device: e.target.value }); setCurrentPage(1); }}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="">All Devices</option>
              {filterDropdownOptions.devices.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Main Responses Table */}
      <div className="glass-panel" style={{ borderRadius: '20px', border: '1px solid var(--border-color)', overflowX: 'auto', backgroundColor: 'var(--bg-card)' }}>
        <table className="responses-table">
          <thead>
            <tr>
              {visibleColumns.date && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                  Date {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.visitorId && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('visitor_id')}>
                  Visitor ID {sortField === 'visitor_id' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.state && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('state')}>
                  State {sortField === 'state' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.city && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('city')}>
                  City {sortField === 'city' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.occupation && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('occupation')}>
                  Occupation {sortField === 'occupation' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.income && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('income_range')}>
                  Income {sortField === 'income_range' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.business && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('business_interest')}>
                  Chosen Venture {sortField === 'business_interest' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.duration && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('completion_time')}>
                  Time {sortField === 'completion_time' && (sortDirection === 'asc' ? <ChevronUp size={12} style={{ display: 'inline' }} /> : <ChevronDown size={12} style={{ display: 'inline' }} />)}
                </th>
              )}
              {visibleColumns.actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedResponses.length > 0 ? (
              paginatedResponses.map(row => (
                <tr key={row.id}>
                  {visibleColumns.date && (
                    <td>{new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  )}
                  {visibleColumns.visitorId && (
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {row.visitor_id.slice(0, 8)}...
                    </td>
                  )}
                  {visibleColumns.state && <td>{row.state}</td>}
                  {visibleColumns.city && <td>{row.city}</td>}
                  {visibleColumns.occupation && <td>{row.occupation}</td>}
                  {visibleColumns.income && <td>{row.income_range}</td>}
                  {visibleColumns.business && (
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.business_interest}</td>
                  )}
                  {visibleColumns.duration && <td>{row.completion_time}s</td>}
                  {visibleColumns.actions && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSelectedResponse(row)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.25rem' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteResponse(row.id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                          title="Delete Response"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-body)', fontSize: '0.95rem' }}>
                  No survey responses matched your search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
        
        {/* Row count info */}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
          Showing <strong>{filteredAndSortedResponses.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredAndSortedResponses.length)}</strong> of <strong>{filteredAndSortedResponses.length}</strong> responses
        </span>

        {/* Page navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Page size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-body)' }}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none' }}
            >
              {[5, 10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>

          {/* Prev/Next buttons */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: currentPage === 1 ? 'transparent' : 'var(--bg-card)', color: currentPage === 1 ? 'var(--border-color)' : 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: currentPage === totalPages ? 'transparent' : 'var(--bg-card)', color: currentPage === totalPages ? 'var(--border-color)' : 'var(--text-main)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>

      </div>

      {/* Details Slide Drawer */}
      {selectedResponse && (
        <div className="drawer-backdrop" onClick={() => setSelectedResponse(null)}>
          <div 
            className="drawer-content admin-scrollable" 
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '2rem', overflowY: 'auto' }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Submission Details
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontFamily: 'monospace' }}>
                  ID: {selectedResponse.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-body)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Demographics Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-body)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Participant Demographics
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <div>State: <strong>{selectedResponse.state}</strong></div>
                  <div>City: <strong>{selectedResponse.city}</strong></div>
                  <div>Age Group: <strong>{selectedResponse.age_group}</strong></div>
                  <div>Occupation: <strong>{selectedResponse.occupation}</strong></div>
                  <div>Monthly Income: <strong>{selectedResponse.income_range}</strong></div>
                  <div>Completion Speed: <strong>{selectedResponse.completion_time}s</strong></div>
                  <div>Device: <strong>{selectedResponse.device_type || 'Unknown'}</strong></div>
                  <div>Browser: <strong>{selectedResponse.browser || 'Unknown'}</strong></div>
                </div>
              </div>

              {/* Business Rank Breakdown */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-body)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Business Idea Rankings
                </h4>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {selectedResponse.business_ranking.map((rank, idx) => (
                    <li key={idx} style={{ color: idx === 0 ? 'var(--primary)' : 'var(--text-main)', fontWeight: idx === 0 ? 700 : 500 }}>
                      {rank}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Survey Answers List */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-body)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  Detailed Q&A Answers
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedResponse.survey_answers && selectedResponse.survey_answers.length > 0 ? (
                    selectedResponse.survey_answers
                      .sort((a, b) => a.question_number - b.question_number)
                      .map(ans => (
                        <div key={ans.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-body)' }}>
                            Q{ans.question_number}: {ans.question}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', backgroundColor: 'var(--bg-main)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 500 }}>
                            {ans.answer}
                          </span>
                        </div>
                      ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>No detailed answers found.</span>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-body)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Venture Suggestion Feedback
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{selectedResponse.suggestions || 'No recommendations supplied.'}"
                </div>
              </div>

              {/* Metadata */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div>Unique Session ID: <code style={{ backgroundColor: 'var(--bg-main)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{selectedResponse.visitor_id}</code></div>
                <div>Submitted At: {new Date(selectedResponse.created_at).toLocaleString()}</div>
              </div>

              {/* Drawer Delete */}
              <Button
                variant="outline"
                onClick={() => handleDeleteResponse(selectedResponse.id)}
                style={{ width: '100%', borderColor: '#EF4444', color: '#EF4444', marginTop: '1rem' }}
              >
                Delete Submission
              </Button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
