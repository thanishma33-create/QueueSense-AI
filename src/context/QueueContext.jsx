import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService, initLocalStorageIfEmpty, WS_BASE_URL, isBackendOnline } from '../services/api';
import { announceToken } from '../services/voiceService';
import { useSettings } from './SettingsContext';
import { useAuth } from './AuthContext';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const { settings } = useSettings();
  const { currentUser } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [priorityFlags, setPriorityFlags] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Connection & real-time states
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Toast notifications array
  const [toasts, setToasts] = useState([]);

  // Live simulation & audio states
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [latestCalledToken, setLatestCalledToken] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);

  // Refresh all queue state from API
  const refreshData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    initLocalStorageIfEmpty();
    try {
      const [deptsData, tokensData, flagsData] = await Promise.all([
        apiService.getDepartments(),
        apiService.getQueue(selectedDeptId === 'all' ? 'all' : selectedDeptId),
        apiService.getPriorityFlags(),
      ]);
      setDepartments(deptsData);
      setTokens(tokensData);
      setPriorityFlags(flagsData);
      setLastRefreshed(new Date());
      setBackendAvailable(isBackendOnline());
    } catch (err) {
      console.error('Failed to load queue data:', err);
      setBackendAvailable(false);
      if (!silent) {
        addToast('Sync Error', 'Failed to synchronize with hospital service layer.', 'error');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [selectedDeptId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Toast Helpers
  const addToast = (title, message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, title, message, type };
    setToasts(prev => [newToast, ...prev]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // -------------------------------------------------------------
  // WebSocket Connection & Real-time Event Handling
  // -------------------------------------------------------------
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {
        // ignore
      }
    }

    const deptChannel = selectedDeptId === 'all' ? 'all' : selectedDeptId;
    const wsUrl = `${WS_BASE_URL}/queue/${deptChannel}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
        setBackendAvailable(true);

        // Keepalive heartbeat ping
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.event === 'PATIENT_REGISTERED') {
            refreshData(true);
            addToast(
              'New Patient Registered',
              `Token ${payload.data.token_number} added to queue.`,
              'info'
            );
          } else if (payload.event === 'TOKEN_CALLED') {
            refreshData(true);
            const calledTokenNum = payload.data.token_number;
            const counterNum = payload.data.counter_number || 1;

            // Voice announcement trigger
            if (settings.autoAnnounceOnCall) {
              const deptObj = departments.find(d => String(d.id) === String(payload.department_id)) || departments[0];
              announceToken({
                tokenNumber: calledTokenNum,
                counterNumber: counterNum,
                departmentName: deptObj?.name || 'General Medicine',
                language: settings.defaultLanguage,
                rate: settings.speechRate,
                pitch: settings.speechPitch,
                volume: settings.speechVolume,
                onStart: () => setIsSpeaking(true),
                onEnd: () => setIsSpeaking(false),
              });
            }

            addToast(
              'Calling Patient',
              `Now calling ${calledTokenNum} to Counter ${counterNum}`,
              'info'
            );
          } else if (payload.event === 'TOKEN_STATUS_UPDATED' || payload.event === 'QUEUE_UPDATED') {
            refreshData(true);
          }
        } catch (err) {
          console.warn('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Attempt reconnection after delay
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      ws.onerror = (e) => {
        setIsWsConnected(false);
        ws.close();
      };
    } catch (err) {
      console.warn('WebSocket connection attempt failed:', err);
      setIsWsConnected(false);
    }
  }, [selectedDeptId, departments, settings, refreshData]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [connectWebSocket]);

  // Periodic REST Polling Fallback (if WebSocket is disconnected)
  useEffect(() => {
    if (isWsConnected) return;

    const pollInterval = setInterval(() => {
      refreshData(true);
    }, 12000);

    return () => clearInterval(pollInterval);
  }, [isWsConnected, refreshData]);

  // -------------------------------------------------------------
  // Public Actions
  // -------------------------------------------------------------

  // 1. Register Patient Action
  const registerPatient = async (patientPayload) => {
    try {
      const token = await apiService.registerPatient(patientPayload);
      setTokens(prev => [token, ...prev.filter(t => t.id !== token.id)]);

      if (token.isPriority) {
        const updatedFlags = await apiService.getPriorityFlags();
        setPriorityFlags(updatedFlags);
      }

      addToast(
        'Token Generated',
        `Assigned ${token.tokenNumber} to ${token.patientRef || token.anonymizedName} in ${token.departmentCode}`,
        'success'
      );
      return { success: true, token };
    } catch (err) {
      console.error('Registration failed:', err);
      addToast('Registration Failed', err.message || 'Could not register patient.', 'error');
      return { success: false, error: err.message };
    }
  };

  // 2. Call Next Token Action
  const callNextToken = async (deptId, counterNumber = 1, staffName) => {
    try {
      const targetDeptId = deptId || selectedDeptId || 1;
      const result = await apiService.callNextToken(
        targetDeptId,
        counterNumber,
        staffName || currentUser?.name || 'Doctor'
      );

      if (!result.success) {
        addToast('Queue Status', result.message || 'The queue for this department is currently clear.', 'info');
        return result;
      }

      const token = result.token;
      setTokens(prev => prev.map(t => (t.id === token.id ? token : t)));
      setLatestCalledToken(token);

      const targetDept = departments.find(d => String(d.id) === String(targetDeptId) || d.code === targetDeptId) || { name: 'General Medicine' };

      // Voice Announcement trigger
      if (settings.autoAnnounceOnCall) {
        announceToken({
          tokenNumber: token.tokenNumber,
          counterNumber: counterNumber,
          departmentName: targetDept.name,
          language: settings.defaultLanguage,
          rate: settings.speechRate,
          pitch: settings.speechPitch,
          volume: settings.speechVolume,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
        });
      }

      addToast(
        'Calling Token',
        `Now calling ${token.tokenNumber} to Counter ${counterNumber}`,
        'info'
      );

      return { success: true, token };
    } catch (err) {
      console.error('Call Next failed:', err);
      addToast('Operation Error', err.message || 'Could not call next token.', 'error');
      return { success: false, error: err.message };
    }
  };

  // 3. Update Token Status Action
  const updateTokenStatus = async (tokenId, newStatus, metadata = {}) => {
    try {
      const result = await apiService.updateTokenStatus(tokenId, newStatus, metadata);
      if (result.success) {
        setTokens(prev => prev.map(t => (t.id === tokenId ? result.token : t)));
        addToast(
          'Status Updated',
          `Token ${result.token.tokenNumber} marked as ${newStatus}`,
          'info'
        );
      }
      return result;
    } catch (err) {
      console.error('Status update failed:', err);
      addToast('Update Failed', err.message || 'Could not update token status.', 'error');
      return { success: false, error: err.message };
    }
  };

  // 4. Update Priority Flag & Audit Log
  const updatePriorityFlag = async (flagId, updatePayload) => {
    try {
      const result = await apiService.updatePriorityFlag(flagId, {
        ...updatePayload,
        user: currentUser?.name || 'Medical Officer',
      });
      if (result.success) {
        setPriorityFlags(prev => prev.map(f => (f.id === flagId ? result.flag : f)));
        addToast(
          'Priority Review Updated',
          `Case ${result.flag.tokenNumber}: ${updatePayload.action || 'Audit record updated'}`,
          'success'
        );
      }
      return result;
    } catch (err) {
      console.error('Priority update failed:', err);
      addToast('Audit Error', err.message || 'Could not update priority record.', 'error');
      return { success: false, error: err.message };
    }
  };

  // 5. Update Department Counter Status
  const updateDepartmentCounters = async (deptId, newCounters) => {
    const activeCount = newCounters.filter(c => c.status !== 'offline').length;
    try {
      await apiService.updateDepartment(deptId, {
        activeCounters: activeCount,
        counters: newCounters,
      });
      setDepartments(prev =>
        prev.map(d => (d.id === deptId ? { ...d, counters: newCounters, activeCounters: activeCount } : d))
      );
      addToast('Counters Updated', 'Department counter staffing configuration saved.', 'info');
    } catch (err) {
      console.error('Failed to update counters:', err);
    }
  };

  // 6. Manual Voice Trigger
  const triggerVoiceAnnouncement = (tokenNumber, counterNumber = 1, deptName = 'OPD') => {
    announceToken({
      tokenNumber,
      counterNumber,
      departmentName: deptName,
      language: settings.defaultLanguage,
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      volume: settings.speechVolume,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  // 7. Reset Demo Data
  const resetDemo = async () => {
    apiService.resetDemoData();
    await refreshData();
    addToast('Demo Reset', 'System reloaded with default sample dataset.', 'info');
  };

  // 8. Simulated Live Arrival
  const simulateArrival = async () => {
    const depts = departments.length > 0 ? departments : [{ id: 1, code: 'GM', name: 'General Medicine' }];
    const randomDept = depts[Math.floor(Math.random() * depts.length)];
    const ageGroups = ['Adult (18-59)', 'Senior Citizen (60+)', 'Pediatric (< 12)', 'Super Senior (75+)'];
    const randomAge = ageGroups[Math.floor(Math.random() * ageGroups.length)];
    const isPri = Math.random() > 0.8;

    await registerPatient({
      departmentId: randomDept.id,
      patientRef: `REF-${Math.floor(2000 + Math.random() * 7000)} (Simulated Intake)`,
      anonymizedName: `Patient #${Math.floor(100 + Math.random() * 900)}`,
      ageGroup: randomAge,
      visitType: 'Walk-in OPD',
      isPriority: isPri,
      priorityReason: isPri ? 'Assisted Walk-in Protocol (Simulated)' : null,
      priorityStaffNote: isPri ? 'Triage verification auto-assigned during simulation.' : null,
      priorityVerifiedBy: 'Sister Bindu (Staff Nurse - ID #412)',
      accessibilityNeeds: randomAge.includes('Senior') ? ['Malayalam Voice Prompt'] : [],
    });
  };

  // Simulation Interval Handler
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.45) {
        simulateArrival();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isSimulating, departments]);

  return (
    <QueueContext.Provider value={{
      departments,
      tokens,
      priorityFlags,
      selectedDeptId,
      setSelectedDeptId,
      isLoading,
      lastRefreshed,
      isWsConnected,
      backendAvailable,
      toasts,
      addToast,
      removeToast,
      refreshData,
      registerPatient,
      callNextToken,
      updateTokenStatus,
      updatePriorityFlag,
      updateDepartmentCounters,
      triggerVoiceAnnouncement,
      resetDemo,
      isSimulating,
      setIsSimulating,
      simulateArrival,
      isSpeaking,
      latestCalledToken,
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export const useQueue = () => useContext(QueueContext);
