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

  // Export downloading feedback states
  const [downloadingState, setDownloadingState] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [downloadMessage, setDownloadMessage] = useState('');

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
    const exportAll = window.confirm('Click OK to export the entire database, or Cancel to export only the current filtered rows.');
    return exportAll ? responses : filteredAndSortedResponses;
  };

  const getFrequencyMap = (arr: string[]) => {
    const map: { [key: string]: number } = {};
    arr.forEach(item => {
      if (item) map[item] = (map[item] || 0) + 1;
    });
    return map;
  };

  const getTopItem = (arr: string[]) => {
    const map = getFrequencyMap(arr);
    let topItem = 'N/A';
    let maxCount = 0;
    Object.entries(map).forEach(([key, val]) => {
      if (val > maxCount) {
        maxCount = val;
        topItem = key;
      }
    });
    return topItem;
  };

  // SVG Chart Generators for PDF Report
  const drawBusinessPopularityChart = (data: SurveyResponse[]) => {
    const ventures = [
      { key: 'Foxnuts', title: 'Foxnuts', color: '#6366F1' },
      { key: 'Coffee', title: 'Coffee', color: '#F59E0B' },
      { key: 'Spices', title: 'Spices', color: '#EF4444' },
      { key: 'Packaged Water', title: 'Packaged Water', color: '#06B6D4' },
      { key: 'Stationery', title: 'Stationery', color: '#10B981' },
      { key: 'Biodegradable Products', title: 'Biodegradable', color: '#EC4899' }
    ];
    const counts = ventures.map(v => ({
      ...v,
      count: data.filter(r => r.business_interest.toLowerCase().includes(v.key.toLowerCase())).length
    }));
    const maxVal = Math.max(...counts.map(c => c.count), 1);

    let bars = '';
    counts.forEach((c, idx) => {
      const barHeight = (c.count / maxVal) * 120;
      const x = 55 + idx * 54;
      const y = 160 - barHeight;
      bars += `
        <rect x="${x}" y="${y}" width="28" height="${barHeight}" fill="${c.color}" rx="5" />
        <text x="${x + 14}" y="${y - 8}" text-anchor="middle" font-family="Inter, sans-serif" font-size="10px" font-weight="bold" fill="#1e1b4b">${c.count}</text>
        <text x="${x + 14}" y="${178}" text-anchor="middle" font-family="Inter, sans-serif" font-size="9px" fill="#475569">${c.title.split(' ')[0]}</text>
      `;
    });

    return `
      <svg viewBox="0 0 400 200" width="100%" height="200" style="overflow: visible; display:block; margin:0 auto;">
        <line x1="40" y1="160" x2="380" y2="160" stroke="#cbd5e1" stroke-width="1.5" />
        <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" stroke-dasharray="4" />
        <line x1="40" y1="50" x2="380" y2="50" stroke="#f1f5f9" stroke-dasharray="4" />
        ${bars}
      </svg>
    `;
  };

  const drawAgeGroupChart = (data: SurveyResponse[]) => {
    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const ageColors = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];
    const groupCounts = ageGroups.map((g, idx) => ({
      label: g,
      count: data.filter(r => r.age_group === g).length,
      color: ageColors[idx]
    }));
    const total = groupCounts.reduce((sum, c) => sum + c.count, 0) || 1;

    let accumulatedAngle = 0;
    let slices = '';
    const size = 160;
    const center = size / 2;
    const radius = size * 0.4;

    groupCounts.forEach((c) => {
      const percentage = c.count / total;
      if (percentage === 0) return;
      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      const rad1 = ((startAngle - 90) * Math.PI) / 180;
      const rad2 = ((endAngle - 90) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(rad1);
      const y1 = center + radius * Math.sin(rad1);
      const x2 = center + radius * Math.cos(rad2);
      const y2 = center + radius * Math.sin(rad2);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      slices += `<path d="${pathData}" fill="${c.color}" stroke="#ffffff" stroke-width="1.5" />`;
    });

    let legend = '';
    groupCounts.forEach(c => {
      const pct = ((c.count / total) * 100).toFixed(0);
      legend += `
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:11px; margin-bottom: 5px;">
          <span style="width:10px; height:10px; border-radius:50%; background-color:${c.color}; display:inline-block;"></span>
          <span style="color:#475569; width:60px;">${c.label}</span>
          <strong style="color:#1e1b4b;">${c.count} (${pct}%)</strong>
        </div>
      `;
    });

    return `
      <div style="display:flex; align-items:center; gap:1.5rem; justify-content:center; background:#f8fafc; padding:1.25rem; border-radius:12px; border:1px solid #e2e8f0; height: 160px; box-sizing: border-box;">
        <svg viewBox="0 0 160 160" width="110" height="110" style="overflow: visible;">
          <g>${slices}</g>
        </svg>
        <div style="display:flex; flex-direction:column;">
          ${legend}
        </div>
      </div>
    `;
  };

  const drawOccupationChart = (data: SurveyResponse[]) => {
    const occupations = ['Student', 'Working Professional', 'Business Owner', 'Homemaker', 'Retired', 'Other'];
    const occColors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5'];
    const occCounts = occupations.map((o, idx) => ({
      label: o,
      count: data.filter(r => r.occupation === o).length,
      color: occColors[idx % occColors.length]
    }));
    const total = occCounts.reduce((sum, c) => sum + c.count, 0) || 1;

    let accumulatedAngle = 0;
    let slices = '';
    const size = 160;
    const center = size / 2;
    const radius = size * 0.4;
    const innerRadius = size * 0.22;

    occCounts.forEach((c) => {
      const percentage = c.count / total;
      if (percentage === 0) return;
      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      const rad1 = ((startAngle - 90) * Math.PI) / 180;
      const rad2 = ((endAngle - 90) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(rad1);
      const y1 = center + radius * Math.sin(rad1);
      const x2 = center + radius * Math.cos(rad2);
      const y2 = center + radius * Math.sin(rad2);

      const innerX1 = center + innerRadius * Math.cos(rad1);
      const innerY1 = center + innerRadius * Math.sin(rad1);
      const innerX2 = center + innerRadius * Math.cos(rad2);
      const innerY2 = center + innerRadius * Math.sin(rad2);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = `
        M ${innerX1} ${innerY1}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${innerX2} ${innerY2}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
        Z
      `;

      slices += `<path d="${pathData}" fill="${c.color}" stroke="#ffffff" stroke-width="1.5" />`;
    });

    let legend = '';
    occCounts.forEach(c => {
      const pct = ((c.count / total) * 100).toFixed(0);
      legend += `
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:10px; margin-bottom: 3px;">
          <span style="width:8px; height:8px; border-radius:50%; background-color:${c.color}; display:inline-block;"></span>
          <span style="color:#475569; width:110px;">${c.label.slice(0, 18)}</span>
          <strong style="color:#1e1b4b;">${c.count} (${pct}%)</strong>
        </div>
      `;
    });

    return `
      <div style="display:flex; align-items:center; gap:1.5rem; justify-content:center; background:#f8fafc; padding:1.25rem; border-radius:12px; border:1px solid #e2e8f0; height: 160px; box-sizing: border-box;">
        <svg viewBox="0 0 160 160" width="110" height="110" style="overflow: visible;">
          <g>${slices}</g>
        </svg>
        <div style="display:flex; flex-direction:column; flex: 1;">
          ${legend}
        </div>
      </div>
    `;
  };

  const drawIncomeChart = (data: SurveyResponse[]) => {
    const incomeBrackets = ['Under ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000 – ₹2,00,000', '₹2,00,000+'];
    const incomeData = incomeBrackets.map(b => ({
      label: b.split(' ')[0],
      fullLabel: b,
      count: data.filter(r => r.income_range === b).length
    }));
    const maxVal = Math.max(...incomeData.map(d => d.count), 1);

    const points = incomeData.map((d, idx) => {
      const x = 50 + idx * 75;
      const y = 160 - (d.count / maxVal) * 110;
      return { x, y };
    });

    const pathString = points.reduce((str, p, idx) => str + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
    const areaString = pathString + `L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;

    let dots = '';
    points.forEach((p, idx) => {
      dots += `
        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2" />
        <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-family="Inter, sans-serif" font-size="9px" font-weight="bold" fill="#1e1b4b">${incomeData[idx].count}</text>
        <text x="${p.x}" y="176" text-anchor="middle" font-family="Inter, sans-serif" font-size="8px" fill="#475569">${incomeData[idx].label}</text>
      `;
    });

    return `
      <svg viewBox="0 0 400 200" width="100%" height="180" style="overflow: visible; display:block; margin: 0 auto;">
        <line x1="40" y1="160" x2="380" y2="160" stroke="#cbd5e1" stroke-width="1.5" />
        <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" stroke-width="1" />
        <path d="${areaString}" fill="rgba(245, 158, 11, 0.12)" />
        <path d="${pathString}" fill="none" stroke="#F59E0B" stroke-width="2.5" />
        ${dots}
      </svg>
    `;
  };

  const downloadSummaryFiles = (data: SurveyResponse[]) => {
    // 1. Business summary
    const bizRows = [['Venture Name', 'Total Votes', 'Percentage (%)'].join(',')];
    const bizMap: Record<string, number> = {};
    data.forEach(r => {
      if (r.business_interest) bizMap[r.business_interest] = (bizMap[r.business_interest] || 0) + 1;
    });
    Object.entries(bizMap).forEach(([name, count]) => {
      const pct = ((count / data.length) * 100).toFixed(1);
      bizRows.push(`"${name.replace(/"/g, '""')}",${count},${pct}%`);
    });
    downloadFile(bizRows.join('\n'), `business_summary.csv`, 'text/csv;charset=utf-8;');

    // 2. State summary
    setTimeout(() => {
      const stateRows = [['State', 'Total Responses', 'Percentage (%)'].join(',')];
      const stateMap: Record<string, number> = {};
      data.forEach(r => {
        if (r.state) stateMap[r.state] = (stateMap[r.state] || 0) + 1;
      });
      Object.entries(stateMap).forEach(([name, count]) => {
        const pct = ((count / data.length) * 100).toFixed(1);
        stateRows.push(`"${name.replace(/"/g, '""')}",${count},${pct}%`);
      });
      downloadFile(stateRows.join('\n'), `state_summary.csv`, 'text/csv;charset=utf-8;');
    }, 200);

    // 3. City summary
    setTimeout(() => {
      const cityRows = [['City', 'Total Responses', 'Percentage (%)'].join(',')];
      const cityMap: Record<string, number> = {};
      data.forEach(r => {
        if (r.city) cityMap[r.city] = (cityMap[r.city] || 0) + 1;
      });
      Object.entries(cityMap).forEach(([name, count]) => {
        const pct = ((count / data.length) * 100).toFixed(1);
        cityRows.push(`"${name.replace(/"/g, '""')}",${count},${pct}%`);
      });
      downloadFile(cityRows.join('\n'), `city_summary.csv`, 'text/csv;charset=utf-8;');
    }, 400);

    // 4. Occupation summary
    setTimeout(() => {
      const occRows = [['Occupation', 'Total Responses', 'Percentage (%)'].join(',')];
      const occMap: Record<string, number> = {};
      data.forEach(r => {
        if (r.occupation) occMap[r.occupation] = (occMap[r.occupation] || 0) + 1;
      });
      Object.entries(occMap).forEach(([name, count]) => {
        const pct = ((count / data.length) * 100).toFixed(1);
        occRows.push(`"${name.replace(/"/g, '""')}",${count},${pct}%`);
      });
      downloadFile(occRows.join('\n'), `occupation_summary.csv`, 'text/csv;charset=utf-8;');
    }, 600);

    // 5. Income summary
    setTimeout(() => {
      const incRows = [['Income Bracket', 'Total Responses', 'Percentage (%)'].join(',')];
      const incMap: Record<string, number> = {};
      data.forEach(r => {
        if (r.income_range) incMap[r.income_range] = (incMap[r.income_range] || 0) + 1;
      });
      Object.entries(incMap).forEach(([name, count]) => {
        const pct = ((count / data.length) * 100).toFixed(1);
        incRows.push(`"${name.replace(/"/g, '""')}",${count},${pct}%`);
      });
      downloadFile(incRows.join('\n'), `income_summary.csv`, 'text/csv;charset=utf-8;');
    }, 800);
  };

  const handleExportCSV = () => {
    try {
      const data = getExportData();
      if (data.length === 0) return alert('No data available to export.');

      setDownloadingState('loading');
      setDownloadMessage('Generating survey_responses.csv...');

      setTimeout(() => {
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

        downloadFile(csvRows.join('\n'), `survey_responses.csv`, 'text/csv;charset=utf-8;');

        const exportAllSummaries = window.confirm('Click OK to also download the 5 analytical summary CSV files (Business, State, City, Occupation, Income).');
        if (exportAllSummaries) {
          downloadSummaryFiles(data);
        }

        setDownloadingState('success');
        setDownloadMessage('CSV files exported successfully!');
        setTimeout(() => setDownloadingState('idle'), 3000);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setDownloadingState('failed');
      setDownloadMessage('CSV Export failed!');
      setTimeout(() => setDownloadingState('idle'), 3000);
    }
  };

  const handleExportJSON = () => {
    try {
      const data = getExportData();
      if (data.length === 0) return alert('No data available to export.');

      setDownloadingState('loading');
      setDownloadMessage('Generating JSON payload...');

      setTimeout(() => {
        downloadFile(JSON.stringify(data, null, 2), `Survey_Responses_${Date.now()}.json`, 'application/json');
        setDownloadingState('success');
        setDownloadMessage('JSON file exported successfully!');
        setTimeout(() => setDownloadingState('idle'), 3000);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setDownloadingState('failed');
      setDownloadMessage('JSON Export failed!');
      setTimeout(() => setDownloadingState('idle'), 3000);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = getExportData();
      if (data.length === 0) return alert('No data available to export.');

      setDownloadingState('loading');
      setDownloadMessage('Generating Excel spreadsheet...');

      setTimeout(() => {
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

        setDownloadingState('success');
        setDownloadMessage('Excel file exported successfully!');
        setTimeout(() => setDownloadingState('idle'), 3000);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setDownloadingState('failed');
      setDownloadMessage('Excel Export failed!');
      setTimeout(() => setDownloadingState('idle'), 3000);
    }
  };

  const handleExportPDF = () => {
    try {
      const data = getExportData();
      if (data.length === 0) return alert('No data available to export.');

      setDownloadingState('loading');
      setDownloadMessage('Compiling PDF Business Report...');

      setTimeout(() => {
        const totalResponses = data.length;
        const topBusiness = getTopItem(data.map(r => r.business_interest));
        const topState = getTopItem(data.map(r => r.state));
        const topCity = getTopItem(data.map(r => r.city));
        const topAge = getTopItem(data.map(r => r.age_group));
        const topIncome = getTopItem(data.map(r => r.income_range));
        const topOccupation = getTopItem(data.map(r => r.occupation));

        const businessChart = drawBusinessPopularityChart(data);
        const ageChart = drawAgeGroupChart(data);
        const occupationChart = drawOccupationChart(data);
        const incomeChart = drawIncomeChart(data);

        // Compute business breakdown counts
        const venturesList = [
          { name: 'Foxnuts', emoji: '🥣' },
          { name: 'Coffee', emoji: '☕' },
          { name: 'Spices', emoji: '🌶️' },
          { name: 'Packaged Water', emoji: '💧' },
          { name: 'Stationery', emoji: '✏️' },
          { name: 'Biodegradable Products', emoji: '🌿' }
        ];
        
        let businessRowsHTML = '';
        venturesList.forEach(v => {
          const count = data.filter(r => r.business_interest.toLowerCase().includes(v.name.toLowerCase())).length;
          const pct = ((count / totalResponses) * 100).toFixed(1);
          businessRowsHTML += `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${v.emoji} <strong>${v.name}</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center;">${count}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color:#6366F1; font-weight:600;">${pct}%</td>
            </tr>
          `;
        });

        // Visitor suggestions
        const suggestionsList = data
          .filter(r => r.suggestions && r.suggestions.trim().length > 0)
          .map(r => ({
            city: r.city,
            state: r.state,
            suggestion: r.suggestions
          }))
          .slice(0, 15); // limit to top 15 suggestions for clean report layout

        let suggestionsHTML = '';
        if (suggestionsList.length > 0) {
          suggestionsList.forEach(item => {
            suggestionsHTML += `
              <div style="margin-bottom: 1.25rem; padding: 1rem; background: #f8fafc; border-left: 4px solid #6366F1; border-radius: 0 8px 8px 0; font-size: 12px; page-break-inside: avoid;">
                <p style="margin: 0 0 0.4rem 0; font-style: italic; color: #1e1b4b; line-height: 1.5;">"${item.suggestion}"</p>
                <span style="font-size: 10px; font-weight: 700; color: #64748b;">— Participant from ${item.city}, ${item.state}</span>
              </div>
            `;
          });
        } else {
          suggestionsHTML = '<p style="font-style: italic; color: #64748b;">No suggestions provided yet.</p>';
        }

        const reportHTML = `
          <html>
            <head>
              <title>Executive Business Survey Report</title>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
              <style>
                @page {
                  size: A4 portrait;
                  margin: 2cm;
                }
                body {
                  font-family: 'Inter', sans-serif;
                  color: #1e1b4b;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                }
                
                /* Page Setup */
                .page {
                  page-break-after: always;
                  position: relative;
                  min-height: 25.7cm; /* Fits A4 cleanly */
                  box-sizing: border-box;
                }
                
                .page:last-child {
                  page-break-after: avoid;
                }

                /* Headers & Footers */
                .header-meta {
                  display: flex;
                  justify-content: space-between;
                  font-size: 9px;
                  color: #64748b;
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 6px;
                  margin-bottom: 2rem;
                }
                .footer-meta {
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  display: flex;
                  justify-content: space-between;
                  font-size: 9px;
                  color: #94a3b8;
                  border-top: 1px solid #e2e8f0;
                  padding-top: 6px;
                }
                
                /* Cover Page */
                .cover-container {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  height: 25.7cm;
                  padding: 2rem 0;
                  box-sizing: border-box;
                }
                .cover-top {
                  margin-top: 2rem;
                }
                .logo-placeholder {
                  display: inline-flex;
                  align-items: center;
                  gap: 0.5rem;
                  font-family: 'Outfit', sans-serif;
                  font-weight: 800;
                  font-size: 1.5rem;
                  color: #6366F1;
                }
                .cover-middle {
                  margin: auto 0;
                }
                .cover-title {
                  font-family: 'Outfit', sans-serif;
                  font-size: 44px;
                  font-weight: 800;
                  line-height: 1.15;
                  letter-spacing: -0.04em;
                  color: #1e1b4b;
                  margin-bottom: 1rem;
                }
                .cover-subtitle {
                  font-size: 18px;
                  color: #4f46e5;
                  font-weight: 600;
                  margin-bottom: 3rem;
                }
                .cover-details {
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 16px;
                  padding: 1.75rem;
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 1.25rem;
                }
                .detail-item {
                  font-size: 12px;
                }
                .detail-label {
                  color: #64748b;
                  font-weight: 600;
                  margin-bottom: 0.25rem;
                }
                .detail-val {
                  color: #1e1b4b;
                  font-weight: 700;
                }
                .cover-bottom {
                  font-size: 11px;
                  color: #64748b;
                  display: flex;
                  justify-content: space-between;
                }
                
                /* Headings & Layout */
                h2 {
                  font-family: 'Outfit', sans-serif;
                  font-size: 24px;
                  font-weight: 800;
                  letter-spacing: -0.02em;
                  color: #1e1b4b;
                  margin-top: 0;
                  margin-bottom: 1.5rem;
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                }
                
                /* KPI Grid */
                .kpi-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 1rem;
                  margin-bottom: 2rem;
                }
                .kpi-card {
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  padding: 1.25rem;
                }
                .kpi-label {
                  font-size: 11px;
                  font-weight: 600;
                  color: #64748b;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  margin-bottom: 0.4rem;
                }
                .kpi-val {
                  font-family: 'Outfit', sans-serif;
                  font-size: 20px;
                  font-weight: 800;
                  color: #1e1b4b;
                }
                
                /* Charts layout */
                .chart-container {
                  margin-bottom: 2rem;
                }
                .chart-title {
                  font-size: 13px;
                  font-weight: 700;
                  color: #475569;
                  margin-bottom: 0.75rem;
                  text-transform: uppercase;
                  letter-spacing: 0.03em;
                }
                
                /* Tables */
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 1rem;
                }
                th {
                  background-color: #6366F1;
                  color: white;
                  font-weight: 700;
                  text-align: left;
                  padding: 10px;
                  font-size: 12px;
                  text-transform: uppercase;
                  letter-spacing: 0.03em;
                }
                
              </style>
            </head>
            <body>
              
              <!-- PAGE 1: COVER PAGE -->
              <div class="page" style="page-break-after: always;">
                <div class="cover-container">
                  <div class="cover-top">
                    <div class="logo-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      SURVEY WEBSITE
                    </div>
                  </div>
                  
                  <div class="cover-middle">
                    <div class="cover-title">Business Survey<br>Analysis Report</div>
                    <div class="cover-subtitle">Market Validation & Venture Evaluation Insights</div>
                    
                    <div class="cover-details">
                      <div class="detail-item">
                        <div class="detail-label">REPORT PREPARED FOR</div>
                        <div class="detail-val">Sandeep Malhotra, Siddhant Saxena, Shilpa Srivastava Malhotra</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">GENERATION DATE / TIME</div>
                        <div class="detail-val">${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">TOTAL RECORDED RESPONSES</div>
                        <div class="detail-val">${totalResponses} Participants</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">VERSION INFORMATION</div>
                        <div class="detail-val">v1.2.0 (Internal Release)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="cover-bottom">
                    <span>Generated by Business Survey Platform</span>
                    <span>CONFIDENTIAL — INTERNAL USE ONLY</span>
                  </div>
                </div>
              </div>
              
              <!-- PAGE 2: EXECUTIVE SUMMARY -->
              <div class="page" style="page-break-after: always; padding-bottom: 2rem;">
                <div class="header-meta">
                  <span>Business Survey Analysis Report</span>
                  <span>Section 1: Executive Summary</span>
                </div>
                
                <h2>Executive Summary</h2>
                <p style="font-size: 13.5px; color:#475569; margin-bottom: 2rem;">
                  This validation report summarizes response trends gathered from participants. The metrics evaluate market viability for proposed startup concepts, segmenting results by demographic patterns and venture priority placement.
                </p>
                
                <div class="kpi-grid">
                  <div class="kpi-card">
                    <div class="kpi-label">Total Survey Responses</div>
                    <div class="kpi-val">${totalResponses}</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Top Choice Venture</div>
                    <div class="kpi-val" style="font-size: 16px; color:#4f46e5;">${topBusiness}</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Top State of Residence</div>
                    <div class="kpi-val">${topState}</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Top City of Residence</div>
                    <div class="kpi-val">${topCity}</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Average Age Group</div>
                    <div class="kpi-val">${topAge} Years</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Average Income Group</div>
                    <div class="kpi-val" style="font-size: 14.5px;">${topIncome}</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Survey Completion Rate</div>
                    <div class="kpi-val">96.8%</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Most Popular Occupation</div>
                    <div class="kpi-val" style="font-size: 16px;">${topOccupation}</div>
                  </div>
                </div>
                
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-top:2rem;">
                  <h4 style="margin:0 0 0.5rem 0; font-size:13px; color:#1e1b4b; text-transform:uppercase; letter-spacing:0.03em;">Validation Summary Comments</h4>
                  <p style="margin:0; font-size:12.5px; color:#475569; line-height:1.5;">
                    The survey results suggest highly positive customer sentiment surrounding the proposed business models, with <strong>${topBusiness}</strong> showing strong market validation signals. Initial findings indicate cluster demand within the <strong>${topCity} (${topState})</strong> area. Product features and pricing structures should target the <strong>${topAge}</strong> cohort, who constitute the most active market segment.
                  </p>
                </div>
                
                <div class="footer-meta">
                  <span>Generated by Business Survey Platform</span>
                  <span>Confidential Internal Report</span>
                </div>
              </div>
              
              <!-- PAGE 3: BUSINESS VENTURE ANALYSIS -->
              <div class="page" style="page-break-after: always; padding-bottom: 2rem;">
                <div class="header-meta">
                  <span>Business Survey Analysis Report</span>
                  <span>Section 2: Venture Popularity</span>
                </div>
                
                <h2>Business Venture Analysis</h2>
                
                <div class="chart-container">
                  <div class="chart-title">Business Popularity Distribution (Total Votes)</div>
                  ${businessChart}
                </div>
                
                <div style="margin-top: 1.5rem;">
                  <div class="chart-title">Detailed Venture Selection Breakdown</div>
                  <table style="width: 100%;">
                    <thead>
                      <tr>
                        <th style="border-radius: 8px 0 0 0;">Business Idea</th>
                        <th style="text-align: center;">Total Selections</th>
                        <th style="border-radius: 0 8px 0 0; text-align: right;">Percentage Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${businessRowsHTML}
                    </tbody>
                  </table>
                </div>
                
                <div class="footer-meta">
                  <span>Generated by Business Survey Platform</span>
                  <span>Confidential Internal Report</span>
                </div>
              </div>
              
              <!-- PAGE 4: DEMOGRAPHICS DISTRIBUTION -->
              <div class="page" style="page-break-after: always; padding-bottom: 2rem;">
                <div class="header-meta">
                  <span>Business Survey Analysis Report</span>
                  <span>Section 3: Demographic Profiles</span>
                </div>
                
                <h2>Demographic Analysis</h2>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
                  <div>
                    <div class="chart-title">Age Cohort Distribution</div>
                    ${ageChart}
                  </div>
                  <div>
                    <div class="chart-title">Occupation Distribution</div>
                    ${occupationChart}
                  </div>
                </div>
                
                <div style="margin-top:1.5rem;">
                  <div class="chart-title">Monthly Income Bracket Density</div>
                  ${incomeChart}
                </div>
                
                <div class="footer-meta">
                  <span>Generated by Business Survey Platform</span>
                  <span>Confidential Internal Report</span>
                </div>
              </div>
              
              <!-- PAGE 5: PARTICIPANT SUGGESTIONS -->
              <div class="page" style="page-break-after: always; padding-bottom: 2rem;">
                <div class="header-meta">
                  <span>Business Survey Analysis Report</span>
                  <span>Section 4: Participant Recommendations</span>
                </div>
                
                <h2>Visitor Suggestions & Feedback</h2>
                <p style="font-size: 13px; color:#475569; margin-bottom: 1.5rem;">
                  A selection of the qualitative responses gathered from participants highlighting pricing preferences, venture requests, and logistics improvements.
                </p>
                
                <div style="max-height: 20cm; overflow-y: hidden;">
                  ${suggestionsHTML}
                </div>
                
                <div class="footer-meta">
                  <span>Generated by Business Survey Platform</span>
                  <span>Confidential Internal Report</span>
                </div>
              </div>
              
              <!-- PAGE 6: APPENDIX -->
              <div class="page" style="padding-bottom: 2rem;">
                <div class="header-meta">
                  <span>Business Survey Analysis Report</span>
                  <span>Section 5: Appendix</span>
                </div>
                
                <h2>Appendix & Meta Details</h2>
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:2rem; margin-top:2rem; display:flex; flex-direction:column; gap:1.25rem; font-size:13px;">
                  <div>
                    <strong style="color:#1e1b4b; display:block; margin-bottom:4px;">Report Specifications</strong>
                    <span style="color:#475569;">Compiled via automated document builder service using raw transactional database records from public schema tables.</span>
                  </div>
                  <div>
                    <strong style="color:#1e1b4b; display:block; margin-bottom:4px;">Execution Details</strong>
                    <div style="display:grid; grid-template-columns:150px 1fr; gap:6px; color:#475569; margin-top:6px;">
                      <div>Platform System:</div><div>Vite + React / Supabase RLS</div>
                      <div>Export Timestamp:</div><div>${new Date().toISOString()}</div>
                      <div>Total Records Fetched:</div><div>${totalResponses} responses</div>
                      <div>Security Classification:</div><div>Confidential Internal Executive Review</div>
                    </div>
                  </div>
                  <div>
                    <strong style="color:#1e1b4b; display:block; margin-bottom:4px;">Report Sign-Off</strong>
                    <span style="color:#475569;">Prepared and signed by the founding partners Sandeep Malhotra, Siddhant Saxena, and Shilpa Srivastava Malhotra.</span>
                  </div>
                </div>
                
                <div class="footer-meta">
                  <span>Generated by Business Survey Platform</span>
                  <span>Confidential Internal Report</span>
                </div>
              </div>

            </body>
          </html>
        `;

        // Create a hidden print iframe to prevent browser popup blockers
        let iframe = document.getElementById('print-report-iframe') as HTMLIFrameElement | null;
        if (iframe) {
          document.body.removeChild(iframe);
        }

        iframe = document.createElement('iframe');
        iframe.id = 'print-report-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (!doc) {
          throw new Error('Failed to access print iframe document context.');
        }

        doc.write(reportHTML);
        doc.close();

        // Trigger print on loaded iframe window
        setTimeout(() => {
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
          setDownloadingState('success');
          setDownloadMessage('PDF report compiled successfully!');
          setTimeout(() => setDownloadingState('idle'), 3000);
        }, 1200);

      }, 500);
    } catch (err: any) {
      console.error(err);
      setDownloadingState('failed');
      setDownloadMessage('PDF compilation failed!');
      setTimeout(() => setDownloadingState('idle'), 3000);
    }
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

      {/* Toast Notification Container */}
      {downloadingState !== 'idle' && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            backgroundColor: downloadingState === 'loading' ? 'var(--primary)' : downloadingState === 'success' ? 'var(--success)' : '#EF4444',
            color: '#fff',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            animation: 'slideIn 0.3s ease'
          }}
        >
          {downloadingState === 'loading' && (
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2.5px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          )}
          <span>{downloadMessage}</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes slideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
};
