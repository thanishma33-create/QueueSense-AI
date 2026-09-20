import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TokenSlipModal from '../components/patient/TokenSlipModal';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Building,
  Calendar,
  Accessibility,
  ShieldAlert,
  Clock,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegistrationPage() {
  const { departments, registerPatient } = useQueue();
  const { currentUser } = useAuth();

  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 1);
  const [patientRef, setPatientRef] = useState('');
  const [anonymizedName, setAnonymizedName] = useState('');
  const [ageGroup, setAgeGroup] = useState('Adult (18-59)');
  const [visitType, setVisitType] = useState('Walk-in OPD');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState([]);
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('Frail Senior Citizen Assistance');
  const [priorityStaffNote, setPriorityStaffNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (departments.length > 0 && (!departmentId || !departments.find(d => d.id === departmentId))) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);

  const [generatedToken, setGeneratedToken] = useState(null);

  const handleAccessibilityToggle = (item) => {
    setAccessibilityNeeds(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const generatedName = anonymizedName.trim() || `Patient #${Math.floor(100 + Math.random() * 900)}`;
      const generatedRef = patientRef.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)} (${ageGroup.split(' ')[0]})`;

      const payload = {
        departmentId,
        patientRef: generatedRef,
        anonymizedName: generatedName,
        ageGroup,
        visitType,
        accessibilityNeeds,
        isPriority,
        priorityReason: isPriority ? priorityReason : null,
        priorityStaffNote: isPriority ? (priorityStaffNote || `Staff verified by ${currentUser?.name}`) : null,
        priorityVerifiedBy: isPriority ? `${currentUser?.name || 'Staff Nurse'} (${currentUser?.roleName || 'Triage'})` : null,
      };

      const result = await registerPatient(payload);
      if (result.success) {
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        setGeneratedToken(result.token);
        // Reset inputs
        setPatientRef('');
        setAnonymizedName('');
        setIsPriority(false);
        setPriorityStaffNote('');
        setAccessibilityNeeds([]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Patient Intake &amp; Token Dispatch Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reception Desk Station • Bilingual Token Slip Printing &amp; Accessibility Support
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-brand-600" />
          <span>Assisted Registration Active</span>
        </div>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Department Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              1. Select OPD Clinical Specialty *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {departments.map((dept) => {
                const isSelected = dept.id === departmentId;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setDepartmentId(dept.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {dept.name} ({dept.code})
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {dept.activeCounters} Counters
                        </span>
                      </div>
                      <p className="text-xs font-malayalam text-brand-700 dark:text-brand-300 font-semibold mt-1">
                        {dept.malayalamName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{dept.location}</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-600" />
                        ~{Math.round(dept.avgServiceTimeMinutes * 2)}m wait
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Patient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                2. Patient Reference / Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. K. Raman (68y) or REF-8291"
                value={patientRef}
                onChange={(e) => setPatientRef(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                3. Age Group Category *
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Adult (18-59)">Adult (18–59 years)</option>
                <option value="Senior Citizen (60+)">Senior Citizen (60+ years) — Elderly Desk</option>
                <option value="Super Senior (75+)">Super Senior Citizen (75+ years)</option>
                <option value="Pediatric (< 12)">Pediatric / Child (1–12 years)</option>
                <option value="Infant (< 1)">Infant (&lt; 1 year)</option>
              </select>
            </div>
          </div>

          {/* Step 3: Visit Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              4. Visit Classification
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Walk-in OPD', 'Scheduled Follow-up', 'Referral Case'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVisitType(type)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                    visitType === type
                      ? 'bg-navy-900 text-white border-navy-900 dark:bg-brand-600 dark:border-brand-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Accessibility Support */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-brand-600" />
              5. Special Accessibility Assistance Needs
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                'Wheelchair Assistance',
                'Malayalam Voice Prompt',
                'Hearing/Speech Aid',
                'Vision Guidance',
              ].map((acc) => {
                const isChecked = accessibilityNeeds.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => handleAccessibilityToggle(acc)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      isChecked
                        ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="mr-1.5">{isChecked ? '☑' : '☐'}</span>
                    <span className="text-[11px] leading-tight">{acc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 5: Staff Priority Verification */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                    Staff-Verified Clinical Priority Fast-Track
                  </h4>
                  <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                    Clinical prioritization must be validated by authorized hospital triage or nursing personnel. Patients cannot self-triage.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {isPriority && (
              <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                    Clinical Priority Category *
                  </label>
                  <select
                    value={priorityReason}
                    onChange={(e) => setPriorityReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Frail Senior Citizen Assistance">Frail Senior Citizen Mobility Assistance</option>
                    <option value="High Febrile Episode under 1 yr">Pediatric High Febrile Case (&lt; 1 yr)</option>
                    <option value="Post-Chemotherapy Weakness Review">Post-Chemo / Oncology Day-care Follow-up</option>
                    <option value="Severe Immobility / Acute Joint Sprain">Acute Immobility / Stretcher Case</option>
                    <option value="Doctor Direct Referral Note">Doctor Direct Referral Note</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                    Audit Verification Justification
                  </label>
                  <input
                    type="text"
                    placeholder={`Authorized by ${currentUser?.name || 'Reception Staff'} (e.g. initial triage station verification)`}
                    value={priorityStaffNote}
                    onChange={(e) => setPriorityStaffNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="teal"
              size="lg"
              icon={Sparkles}
              loading={isSubmitting}
            >
              Generate OPD Token Ticket
            </Button>
          </div>
        </form>
      </Card>

      {/* Generated Token Slip Modal */}
      <TokenSlipModal
        token={generatedToken}
        isOpen={!!generatedToken}
        onClose={() => setGeneratedToken(null)}
      />
    </div>
  );
}
