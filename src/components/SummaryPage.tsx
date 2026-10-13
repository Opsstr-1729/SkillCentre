import { useState, useMemo } from 'react';
import { StandardizedSubmission, DEPARTMENT_METADATA } from '../types';
import {
  Printer,
  Search,
  ArrowLeft,
  User,
  Phone,
  Mail,
} from 'lucide-react';

interface SummaryPageProps {
  submissions: StandardizedSubmission[];
  onNavigateToForm: () => void;
}

export function SummaryPage({ submissions, onNavigateToForm }: SummaryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Aggregated metrics across all departments
  const stats = useMemo(() => {
    const totalCentres = submissions.length;
    const totalClassrooms = submissions.reduce((sum, s) => sum + s.classrooms, 0);
    const totalComputers = submissions.reduce((sum, s) => sum + s.computers, 0);
    const totalAreaSqFt = submissions.reduce((sum, s) => sum + s.totalAreaSqFt, 0);

    const totalClassroomFootprint = submissions.reduce((sum, s) => {
      if (Array.isArray(s.classroomAreas) && s.classroomAreas.length > 0) {
        return sum + s.classroomAreas.reduce((a, b) => a + (Number(b) || 0), 0);
      }
      return sum;
    }, 0);

    // Department-wise breakdown
    const depts = ['Employment', 'ASAP', 'KASE', 'ITD'] as const;
    const byDept = depts.map((dept) => {
      const deptSubs = submissions.filter((s) => s.department === dept);
      return {
        dept,
        meta: DEPARTMENT_METADATA[dept],
        count: deptSubs.length,
        classrooms: deptSubs.reduce((sum, s) => sum + s.classrooms, 0),
        computers: deptSubs.reduce((sum, s) => sum + s.computers, 0),
        areaSqFt: deptSubs.reduce((sum, s) => sum + s.totalAreaSqFt, 0),
      };
    });

    return {
      totalCentres,
      totalClassrooms,
      totalClassroomFootprint,
      totalComputers,
      totalAreaSqFt,
      byDept,
    };
  }, [submissions]);

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.centreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [submissions, searchTerm, departmentFilter]);

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <button
            onClick={onNavigateToForm}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0e5774] hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Data Collection Form</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Executive Summary Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated infrastructure and facility audit across all departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0e5774] hover:bg-[#093f54] rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden p-6 sm:p-10 space-y-8">
        {/* Document Header */}
        <div className="border-b-2 border-[#0e5774] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0e5774] mb-1">
              <span>Government of Kerala · Infrastructure & Facility Audit</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Standardized Infrastructure Summary
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Classroom Dimensions (Sq. Ft.), Total Space Footprint, and Computer Resources Overview
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Generated Date
            </div>
            <div className="text-sm font-bold text-slate-900">{currentDateFormatted}</div>
          </div>
        </div>

        {/* 1. Standardized Aggregate KPI Cards */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e5774] mb-3">
            01. Standardized Overall Totals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Centres */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-medium text-slate-600 block">
                Centres Audited
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0e5774] font-mono tabular-nums mt-1">
                {stats.totalCentres}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                Total submissions recorded
              </span>
            </div>

            {/* Total Classrooms */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-medium text-slate-600 block">
                Total Classrooms
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0e5774] font-mono tabular-nums mt-1">
                {stats.totalClassrooms.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                {stats.totalClassroomFootprint > 0
                  ? `${stats.totalClassroomFootprint.toLocaleString()} sq. ft. room area`
                  : 'Active instruction halls'}
              </span>
            </div>

            {/* Total Computers */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-medium text-slate-600 block">
                Total Computers
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0e5774] font-mono tabular-nums mt-1">
                {stats.totalComputers.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                Functional computer systems
              </span>
            </div>

            {/* Total Space Area */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-medium text-slate-600 block">
                Total Space Area
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0e5774] font-mono tabular-nums mt-1">
                {stats.totalAreaSqFt.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">
                sq. ft. total facility area
              </span>
            </div>
          </div>
        </div>

        {/* 2. Department-Wise Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e5774] mb-3">
            02. Department-Wise Infrastructure Distribution
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.byDept.map((item) => (
              <div
                key={item.dept}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
              >
                <div className="border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {item.meta.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {item.count} {item.count === 1 ? 'centre' : 'centres'} submitted
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Classrooms:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {item.classrooms}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Computers:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {item.computers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total Space:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {item.areaSqFt.toLocaleString()} sq. ft.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Submissions Table */}
        <div className="space-y-4">
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e5774]">
              03. Detailed Submissions Ledger ({filteredSubmissions.length})
            </h3>

            {/* Filter and Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search centre, district, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0e5774]"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0e5774] cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Employment">Department of Employment</option>
                <option value="ASAP">ASAP</option>
                <option value="KASE">KASE</option>
                <option value="ITD">ITD</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3.5">Centre / Institution</th>
                  <th className="py-3 px-3.5">Department</th>
                  <th className="py-3 px-3.5">District</th>
                  <th className="py-3 px-3.5">Classroom Sq. Ft. Breakdown</th>
                  <th className="py-3 px-3.5 text-center">Computers</th>
                  <th className="py-3 px-3.5 text-right">Total Space (sq. ft.)</th>
                  <th className="py-3 px-3.5">Contact Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => {
                    const meta = DEPARTMENT_METADATA[sub.department];
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3.5 font-semibold text-slate-900">
                          <div>{sub.centreName}</div>
                          {sub.contactPerson && (
                            <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{sub.contactPerson}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${meta.lightBg} ${meta.badgeColor}`}
                          >
                            {meta.name}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-medium">{sub.district}</td>

                        {/* Classrooms and individual sq ft area */}
                        <td className="py-3 px-3.5">
                          <div className="font-mono font-bold text-slate-900">
                            {sub.classrooms} {sub.classrooms === 1 ? 'hall' : 'halls'}
                          </div>
                          {sub.classroomAreas && sub.classroomAreas.length > 0 ? (
                            <div className="text-[10px] text-slate-600 font-mono mt-0.5 flex flex-wrap gap-1">
                              {sub.classroomAreas.map((sq, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-slate-700"
                                >
                                  CR {i + 1}: {sq} sq.ft
                                </span>
                              ))}
                            </div>
                          ) : sub.classroomAreasFormatted ? (
                            <div className="text-[10px] text-slate-500">
                              {sub.classroomAreasFormatted}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400">—</div>
                          )}
                        </td>

                        <td className="py-3 px-3.5 text-center font-mono font-bold">
                          {sub.computers}
                        </td>

                        {/* Total space sq ft */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-[#0e5774]">
                          {sub.totalAreaSqFt.toLocaleString()} sq. ft.
                        </td>

                        <td className="py-3 px-3.5 text-slate-600 text-[11px]">
                          {sub.phone || sub.email ? (
                            <div className="space-y-0.5">
                              {sub.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{sub.phone}</span>
                                </div>
                              )}
                              {sub.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">{sub.email}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No records found. Submit data through the Data Collection form to populate
                      this summary.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Sign-Off Block for Printed Reports */}
        <div className="pt-8 border-t border-slate-300 mt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
          <div>
            <div className="border-b border-slate-400 pb-12 mb-2"></div>
            <span className="font-semibold text-slate-900 block">Nodal Reporting Officer</span>
            <span className="text-[11px] text-slate-500">Infrastructure Data Collection</span>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-12 mb-2"></div>
            <span className="font-semibold text-slate-900 block">Verification Authority</span>
            <span className="text-[11px] text-slate-500">Labour & Skills Department</span>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-12 mb-2"></div>
            <span className="font-semibold text-slate-900 block">Director / Principal Secretary</span>
            <span className="text-[11px] text-slate-500">Government of Kerala</span>
          </div>
        </div>
      </div>
    </div>
  );
}
