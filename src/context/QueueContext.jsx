import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  apiService,
  initLocalStorageIfEmpty,
  WS_BASE_URL,
  isBackendOnline,
  resolveDepartmentId,
} from '../services/api';

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

  const [isWsConnected, setIsWsConnected] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

  const [toasts, setToasts] = useState([]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [latestCalledToken, setLatestCalledToken] = useState(null);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);

  // -------------------------------------------------------------
  // Toast Helpers
  // -------------------------------------------------------------

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (title, message, type = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`;

      const newToast = {
        id,
        title,
        message,
        type,
      };

      setToasts((prev) => [newToast, ...prev]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // -------------------------------------------------------------
  // Refresh Queue Data
  // -------------------------------------------------------------

  const refreshData = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true);
      }

      initLocalStorageIfEmpty();

      try {
        const [deptsData, tokensData, flagsData] = await Promise.all([
          apiService.getDepartments(),

          apiService.getQueue(
            selectedDeptId === 'all' ? 'all' : selectedDeptId
          ),

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
          addToast(
            'Sync Error',
            'Failed to synchronize with hospital service layer.',
            'error'
          );
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [selectedDeptId, addToast]
  );

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // -------------------------------------------------------------
  // WebSocket Connection
  // -------------------------------------------------------------

  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {
        // Ignore close errors
      }
    }

    const deptChannel =
      selectedDeptId === 'all' ? 'all' : selectedDeptId;

    const wsUrl = `${WS_BASE_URL}/queue/${deptChannel}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
        setBackendAvailable(true);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

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
              `Token ${payload.data?.token_number || ''} added to queue.`,
              'info'
            );
          } else if (payload.event === 'TOKEN_CALLED') {
            const calledTokenNum = payload.data?.token_number;
            const counterNum = payload.data?.counter_number || 1;
            const deptId = payload.department_id;

            const deptObj =
              departments.find(
                (department) =>
                  String(department.id) === String(deptId) ||
                  department.code === String(deptId)
              ) || departments[0] || { id: deptId, name: 'General Medicine', code: 'GM' };

            const tokenObj = {
              id: payload.data?.id || `tok-${Date.now()}`,
              tokenNumber: calledTokenNum,
              counterNumber: counterNum,
              counterServed: `Counter ${counterNum}`,
              departmentId: deptObj.id || deptId || 1,
              departmentName: deptObj.name || 'General Medicine',
              departmentCode: deptObj.code || 'GM',
              status: 'Called',
              rawStatus: 'CALLED',
              isPriority: Boolean(payload.data?.is_priority),
              calledTime: payload.data?.called_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setLatestCalledToken(tokenObj);

            // Update in-memory tokens immediately for real-time TV and Dashboard response
            setTokens((prev) => {
              const exists = prev.some((t) => t.tokenNumber === calledTokenNum);
              if (exists) {
                return prev.map((t) =>
                  t.tokenNumber === calledTokenNum
                    ? { ...t, status: 'Called', rawStatus: 'CALLED', counterNumber: counterNum, counterServed: `Counter ${counterNum}` }
                    : (t.departmentId === tokenObj.departmentId && t.status === 'Called' ? { ...t, status: 'In Service', rawStatus: 'IN_SERVICE' } : t)
                );
              }
              return [tokenObj, ...prev];
            });

            refreshData(true);

            if (settings.autoAnnounceOnCall) {
              announceToken({
                tokenNumber: calledTokenNum,
                counterNumber: counterNum,
                departmentName:
                  deptObj?.name || 'General Medicine',
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
          } else if (
            payload.event === 'TOKEN_STATUS_UPDATED' ||
            payload.event === 'QUEUE_UPDATED'
          ) {
            refreshData(true);
          }
        } catch (err) {
          console.warn('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      ws.onerror = () => {
        setIsWsConnected(false);
        ws.close();
      };
    } catch (err) {
      console.warn(
        'WebSocket connection attempt failed:',
        err
      );

      setIsWsConnected(false);
    }
  }, [
    selectedDeptId,
    departments,
    settings,
    refreshData,
    addToast,
  ]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      refreshData(true);
    }, isWsConnected ? 20000 : 8000);

    return () => clearInterval(pollInterval);
  }, [isWsConnected, refreshData]);

  // -------------------------------------------------------------
  // 1. Register Patient
  // -------------------------------------------------------------

  const registerPatient = async (patientPayload) => {
    try {
      const rawDept =
        patientPayload.department_id ??
        patientPayload.departmentId;

      const departmentId = resolveDepartmentId(rawDept, departments);

      const safePayload = {
        ...patientPayload,
        departmentId: departmentId,
        department_id: departmentId,
      };

      console.log(
        'QueueContext final registration payload:',
        safePayload
      );

      console.log(
        'Department ID:',
        safePayload.department_id,
        'Type:',
        typeof safePayload.department_id
      );

      const token = await apiService.registerPatient(safePayload);

      setTokens((prev) => [
        token,
        ...prev.filter((item) => item.id !== token.id),
      ]);

      if (token.isPriority) {
        const updatedFlags =
          await apiService.getPriorityFlags();

        setPriorityFlags(updatedFlags);
      }

      addToast(
        'Token Generated',
        `Assigned ${token.tokenNumber
        } to ${token.patientRef || token.anonymizedName
        } in ${token.departmentCode
        }`,
        'success'
      );

      return {
        success: true,
        token,
      };
    } catch (err) {
      console.error('Registration failed:', err);

      addToast(
        'Registration Failed',
        err.message || 'Could not register patient.',
        'error'
      );

      return {
        success: false,
        error: err.message,
      };
    }
  };

  // -------------------------------------------------------------
  // 2. Call Next Token
  // -------------------------------------------------------------

  const callNextToken = async (
    deptId,
    counterNumber = 1,
    staffName
  ) => {
    try {
      const targetDeptId =
        deptId || selectedDeptId || 1;

      const result = await apiService.callNextToken(
        targetDeptId,
        counterNumber,
        staffName || currentUser?.name || 'Doctor'
      );

      if (!result.success) {
        addToast(
          'Queue Status',
          result.message ||
          'The queue for this department is currently clear.',
          'info'
        );

        return result;
      }

      const token = result.token;

      setTokens((prev) =>
        prev.map((item) =>
          item.id === token.id ? token : item
        )
      );

      setLatestCalledToken(token);

      const targetDept =
        departments.find(
          (department) =>
            String(department.id) === String(targetDeptId) ||
            department.code === targetDeptId
        ) || { name: 'General Medicine' };

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

      return {
        success: true,
        token,
      };
    } catch (err) {
      console.error('Call Next failed:', err);

      addToast(
        'Operation Error',
        err.message || 'Could not call next token.',
        'error'
      );

      return {
        success: false,
        error: err.message,
      };
    }
  };

  // -------------------------------------------------------------
  // 3. Update Token Status
  // -------------------------------------------------------------

  const updateTokenStatus = async (
    tokenId,
    newStatus,
    metadata = {}
  ) => {
    try {
      const result = await apiService.updateTokenStatus(
        tokenId,
        newStatus,
        metadata
      );

      if (result.success) {
        setTokens((prev) =>
          prev.map((token) =>
            token.id === tokenId ? result.token : token
          )
        );

        addToast(
          'Status Updated',
          `Token ${result.token.tokenNumber} marked as ${newStatus}`,
          'info'
        );
      }

      return result;
    } catch (err) {
      console.error('Status update failed:', err);

      addToast(
        'Update Failed',
        err.message || 'Could not update token status.',
        'error'
      );

      return {
        success: false,
        error: err.message,
      };
    }
  };

  // -------------------------------------------------------------
  // 4. Update Priority Flag
  // -------------------------------------------------------------

  const updatePriorityFlag = async (
    flagId,
    updatePayload
  ) => {
    try {
      const result = await apiService.updatePriorityFlag(
        flagId,
        {
          ...updatePayload,
          user: currentUser?.name || 'Medical Officer',
        }
      );

      if (result.success) {
        setPriorityFlags((prev) =>
          prev.map((flag) =>
            flag.id === flagId ? result.flag : flag
          )
        );

        addToast(
          'Priority Review Updated',
          `Case ${result.flag.tokenNumber
          }: ${updatePayload.action ||
          'Audit record updated'
          }`,
          'success'
        );
      }

      return result;
    } catch (err) {
      console.error('Priority update failed:', err);

      addToast(
        'Audit Error',
        err.message || 'Could not update priority record.',
        'error'
      );

      return {
        success: false,
        error: err.message,
      };
    }
  };

  // -------------------------------------------------------------
  // 5. Update Department Counters
  // -------------------------------------------------------------

  const updateDepartmentCounters = async (
    deptId,
    newCounters
  ) => {
    const activeCount = newCounters.filter(
      (counter) => counter.status !== 'offline'
    ).length;

    try {
      await apiService.updateDepartment(deptId, {
        activeCounters: activeCount,
        counters: newCounters,
      });

      setDepartments((prev) =>
        prev.map((department) =>
          department.id === deptId
            ? {
              ...department,
              counters: newCounters,
              activeCounters: activeCount,
            }
            : department
        )
      );

      addToast(
        'Counters Updated',
        'Department counter staffing configuration saved.',
        'info'
      );
    } catch (err) {
      console.error(
        'Failed to update counters:',
        err
      );
    }
  };

  // -------------------------------------------------------------
  // 6. Manual Voice Announcement
  // -------------------------------------------------------------

  const triggerVoiceAnnouncement = (
    tokenNumber,
    counterNumber = 1,
    deptName = 'OPD'
  ) => {
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

  // -------------------------------------------------------------
  // 7. Reset Demo Data
  // -------------------------------------------------------------

  const resetDemo = async () => {
    apiService.resetDemoData();
    await refreshData();

    addToast(
      'Demo Reset',
      'System reloaded with default sample dataset.',
      'info'
    );
  };

  // -------------------------------------------------------------
  // 8. Simulated Patient Arrival
  // -------------------------------------------------------------

  const simulateArrival = async () => {
    const depts =
      departments.length > 0
        ? departments
        : [
          {
            id: 1,
            code: 'GM',
            name: 'General Medicine',
          },
        ];

    const randomDept =
      depts[Math.floor(Math.random() * depts.length)];

    const ageGroups = [
      'Adult (18-59)',
      'Senior Citizen (60+)',
      'Pediatric (< 12)',
      'Super Senior (75+)',
    ];

    const randomAge =
      ageGroups[
      Math.floor(Math.random() * ageGroups.length)
      ];

    const isPri = Math.random() > 0.8;

    await registerPatient({
      departmentId: Number(randomDept.id),
      patientRef: `REF-${Math.floor(
        2000 + Math.random() * 7000
      )} (Simulated Intake)`,
      anonymizedName: `Patient #${Math.floor(
        100 + Math.random() * 900
      )}`,
      ageGroup: randomAge,
      visitType: 'Walk-in OPD',
      isPriority: isPri,
      priorityReason: isPri
        ? 'Assisted Walk-in Protocol (Simulated)'
        : null,
      priorityStaffNote: isPri
        ? 'Triage verification auto-assigned during simulation.'
        : null,
      priorityVerifiedBy:
        'Sister Bindu (Staff Nurse - ID #412)',
      accessibilityNeeds: randomAge.includes('Senior')
        ? ['Malayalam Voice Prompt']
        : [],
    });
  };

  // -------------------------------------------------------------
  // Simulation Interval
  // -------------------------------------------------------------

  useEffect(() => {
    if (!isSimulating) {
      return;
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.45) {
        simulateArrival();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isSimulating, departments]);

  // -------------------------------------------------------------
  // Context Provider
  // -------------------------------------------------------------

  return (
    <QueueContext.Provider
      value={{
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
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export const useQueue = () => useContext(QueueContext);
