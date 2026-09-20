import React, { useState, useMemo } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Volume2,
  ExternalLink,
  PhoneCall,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import TokenDetailModal from './TokenDetailModal';

export default function LiveQueueTable({ onRegisterClick, onPrintSlip }) {
  const {
    tokens,
    departments,
    selectedDeptId,
    updateTokenStatus,
    triggerVoiceAnnouncement,
  } = useQueue();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time-asc'); // time-asc, time-desc, token-asc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedToken, setSelectedToken] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter & Sort Logic
  const filteredTokens = useMemo(() => {
    return tokens.filter((tok) => {
      // Dept filter
      if (selectedDeptId !== 'all' && String(tok.departmentId) !== String(selectedDeptId) && tok.departmentCode !== selectedDeptId) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && tok.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Priority filter
      if (priorityFilter === 'priority' && !tok.isPriority) return false;
      if (priorityFilter === 'normal' && tok.isPriority) return false;

      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchToken = (tok.tokenNumber || '').toLowerCase().includes(query);
        const matchRef = (tok.patientRef || '').toLowerCase().includes(query);
        const matchName = (tok.anonymizedName || '').toLowerCase().includes(query);
        if (!matchToken && !matchRef && !matchName) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'time-asc') {
        return (a.registrationTimestamp || 0) - (b.registrationTimestamp || 0);
      }
      if (sortBy === 'time-desc') {
        return (b.registrationTimestamp || 0) - (a.registrationTimestamp || 0);
      }
      if (sortBy === 'token-asc') {
        return (a.tokenNumber || '').localeCompare(b.tokenNumber || '');
      }
      return 0;
    });
  }, [tokens, selectedDeptId, statusFilter, priorityFilter, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTokens.length / itemsPerPage));
  const paginatedTokens = filteredTokens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDeptName = (deptId) => {
    const d = departments.find(dept => String(dept.id) === String(deptId) || dept.code === deptId);
    return d ? d.name : deptId;
  };

  const calculateWaitMinutes = (timestamp) => {
    if (!timestamp) return '10m';
    const elapsed = Math.max(1, Math.round((Date.now() - timestamp) / (60 * 1000)));
    return `${elapsed}m`;
  };

  const handleOpenDetail = (token) => {
    setSelectedToken(token);
    setIsDetailOpen(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Token (e.g. GM-104) or Patient Ref..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <label htmlFor="status-filter-select" className="sr-only">Filter by Status</label>
            <select
              id="status-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">⏳ Waiting</option>
              <option value="called">📢 Called</option>
              <option value="in service">🩺 In Service</option>
              <option value="completed">✅ Completed</option>
              <option value="skipped">⏭️ Skipped</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <label htmlFor="priority-filter-select" className="sr-only">Filter by Priority</label>
            <select
              id="priority-filter-select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="priority">⚡ Staff Priority Only</option>
              <option value="normal">Standard Queue</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <label htmlFor="sort-by-select" className="sr-only">Sort Queue</label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="time-asc">Sort: Oldest First</option>
              <option value="time-desc">Sort: Newest First</option>
              <option value="token-asc">Sort: Token #</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table / Mobile Cards */}
      {filteredTokens.length === 0 ? (
        <EmptyState
          title="No Matching Patient Tokens"
          description="No tokens found for the current search or filters in this OPD department."
          actionLabel="Register Walk-in Patient"
          onAction={onRegisterClick}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Token Number</th>
                  <th className="py-3.5 px-4 font-bold">Patient Reference</th>
                  <th className="py-3.5 px-4 font-bold">Department</th>
                  <th className="py-3.5 px-4 font-bold">Reg. Time</th>
                  <th className="py-3.5 px-4 font-bold">Wait Time</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedTokens.map((tok) => {
                  return (
                    <tr
                      key={tok.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Token # */}
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold font-display text-navy-900 dark:text-white">
                            {tok.tokenNumber}
                          </span>
                          {tok.isPriority && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
                              title={`Staff Priority: ${tok.priorityReason}`}
                            >
                              ⚡ Priority
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient Ref */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {tok.patientRef || tok.anonymizedName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {tok.visitType} • {tok.ageGroup}
                          </p>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {getDeptName(tok.departmentId)}
                        </span>
                      </td>

                      {/* Reg Time */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {tok.registrationTime}
                      </td>

                      {/* Wait Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{calculateWaitMinutes(tok.registrationTimestamp)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge variant={tok.status} size="sm">
                          {tok.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tok.status === 'Waiting' && (
                            <button
                              onClick={() => updateTokenStatus(tok.id, 'Called')}
                              className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:hover:bg-teal-900 dark:text-teal-300 font-semibold text-xs flex items-center gap-1 transition-colors"
                              title="Call to Doctor Counter"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Call</span>
                            </button>
                          )}

                          {tok.status === 'Called' && (
                            <>
                              <button
                                onClick={() => updateTokenStatus(tok.id, 'In Service')}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold text-xs flex items-center gap-1"
                                title="Start Consultation"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Start</span>
                              </button>
                              <button
                                onClick={() => updateTokenStatus(tok.id, 'Skipped')}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold text-xs"
                                title="Skip Token"
                              >
                                Skip
                              </button>
                            </>
                          )}

                          {tok.status === 'In Service' && (
                            <button
                              onClick={() => updateTokenStatus(tok.id, 'Completed')}
                              className="p-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs flex items-center gap-1"
                              title="Complete Patient Visit"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}

                          {(tok.status === 'Skipped' || tok.status === 'Cancelled') && (
                            <button
                              onClick={() => updateTokenStatus(tok.id, 'Waiting')}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold text-xs flex items-center gap-1"
                              title="Recall to Queue"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Recall</span>
                            </button>
                          )}

                          {/* Voice Trigger */}
                          <button
                            onClick={() => triggerVoiceAnnouncement(tok.tokenNumber, 1, getDeptName(tok.departmentId))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                            title="Announce via Voice (Malayalam & English)"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Details Modal */}
                          <button
                            onClick={() => handleOpenDetail(tok)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                            title="View Full Token Profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedTokens.map((tok) => (
              <div key={tok.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold font-display text-navy-900 dark:text-white">
                        {tok.tokenNumber}
                      </span>
                      {tok.isPriority && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          ⚡ Priority
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {tok.patientRef || tok.anonymizedName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {getDeptName(tok.departmentId)} • {tok.visitType}
                    </p>
                  </div>

                  <Badge variant={tok.status} size="sm">
                    {tok.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Reg: {tok.registrationTime}</span>
                  <span>Wait: {calculateWaitMinutes(tok.registrationTimestamp)}</span>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => handleOpenDetail(tok)}
                  >
                    Details
                  </Button>

                  {tok.status === 'Waiting' && (
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => updateTokenStatus(tok.id, 'Called')}
                    >
                      Call
                    </Button>
                  )}

                  {tok.status === 'Called' && (
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => updateTokenStatus(tok.id, 'In Service')}
                    >
                      Start
                    </Button>
                  )}

                  {tok.status === 'In Service' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateTokenStatus(tok.id, 'Completed')}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredTokens.length)} of{' '}
              {filteredTokens.length} tokens
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Token Detail Modal */}
      <TokenDetailModal
        token={selectedToken}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedToken(null);
        }}
        onPrintSlip={onPrintSlip}
      />
    </div>
  );
}
