import React, { useState, useEffect } from 'react';
import {
  DepartmentCategory,
  StandardizedSubmission,
  KERALA_DISTRICTS,
  DEPARTMENT_METADATA,
} from '../types';
import { EMPLOYABILITY_CENTRES } from '../data/employabilityCentres';
import { ASAP_CSPS } from '../data/asapCsps';
import {
  Building2,
  CheckCircle,
  FileCheck,
  Loader2,
  Mail,
  Phone,
  User,
  MapPin,
  ArrowRight,
  BookOpen,
  Monitor,
  Maximize2,
  Copy,
} from 'lucide-react';

interface DataCollectionFormProps {
  onSubmitSuccess: (submission: StandardizedSubmission) => Promise<void>;
  onNavigateToSummary: () => void;
}

export function DataCollectionForm({
  onSubmitSuccess,
  onNavigateToSummary,
}: DataCollectionFormProps) {
  // Department selection
  const [department, setDepartment] = useState<DepartmentCategory>('Employment');

  // Employment directory selection & pre-fill state
  const [selectedEmployabilityCentreId, setSelectedEmployabilityCentreId] = useState<string>(
    EMPLOYABILITY_CENTRES[0].id
  );

  // ASAP CSPs directory selection & pre-fill state
  const [selectedAsapCspId, setSelectedAsapCspId] = useState<string>(
    ASAP_CSPS[0].id
  );

  // General fields
  const [centreName, setCentreName] = useState(EMPLOYABILITY_CENTRES[0].name);
  const [district, setDistrict] = useState<string>(EMPLOYABILITY_CENTRES[0].district);
  const [customDistrict, setCustomDistrict] = useState('');
  const [address, setAddress] = useState(EMPLOYABILITY_CENTRES[0].address);
  const [phone, setPhone] = useState(EMPLOYABILITY_CENTRES[0].phone1);
  const [email, setEmail] = useState(EMPLOYABILITY_CENTRES[0].email);
  const [contactPerson, setContactPerson] = useState('');

  // Facility metrics
  const [classrooms, setClassrooms] = useState<string>('');
  const [classroomAreas, setClassroomAreas] = useState<string[]>([]);
  const [computers, setComputers] = useState<string>('');
  const [totalAreaSqFt, setTotalAreaSqFt] = useState<string>('');

  // Status and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedCentre, setSubmittedCentre] = useState<{
    name: string;
    department: string;
  } | null>(null);

  // Handle department change
  const handleDepartmentChange = (newDept: DepartmentCategory) => {
    setDepartment(newDept);
    setErrorMsg(null);

    if (newDept === 'Employment') {
      const centre =
        EMPLOYABILITY_CENTRES.find((c) => c.id === selectedEmployabilityCentreId) ||
        EMPLOYABILITY_CENTRES[0];
      setCentreName(centre.name);
      setDistrict(centre.district);
      setAddress(centre.address);
      setPhone(centre.phone1 + (centre.phone2 ? ` / ${centre.phone2}` : ''));
      setEmail(centre.email);
      setContactPerson('');
    } else if (newDept === 'ASAP') {
      const csp =
        ASAP_CSPS.find((c) => c.id === selectedAsapCspId) || ASAP_CSPS[0];
      setCentreName(csp.name);
      setDistrict(csp.district);
      setAddress(csp.address);
      setPhone(csp.phone1);
      setEmail(csp.email);
      setContactPerson(csp.contactPerson);
    } else {
      // Clear specific pre-fills for custom entry in KASE / ITD
      setCentreName('');
      setDistrict('Ernakulam');
      setAddress('');
      setPhone('');
      setEmail('');
      setContactPerson('');
    }
  };

  // Handle Employability Centre selection change
  const handleEmployabilityCentreSelect = (centreId: string) => {
    setSelectedEmployabilityCentreId(centreId);
    const centre = EMPLOYABILITY_CENTRES.find((c) => c.id === centreId);
    if (centre) {
      setCentreName(centre.name);
      setDistrict(centre.district);
      setAddress(centre.address);
      setPhone(centre.phone1 + (centre.phone2 ? ` / ${centre.phone2}` : ''));
      setEmail(centre.email);
      setContactPerson('');
    }
  };

  // Handle ASAP CSP selection change
  const handleAsapCspSelect = (cspId: string) => {
    setSelectedAsapCspId(cspId);
    const csp = ASAP_CSPS.find((c) => c.id === cspId);
    if (csp) {
      setCentreName(csp.name);
      setDistrict(csp.district);
      setAddress(csp.address);
      setPhone(csp.phone1);
      setEmail(csp.email);
      setContactPerson(csp.contactPerson);
    }
  };

  // Handle number of classrooms change and dynamically resize classroom areas
  const handleClassroomsChange = (countStr: string) => {
    setClassrooms(countStr);
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0) {
      setClassroomAreas([]);
      return;
    }

    const clampedCount = Math.min(count, 50); // reasonable cap
    setClassroomAreas((prev) => {
      const updated = [...prev];
      if (updated.length < clampedCount) {
        // Pad with empty strings
        while (updated.length < clampedCount) {
          updated.push('');
        }
      } else if (updated.length > clampedCount) {
        // Trim
        return updated.slice(0, clampedCount);
      }
      return updated;
    });
  };

  // Update specific classroom area
  const handleClassroomAreaChange = (index: number, value: string) => {
    setClassroomAreas((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Quick helper: Apply the first classroom's area to all classrooms
  const handleApplySizeToAll = (value: string) => {
    if (!value) return;
    setClassroomAreas((prev) => prev.map(() => value));
  };

  // Calculate sum of classroom areas
  const totalClassroomAreaSum = classroomAreas.reduce((sum, val) => {
    const n = Number(val);
    return sum + (isNaN(n) || n < 0 ? 0 : n);
  }, 0);

  // Pre-fill on initial mount for Employment
  useEffect(() => {
    if (department === 'Employment') {
      const centre = EMPLOYABILITY_CENTRES[0];
      setCentreName(centre.name);
      setDistrict(centre.district);
      setAddress(centre.address);
      setPhone(centre.phone1 + (centre.phone2 ? ` / ${centre.phone2}` : ''));
      setEmail(centre.email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!centreName.trim()) {
      setErrorMsg('Name of the Centre / Institution is required.');
      return;
    }

    const resolvedDistrict = district === 'Other' ? customDistrict.trim() : district;
    if (!resolvedDistrict) {
      setErrorMsg('Please specify the District / Location.');
      return;
    }

    const numClassrooms = Number(classrooms);
    if (classrooms === '' || isNaN(numClassrooms) || numClassrooms < 0) {
      setErrorMsg('Please provide a valid number of classrooms.');
      return;
    }

    // If there are classrooms, validate that areas are specified
    const numericClassroomAreas: number[] = [];
    if (numClassrooms > 0) {
      for (let i = 0; i < classroomAreas.length; i++) {
        const aVal = Number(classroomAreas[i]);
        if (classroomAreas[i] === '' || isNaN(aVal) || aVal <= 0) {
          setErrorMsg(`Please specify a valid square feet area for Classroom ${i + 1}.`);
          return;
        }
        numericClassroomAreas.push(aVal);
      }
    }

    if (computers === '' || isNaN(Number(computers)) || Number(computers) < 0) {
      setErrorMsg('Please provide a valid number of computers.');
      return;
    }

    const numTotalArea = Number(totalAreaSqFt);
    if (totalAreaSqFt === '' || isNaN(numTotalArea) || numTotalArea <= 0) {
      setErrorMsg('Please provide a valid total square feet area of the space.');
      return;
    }

    // Format individual classroom areas for export/reporting
    const classroomAreasFormatted =
      numericClassroomAreas.length > 0
        ? numericClassroomAreas
            .map((sq, idx) => `CR ${idx + 1}: ${sq} sq ft`)
            .join(', ')
        : 'None';

    setIsSubmitting(true);

    const submission: StandardizedSubmission = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      submittedAt: new Date().toISOString(),
      department,
      centreName: centreName.trim(),
      district: resolvedDistrict,
      classrooms: numClassrooms,
      classroomAreas: numericClassroomAreas,
      classroomAreasFormatted,
      computers: Number(computers),
      totalAreaSqFt: numTotalArea,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      contactPerson: contactPerson.trim(),
    };

    try {
      await onSubmitSuccess(submission);
      setSubmittedCentre({
        name: submission.centreName,
        department: submission.department,
      });

      // Reset numeric metrics for next entry
      setClassrooms('');
      setClassroomAreas([]);
      setComputers('');
      setTotalAreaSqFt('');

      if (department !== 'Employment' && department !== 'ASAP') {
        setCentreName('');
        setAddress('');
        setPhone('');
        setEmail('');
        setContactPerson('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit data record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Submission Success Alert */}
      {submittedCentre && (
        <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-emerald-900">
                  Data Successfully Recorded!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                  The infrastructure data for <strong>{submittedCentre.name}</strong> (
                  {submittedCentre.department}) has been registered in the database and synchronized automatically.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={onNavigateToSummary}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>View Summary Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSubmittedCentre(null)}
                    className="text-xs font-medium text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    Submit Another Record
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSubmittedCentre(null)}
              className="text-emerald-500 hover:text-emerald-700 text-sm font-medium cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Institutional Header */}
        <div className="border-b border-slate-200 bg-linear-to-r from-[#0e5774]/5 via-transparent to-transparent p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0e5774] mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>Government of Kerala · Infrastructure Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e5774] tracking-tight">
              Centre Infrastructure & Facility Data Collection
            </h1>
          </div>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-3xl">
            This form collects essential infrastructure, classroom measurements, and facility details from various centres. Please ensure all data is accurate.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-sm text-rose-800">
              <span className="font-semibold">Notice:</span> {errorMsg}
            </div>
          )}

          {/* Section 1: Department Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Stakeholder / Department Category{' '}
              <span className="text-rose-600 font-normal">*</span>
            </label>

            <select
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value as DepartmentCategory)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5774] focus:border-[#0e5774] transition-all font-medium cursor-pointer"
            >
              <option value="Employment">Department of Employment</option>
              <option value="ASAP">ASAP (Additional Skill Acquisition Programme)</option>
              <option value="KASE">KASE (Kerala Academy for Skills Excellence)</option>
              <option value="ITD">ITD (Industrial Training Department)</option>
            </select>

            <div className="mt-2.5 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <FileCheck className="w-4 h-4 text-[#0e5774] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">
                  {DEPARTMENT_METADATA[department].fullName}:
                </strong>{' '}
                {DEPARTMENT_METADATA[department].shortDesc}
              </div>
            </div>
          </div>

          {/* Pre-Filling for Employment */}
          {department === 'Employment' && (
            <div className="p-5 bg-[#f0f7fa] border border-[#bcd8e3] rounded-lg space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0e5774] mb-1.5">
                  Select Employability Centre (Pre-Filled Directory){' '}
                  <span className="text-rose-600 font-normal">*</span>
                </label>
                <select
                  value={selectedEmployabilityCentreId}
                  onChange={(e) => handleEmployabilityCentreSelect(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e5774] cursor-pointer"
                >
                  {EMPLOYABILITY_CENTRES.map((centre) => (
                    <option key={centre.id} value={centre.id}>
                      {centre.name} ({centre.district})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selecting an Employability Centre automatically populates official address, contact phones, and email.
                </p>
              </div>

              {/* Pre-filled info card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-md border border-slate-200">
                <div className="sm:col-span-2 flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#0e5774] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Official Address:</span>
                    <span className="text-slate-600 leading-relaxed">{address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-[#0e5774] shrink-0" />
                  <div>
                    <span className="text-slate-500">Phone: </span>
                    <span className="font-mono font-medium text-slate-900">{phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-[#0e5774] shrink-0" />
                  <div>
                    <span className="text-slate-500">Email: </span>
                    <span className="font-medium text-slate-900">{email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pre-Filling for ASAP Community Skill Parks (CSPs) */}
          {department === 'ASAP' && (
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
                  Select ASAP Community Skill Park (Pre-Feed Directory){' '}
                  <span className="text-rose-600 font-normal">*</span>
                </label>
                <select
                  value={selectedAsapCspId}
                  onChange={(e) => handleAsapCspSelect(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                >
                  {ASAP_CSPS.map((csp) => (
                    <option key={csp.id} value={csp.id}>
                      {csp.name} ({csp.district})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selecting an ASAP Community Skill Park automatically pre-fills official address, phone, official email, and nodal contact person.
                </p>
              </div>

              {/* Pre-filled info card for ASAP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-md border border-slate-200">
                <div className="sm:col-span-2 flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Official Address:</span>
                    <span className="text-slate-600 leading-relaxed">{address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-slate-500">Contact Person: </span>
                    <span className="font-semibold text-slate-900">{contactPerson || 'Nodal Officer'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-slate-500">Phone: </span>
                    <span className="font-mono font-medium text-slate-900">{phone}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-slate-500">Email: </span>
                    <span className="font-medium text-slate-900">{email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: General Details (Custom entry for KASE, ITD, etc.) */}
          {department !== 'Employment' && department !== 'ASAP' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#0e5774]">
                Centre Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Name of the Centre / Institution{' '}
                    <span className="text-rose-600 font-normal">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Govt ITI Kalamassery / CoE KASE"
                    value={centreName}
                    onChange={(e) => setCentreName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e5774]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    District / Location <span className="text-rose-600 font-normal">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e5774] cursor-pointer"
                  >
                    {KERALA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                    <option value="Other">Other / Specific Locality</option>
                  </select>
                </div>

                {district === 'Other' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Specify Location <span className="text-rose-600 font-normal">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kakkanad Tech Zone"
                      value={customDistrict}
                      onChange={(e) => setCustomDistrict(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e5774]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <hr className="border-slate-200" />

          {/* Section 3: Facility Metrics (Classroom Areas & Total Space) */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#0e5774] uppercase tracking-wider block">
                Facility Metrics & Spatial Capacity
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Classroom Dimensions, Computers & Total Space Area
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record the square feet area for each individual classroom, available computers, and the total space footprint.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Metric 1: Number of classrooms */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-[#0e5774]">
                  <BookOpen className="w-4 h-4" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Number of Classrooms <span className="text-rose-600">*</span>
                  </label>
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  placeholder="e.g. 3"
                  value={classrooms}
                  onChange={(e) => handleClassroomsChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e5774] font-mono tabular-nums"
                />
                <span className="text-[11px] text-slate-500 block">
                  Active instructional classrooms in this centre
                </span>
              </div>

              {/* Metric 2: Number of computers */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-[#0e5774]">
                  <Monitor className="w-4 h-4" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Number of Computers <span className="text-rose-600">*</span>
                  </label>
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 25"
                  value={computers}
                  onChange={(e) => setComputers(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e5774] font-mono tabular-nums"
                />
                <span className="text-[11px] text-slate-500 block">
                  Functional computer systems for learning
                </span>
              </div>
            </div>

            {/* Dynamic Section: Square Feet Area of EACH Classroom */}
            {classroomAreas.length > 0 && (
              <div className="p-5 bg-[#f0f7fa] border border-[#bcd8e3] rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-[#0e5774]">
                      <Maximize2 className="w-4 h-4" />
                      <h3 className="text-sm font-bold text-[#0e5774]">
                        Sq. Ft. Area of Each Classroom ({classroomAreas.length})
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Specify the individual built-up floor area (in sq. ft.) for each classroom.
                    </p>
                  </div>

                  {classroomAreas.length > 1 && classroomAreas[0] && (
                    <button
                      type="button"
                      onClick={() => handleApplySizeToAll(classroomAreas[0])}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0e5774] bg-white border border-[#bcd8e3] rounded hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
                      title="Copy Classroom 1 size to all other classrooms"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Apply {classroomAreas[0]} sq ft to all</span>
                    </button>
                  )}
                </div>

                {/* Grid of classroom area inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {classroomAreas.map((areaVal, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          Classroom {idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          CR #{idx + 1}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 450"
                          value={areaVal}
                          onChange={(e) =>
                            handleClassroomAreaChange(idx, e.target.value)
                          }
                          className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0e5774] font-mono pr-14"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                          sq. ft.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cumulative classroom summary */}
                <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-[#bcd8e3] text-xs">
                  <span className="text-slate-600 font-medium">
                    Combined Classroom Footprint:
                  </span>
                  <span className="font-extrabold text-[#0e5774] font-mono text-sm">
                    {totalClassroomAreaSum.toLocaleString()} sq. ft.
                  </span>
                </div>
              </div>
            )}

            {/* Metric 3: Total Square Feet Area of the Space */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-[#0e5774]">
                <Maximize2 className="w-4 h-4" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Total Square Feet Area of the Space <span className="text-rose-600">*</span>
                </label>
              </div>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 5000"
                value={totalAreaSqFt}
                onChange={(e) => setTotalAreaSqFt(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e5774] font-mono tabular-nums"
              />
              <span className="text-[11px] text-slate-500 block">
                Total built-up space of the facility (including classrooms, labs, offices, and utility areas).
              </span>
            </div>
          </div>

          {/* Form Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 bg-[#0e5774] hover:bg-[#093f54] text-white text-sm font-bold rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Data...</span>
                </>
              ) : (
                <>
                  <span>Submit Data Record</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
