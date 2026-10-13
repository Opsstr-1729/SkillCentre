import { useState, useEffect } from 'react';
import { StandardizedSubmission } from './types';
import { Header } from './components/Header';
import { DataCollectionForm } from './components/DataCollectionForm';
import { SummaryPage } from './components/SummaryPage';

const LOCAL_STORAGE_KEY = 'kerala_infrastructure_submissions_v4';

export default function App() {
  const [activeView, setActiveView] = useState<'form' | 'summary'>('form');
  const [submissions, setSubmissions] = useState<StandardizedSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from local storage:', e);
    }
    return [];
  });

  // Fetch submissions from backend on initial load
  useEffect(() => {
    async function loadBackendSubmissions() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSubmissions(data);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.warn('Backend submissions fetch fallback to local storage:', err);
      }
    }
    loadBackendSubmissions();
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }, [submissions]);

  // Handle Form Submission -> sends to Google Apps Script backend proxy
  const handleFormSubmit = async (submission: StandardizedSubmission) => {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to submit data record.');
      }

      const result = await response.json();
      const confirmedRecord = {
        ...submission,
        id: result.id || submission.id,
      };

      setSubmissions((prev) => [confirmedRecord, ...prev]);
    } catch (err: any) {
      console.error('Error submitting record:', err);
      // Fallback: save to client state even if offline
      setSubmissions((prev) => [submission, ...prev]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#0e5774]/20 selection:text-[#0e5774]">
      {/* Top Navigation Header with Data Collection & Summary options */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        submissionsCount={submissions.length}
      />

      {/* Main View: Dedicated Form OR Dedicated Summary (No scrolling into summary!) */}
      <main className="flex-1 pb-16">
        {activeView === 'form' ? (
          <DataCollectionForm
            onSubmitSuccess={handleFormSubmit}
            onNavigateToSummary={() => setActiveView('summary')}
          />
        ) : (
          <SummaryPage
            submissions={submissions}
            onNavigateToForm={() => setActiveView('form')}
          />
        )}
      </main>
    </div>
  );
}
