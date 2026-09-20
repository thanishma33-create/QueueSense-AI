import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  Building,
  Calendar,
  Accessibility,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegistrationModal({ isOpen, onClose, onSuccessToken }) {
  const { departments, registerPatient } = useQueue();
  const { currentUser } = useAuth();

  const [patientRef, setPatientRef] = useState('');
  const [anonymizedName, setAnonymizedName] = useState('');
  const [ageGroup, setAgeGroup] = useState('Adult (18-59)');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 1);
  const [visitType, setVisitType] = useState('Walk-in OPD');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState([]);

  React.useEffect(() => {
    if (departments.length > 0 && (!departmentId || !departments.find(d => d.id === departmentId))) {
      setDepartmentId(departments[0].id);
    }
  }, [departments, departmentId]);
  
  // Staff Verified Clinical Priority
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState('Frail Senior Citizen Assistance');
  const [priorityStaffNote, setPriorityStaffNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDept = departments.find(d => d.id === departmentId) || departments[0];

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
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch {
          // ignore if canvas not supported
        }

        onClose();
        if (onSuccessToken) {
          onSuccessToken(result.token);
        }

        // Reset form
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OPD Patient Intake & Token Generation"
      subtitle="Issue a new hospital queue token with optional accessibility & staff-verified priority"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Department Selector with Wait Time Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            1. Select OPD Specialty Department *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {departments.map((dept) => {
              const isSelected = dept.id === departmentId;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setDepartmentId(dept.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {dept.name} ({dept.code})
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {dept.activeCounters} Counters
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-malayalam">{dept.malayalamName}</span>
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

        {/* Patient Details & Age Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Patient Reference / Initials
            </label>
            <input
              type="text"
              placeholder="e.g. REF-8291 or K. Raman (68y)"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Auto-generates anonymous ID if left blank for privacy.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Age Group Category *
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Adult (18-59)">Adult (18–59 years)</option>
              <option value="Senior Citizen (60+)">Senior Citizen (60+ years)</option>
              <option value="Super Senior (75+)">Super Senior Citizen (75+ years)</option>
              <option value="Pediatric (< 12)">Pediatric / Child (1–12 years)</option>
              <option value="Infant (< 1)">Infant (&lt; 1 year)</option>
            </select>
          </div>
        </div>

        {/* Visit Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Visit Classification
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Walk-in OPD', 'Scheduled Follow-up', 'Referral Case'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setVisitType(type)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                  visitType === type
                    ? 'bg-navy-900 text-white border-navy-900 dark:bg-brand-600 dark:border-brand-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Needs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Accessibility className="w-4 h-4 text-brand-600" />
            Special Accessibility Assistance (Optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className={`p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                    isChecked
                      ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/50 dark:text-sky-200 dark:border-sky-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="mr-1">{isChecked ? '☑' : '☐'}</span>
                  <span className="text-[11px] leading-tight">{acc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Priority Guardrail (Staff-Verified Only) */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Staff-Verified Clinical Priority
                </h4>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                  Clinical priority cannot be self-assigned. Authorized triage staff must verify clinical reasons.
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {isPriority && (
            <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/50 space-y-3 animate-fade-in text-xs">
              <div>
                <label className="block font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                  Clinical Reason / Flag Category *
                </label>
                <select
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  Audit Verification Note
                </label>
                <input
                  type="text"
                  placeholder={`Authorized by ${currentUser?.name || 'Reception Nurse'} (e.g. verified vitals station #2)`}
                  value={priorityStaffNote}
                  onChange={(e) => setPriorityStaffNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="teal"
            size="md"
            icon={Sparkles}
            loading={isSubmitting}
          >
            Generate & Issue Token
          </Button>
        </div>
      </form>
    </Modal>
  );
}
