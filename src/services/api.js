/**
 * QueueSense AI — Unified API Service Layer
 * 
 * Bridges React Frontend to FastAPI Backend:
 * - Reads VITE_API_BASE_URL (defaults to http://localhost:8000)
 * - Automatically attaches JWT Bearer token from localStorage
 * - Seamlessly normalizes backend schemas <-> frontend components
 * - Provides graceful fallback to mock data if backend is offline or VITE_DEMO_MODE=true
 */

import {
  INITIAL_DEPARTMENTS,
  INITIAL_TOKENS,
  INITIAL_PRIORITY_FLAGS,
  HOURLY_ANALYTICS_DATA,
  WEEKLY_TREND_DATA,
  DEPARTMENT_COMPARISON_DATA,
  DEMO_USERS,
} from './mockData';

import { calculateWaitingTimeEstimate } from './estimationEngine';

// Resolve Base URL (e.g. http://localhost:8000/api)
const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '').endsWith('/api')
  ? RAW_API_URL.replace(/\/+$/, '')
  : `${RAW_API_URL.replace(/\/+$/, '')}/api`;

export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
  RAW_API_URL.replace(/^http/, 'ws').replace(/\/+$/, '') + '/ws';

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const STORAGE_KEYS = {
  TOKEN: 'queuesense_token',
  AUTH_USER: 'queuesense_auth_user',
  DEPARTMENTS: 'queuesense_departments_v1',
  TOKENS: 'queuesense_tokens_v1',
  PRIORITY_FLAGS: 'queuesense_priority_flags_v1',
  ANALYTICS: 'queuesense_analytics_v1',
};

// Global state tracking whether backend is reachable
let backendReachable = true;

export function isBackendOnline() {
  return backendReachable && !IS_DEMO_MODE;
}

// Token helper
export function getAuthToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  } catch (e) {
    console.error('Error setting auth token:', e);
  }
}

// LocalStorage helpers for offline demo fallback
function loadStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export function initLocalStorageIfEmpty() {
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    saveStorage(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TOKENS)) {
    saveStorage(STORAGE_KEYS.TOKENS, INITIAL_TOKENS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRIORITY_FLAGS)) {
    saveStorage(STORAGE_KEYS.PRIORITY_FLAGS, INITIAL_PRIORITY_FLAGS);
  }
}

// Standardized HTTP Request Wrapper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
  config.signal = controller.signal;

  try {
    const res = await fetch(url, config);
    clearTimeout(timeoutId);
    backendReachable = true;

    if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }
      const errorMsg = errorData?.detail || errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = errorData;
      throw err;
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`Request to ${url} timed out.`);
    } else if (!err.status) {
      // Network failure / server offline
      backendReachable = false;
      console.warn(`Backend unreachable at ${url}:`, err.message);
    }
    throw err;
  }
}

// Status Normalizers
function normalizeStatusToFrontend(backendStatus) {
  if (!backendStatus) return 'Waiting';
  const s = backendStatus.toUpperCase();
  switch (s) {
    case 'WAITING': return 'Waiting';
    case 'CALLED': return 'Called';
    case 'IN_SERVICE': return 'In Service';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    case 'NO_SHOW':
    case 'SKIPPED': return 'Skipped';
    default: return backendStatus;
  }
}

function normalizeStatusToBackend(frontendStatus) {
  if (!frontendStatus) return 'WAITING';
  const s = frontendStatus.toLowerCase();
  switch (s) {
    case 'waiting': return 'WAITING';
    case 'called': return 'CALLED';
    case 'in service':
    case 'in_service':
    case 'inservice': return 'IN_SERVICE';
    case 'completed': return 'COMPLETED';
    case 'cancelled':
    case 'canceled': return 'CANCELLED';
    case 'skipped':
    case 'no_show':
    case 'no show': return 'NO_SHOW';
    default: return frontendStatus.toUpperCase();
  }
}

// Department Data Adapter
function adaptDepartment(dept) {
  if (!dept) return null;
  return {
    id: dept.id,
    numericId: dept.id,
    name: dept.name,
    code: dept.code,
    malayalamName: dept.malayalam_name || dept.malayalamName || dept.name,
    location: dept.location || 'OPD Block',
    activeCounters: dept.active_counters ?? dept.activeCounters ?? 1,
    totalCounters: dept.total_counters ?? dept.totalCounters ?? 2,
    avgServiceTimeMinutes: dept.average_service_duration ?? dept.avgServiceTimeMinutes ?? 8.0,
    color: dept.color || 'teal',
    isActive: dept.is_active ?? dept.isActive ?? true,
    waitingCount: dept.waiting_count ?? dept.waitingCount ?? 0,
    inServiceCount: dept.in_service_count ?? dept.inServiceCount ?? 0,
    counters: (dept.counters || []).map(c => ({
      id: c.id || `${dept.code?.toLowerCase() || 'dept'}-c${c.number || 1}`,
      number: c.number || 1,
      doctor: c.doctor || `Counter ${c.number || 1} Staff`,
      status: c.status || 'available',
      currentToken: c.current_token || c.currentToken || null,
    })),
    createdAt: dept.created_at || dept.createdAt,
  };
}

// Token Data Adapter
function adaptToken(token) {
  if (!token) return null;
  
  let regTimestamp = Date.now();
  if (token.registration_time) {
    const parsed = Date.parse(token.registration_time);
    if (!isNaN(parsed)) regTimestamp = parsed;
  }

  let accNeeds = [];
  if (Array.isArray(token.accessibility_needs)) {
    accNeeds = token.accessibility_needs;
  } else if (Array.isArray(token.accessibilityNeeds)) {
    accNeeds = token.accessibilityNeeds;
  }

  return {
    id: token.id,
    tokenNumber: token.token_number || token.tokenNumber || `T-${token.id}`,
    patientId: token.patient_id || token.patientId,
    departmentId: token.department_id || token.departmentId,
    departmentName: token.department_name || token.departmentName || 'General Medicine',
    departmentCode: token.department_code || token.departmentCode || 'GM',
    status: normalizeStatusToFrontend(token.status),
    rawStatus: token.status,
    counterNumber: token.counter_number || token.counterNumber || null,
    counterServed: token.counter_served || token.counterServed || (token.counter_number ? `Counter ${token.counter_number}` : null),
    isPriority: Boolean(token.is_priority ?? token.isPriority),
    priorityReason: token.priority_reason || token.priorityReason || null,
    patientRef: token.patient_ref || token.patient_reference || token.patientRef || `Patient #${token.id || 101}`,
    anonymizedName: token.anonymized_name || token.anonymizedName || token.patient_ref || `Patient #${token.id || 101}`,
    ageGroup: token.age_group || token.ageGroup || 'Adult (18-59)',
    visitType: token.visit_type || token.visitType || 'Walk-in OPD',
    accessibilityNeeds: accNeeds,
    registrationTime: token.registration_time || token.registrationTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    registrationTimestamp: token.registrationTimestamp || regTimestamp,
    calledTime: token.called_time || token.calledTime || null,
    calledAt: token.called_time || token.calledAt || null,
    serviceStartTime: token.service_start_time || token.serviceStartTime || null,
    completionTime: token.completion_time || token.completionTime || null,
    completedAt: token.completion_time || token.completedAt || null,
    serviceDurationMinutes: token.service_duration_minutes ?? token.serviceDurationMinutes ?? null,
    estimatedWaitMinutes: token.estimated_wait_minutes ?? token.estimatedWaitMinutes ?? 10,
  };
}

// Priority Flag Data Adapter
function adaptPriorityFlag(flag) {
  if (!flag) return null;
  return {
    id: flag.id,
    tokenId: flag.token_id || flag.tokenId,
    tokenNumber: flag.token_number || flag.tokenNumber,
    departmentId: flag.department_id || flag.departmentId,
    departmentName: flag.department_name || flag.departmentName || 'General Medicine',
    patientRef: flag.patient_ref || flag.patientRef,
    ageGroup: flag.age_group || flag.ageGroup || 'Adult (18-59)',
    reason: flag.reason,
    staffNote: flag.staff_note || flag.staffNote || 'Clinical triage verification',
    reviewer: flag.reviewer || 'Medical Officer',
    timestamp: flag.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: (flag.status === 'ACCEPTED' || flag.status === 'Confirmed') ? 'Confirmed' 
          : (flag.status === 'REJECTED' || flag.status === 'Overridden') ? 'Overridden' 
          : 'Pending',
    rawStatus: flag.status,
    auditLog: (flag.audit_log || flag.auditLog || []).map(entry => ({
      action: entry.action,
      user: entry.user || entry.reviewer || 'Staff',
      time: entry.time || entry.timestamp || '',
      note: entry.note || entry.notes || '',
    })),
  };
}

// Waiting Time Estimate Adapter
function adaptWaitingTimeEstimate(data, deptObj = null) {
  if (!data) return null;
  const minW = data.range?.minimum ?? Math.max(2, (data.estimated_wait_minutes || 10) - 4);
  const maxW = data.range?.maximum ?? ((data.estimated_wait_minutes || 10) + 6);

  // Generate explainable factor cards
  const factorsList = (data.factors || []).map((fStr, index) => {
    let title = 'Queue Flow Parameter';
    let weight = '+3m impact';
    let impact = 'Moderate';
    let value = fStr;

    if (fStr.toLowerCase().includes('waiting')) {
      title = 'Waiting Patients Ahead';
      weight = 'Primary (45%)';
      impact = 'Direct linear load';
    } else if (fStr.toLowerCase().includes('counter')) {
      title = 'Active Service Counters';
      weight = 'Throughput Divisor';
      impact = 'Parallel service speed';
    } else if (fStr.toLowerCase().includes('consult') || fStr.toLowerCase().includes('duration')) {
      title = 'Average Consult Duration';
      weight = 'Historical Average';
      impact = 'Per-patient duration';
    } else if (fStr.toLowerCase().includes('peak') || fStr.toLowerCase().includes('rush')) {
      title = 'Peak Rush Adjustment';
      weight = 'Surge Factor';
      impact = 'Morning inflow buffer';
    } else if (fStr.toLowerCase().includes('priority') || fStr.toLowerCase().includes('specialty')) {
      title = 'Specialty Case Complexity';
      weight = 'Triage Allocation';
      impact = 'Priority scheduling';
    }

    return {
      title,
      weight,
      value: fStr,
      impact,
      description: `Factor evaluated during queue model computation: ${fStr}`
    };
  });

  return {
    departmentId: data.department_id,
    departmentName: data.department_name || deptObj?.name || 'Department',
    departmentCode: data.department_code || deptObj?.code || 'OPD',
    activeCounters: data.active_counters ?? deptObj?.activeCounters ?? 2,
    waitingCount: data.waiting_count ?? 0,
    estimatedWaitMinutes: data.estimated_wait_minutes,
    minWaitMinutes: minW,
    maxWaitMinutes: maxW,
    displayRange: `${minW} – ${maxW} mins`,
    uncertainty: data.uncertainty || 'LOW',
    confidenceScore: data.confidence_score || 92,
    congestionLevel: data.congestion_level || 'Low',
    congestionBadge: data.congestion_badge || (data.congestion_level === 'High' ? 'High Congestion' : 'Smooth Flow'),
    operationalAdvice: data.operational_advice || 'Queue flow is within normal parameters.',
    lastUpdated: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    explainableFactors: factorsList.length > 0 ? factorsList : [
      {
        title: 'Waiting Patients Ahead',
        weight: 'Primary (45%)',
        value: `${data.waiting_count || 0} patients`,
        impact: 'Direct Queue Depth',
        description: 'Number of active waiting ticket holders registered in this OPD queue.',
      },
      {
        title: 'Active Service Counters',
        weight: 'Throughput (35%)',
        value: `${data.active_counters || 1} counters online`,
        impact: 'Parallel Clearance',
        description: 'Staffed consultation stations actively processing incoming patients.',
      }
    ],
    method: data.method || 'Transparent Baseline Heuristic Flow Model',
  };
}

// Analytics Adapter
function adaptAnalytics(overview) {
  if (!overview) return null;

  const summary = overview.summary || {};
  const hourly = (overview.hourly_trend || []).map(h => ({
    hour: h.hour,
    avgWaitMinutes: h.avg_wait_minutes ?? h.avgWaitMinutes ?? 0,
    congestionIndex: h.congestion_index ?? h.congestionIndex ?? 0,
    patientsArrived: h.patients_arrived ?? h.patientsArrived ?? 0,
    patientsServed: h.patients_served ?? h.patientsServed ?? 0,
    skippedTokens: h.skipped_tokens ?? h.skippedTokens ?? 0,
  }));

  const depts = (overview.department_breakdown || []).map(d => ({
    department: d.department,
    code: d.code,
    activeCounters: d.active_counters ?? d.activeCounters ?? 1,
    totalTokens: d.total_tokens ?? d.totalTokens ?? 0,
    waitingCount: d.waiting_count ?? d.waitingCount ?? 0,
    completedToday: d.completed_today ?? d.completedToday ?? 0,
    avgWaitMin: d.avg_wait_minutes ?? d.avgWaitMin ?? 0,
    congestion: d.congestion || 'Low',
  }));

  return {
    summary: {
      totalServedToday: summary.completed_today ?? summary.totalServedToday ?? 0,
      totalRegistered: summary.total_registered ?? 0,
      waitingCount: summary.waiting_count ?? 0,
      inServiceCount: summary.in_service_count ?? 0,
      avgWaitOverallMinutes: summary.avg_wait_overall_minutes ?? summary.avgWaitOverallMinutes ?? 18.5,
      avgServiceDurationMinutes: summary.avg_service_duration_minutes ?? 7.5,
      peakCongestionHour: summary.peak_congestion_hour || '10:00 AM – 11:30 AM',
      retentionRate: summary.retention_rate || '96.8%',
      skippedTokenRate: '3.2%',
    },
    hourlyTrend: hourly.length > 0 ? hourly : HOURLY_ANALYTICS_DATA,
    weeklyTrend: WEEKLY_TREND_DATA,
    departmentComparison: depts.length > 0 ? depts : DEPARTMENT_COMPARISON_DATA,
    timestamp: overview.timestamp || new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// Core API Service Object
// -------------------------------------------------------------
export const apiService = {
  // 0. Health Check
  async checkHealth() {
    if (!IS_DEMO_MODE) {
      try {
        const res = await request('/');
        return { online: true, ...res };
      } catch (e) {
        backendReachable = false;
        return { online: false, error: e.message };
      }
    }
    return { online: false, mode: 'demo' };
  },

  // 1. Auth: Login
  async login(email, password) {
    if (!IS_DEMO_MODE) {
      try {
        const data = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (data.access_token) {
          setAuthToken(data.access_token);
        }
        return {
          success: true,
          token: data.access_token,
          user: {
            id: data.user_id,
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department,
            roleName: data.role === 'doctor' ? 'Doctor / Counter Staff' : data.role === 'admin' ? 'Hospital Administrator' : 'Reception & Triage Staff',
          }
        };
      } catch (err) {
        if (err.status === 401 || err.status === 400) {
          throw err;
        }
        console.warn('Backend login failed, checking demo accounts:', err.message);
      }
    }

    // Demo fallback: match against DEMO_USERS
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && (password === 'password123' || password === 'demo' || !password)) {
      setAuthToken('demo-jwt-token-fallback');
      return {
        success: true,
        token: 'demo-jwt-token-fallback',
        user: found
      };
    }
    throw new Error('Incorrect email or password.');
  },

  // 1.1 Auth: Get Current User Profile
  async getCurrentUser() {
    if (!IS_DEMO_MODE && getAuthToken()) {
      try {
        const user = await request('/auth/me');
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          roleName: user.role === 'doctor' ? 'Doctor / Counter Staff' : user.role === 'admin' ? 'Hospital Administrator' : 'Reception & Triage Staff',
        };
      } catch (e) {
        console.warn('Failed to fetch /auth/me, clearing token:', e);
        setAuthToken(null);
      }
    }
    return null;
  },

  // 2. Departments: List
  async getDepartments() {
    if (!IS_DEMO_MODE) {
      try {
        const depts = await request('/departments');
        if (Array.isArray(depts) && depts.length > 0) {
          return depts.map(adaptDepartment);
        }
      } catch (e) {
        console.warn('Backend /departments unreachable, using fallback storage:', e.message);
      }
    }
    initLocalStorageIfEmpty();
    return loadStorage(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS).map(adaptDepartment);
  },

  // 2.1 Departments: Get by ID
  async getDepartmentById(departmentId) {
    if (!IS_DEMO_MODE) {
      try {
        const dept = await request(`/departments/${departmentId}`);
        return adaptDepartment(dept);
      } catch (e) {
        console.warn(`Backend /departments/${departmentId} unreachable:`, e.message);
      }
    }
    const depts = await this.getDepartments();
    return depts.find(d => d.id === departmentId || d.code === departmentId) || depts[0];
  },

  // 2.2 Departments: Update Config (e.g. active counters)
  async updateDepartment(departmentId, updateData) {
    if (!IS_DEMO_MODE) {
      try {
        const payload = {
          name: updateData.name,
          active_counters: updateData.activeCounters ?? updateData.active_counters,
          total_counters: updateData.totalCounters ?? updateData.total_counters,
          average_service_duration: updateData.avgServiceTimeMinutes ?? updateData.average_service_duration,
          is_active: updateData.isActive ?? updateData.is_active,
        };
        const updated = await request(`/departments/${departmentId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        return adaptDepartment(updated);
      } catch (e) {
        console.warn(`Backend PATCH /departments/${departmentId} failed:`, e.message);
      }
    }
    // LocalStorage fallback
    const depts = loadStorage(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    const updated = depts.map(d => (d.id === departmentId ? { ...d, ...updateData } : d));
    saveStorage(STORAGE_KEYS.DEPARTMENTS, updated);
    return adaptDepartment(updated.find(d => d.id === departmentId));
  },

  // 3. Queue: Get tokens
  async getQueue(departmentId = 'all', status = null) {
    if (!IS_DEMO_MODE) {
      try {
        let endpoint = '/queue';
        const params = new URLSearchParams();
        if (departmentId && departmentId !== 'all') {
          // Check if numeric or code
          params.append('department_id', departmentId);
        }
        if (status && status !== 'all') {
          params.append('status', normalizeStatusToBackend(status));
        }
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
        const tokens = await request(endpoint);
        if (Array.isArray(tokens)) {
          return tokens.map(adaptToken);
        }
      } catch (e) {
        console.warn('Backend /queue unreachable, using fallback storage:', e.message);
      }
    }

    initLocalStorageIfEmpty();
    const tokens = loadStorage(STORAGE_KEYS.TOKENS, INITIAL_TOKENS).map(adaptToken);
    if (departmentId === 'all') return tokens;
    return tokens.filter(t => t.departmentId === departmentId || t.departmentCode === departmentId);
  },

  // 3.1 Queue: Get Current Serving Token for Department
  async getCurrentServingToken(departmentId) {
    if (!IS_DEMO_MODE && departmentId && departmentId !== 'all') {
      try {
        const token = await request(`/queue/${departmentId}/current`);
        return token ? adaptToken(token) : null;
      } catch (e) {
        console.warn(`Backend /queue/${departmentId}/current failed:`, e.message);
      }
    }
    const tokens = await this.getQueue(departmentId);
    return tokens.find(t => t.status === 'Called' || t.status === 'In Service') || null;
  },

  // 4. Patients: Register
  async registerPatient(payload) {
    // Convert department ID to integer if needed
    let deptId = payload.department_id || payload.departmentId;
    if (typeof deptId === 'string' && !/^\d+$/.test(deptId)) {
      // Map code to numeric id
      const depts = await this.getDepartments();
      const match = depts.find(d => d.code?.toLowerCase() === deptId.toLowerCase() || d.id === deptId);
      deptId = match ? match.numericId : 1;
    } else {
      deptId = parseInt(deptId, 10) || 1;
    }

    const backendPayload = {
      department_id: deptId,
      anonymous_reference: payload.anonymous_reference || payload.patientRef || null,
      anonymized_name: payload.anonymized_name || payload.anonymizedName || null,
      age_group: payload.age_group || payload.ageGroup || 'Adult (18-59)',
      visit_type: payload.visit_type || payload.visitType || 'Walk-in OPD',
      accessibility_needs: payload.accessibility_needs || payload.accessibilityNeeds || [],
      is_priority: Boolean(payload.is_priority ?? payload.isPriority),
      priority_reason: payload.priority_reason || payload.priorityReason || null,
      priority_staff_note: payload.priority_staff_note || payload.priorityStaffNote || null,
      priority_verified_by: payload.priority_verified_by || payload.priorityVerifiedBy || 'Reception Desk',
    };

    if (!IS_DEMO_MODE) {
      try {
        const res = await request('/patients/register', {
          method: 'POST',
          body: JSON.stringify(backendPayload),
        });
        return adaptToken(res);
      } catch (e) {
        if (e.status === 400 || e.status === 422) {
          throw e;
        }
        console.warn('Backend registration failed, saving locally:', e.message);
      }
    }

    // LocalStorage fallback
    initLocalStorageIfEmpty();
    const tokens = loadStorage(STORAGE_KEYS.TOKENS, INITIAL_TOKENS);
    const depts = loadStorage(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    const targetDept = depts.find(d => d.id === deptId) || depts[0];

    const deptTokens = tokens.filter(t => t.departmentId === targetDept.id);
    const nextNum = deptTokens.length + 101;
    const tokenNumber = `${targetDept.code}-${nextNum}`;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newToken = {
      id: Date.now(),
      token_number: tokenNumber,
      department_id: targetDept.id,
      department_code: targetDept.code,
      department_name: targetDept.name,
      patient_ref: backendPayload.anonymous_reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      anonymized_name: backendPayload.anonymized_name || `Patient #${Math.floor(100 + Math.random() * 900)}`,
      age_group: backendPayload.age_group,
      visit_type: backendPayload.visit_type,
      accessibility_needs: backendPayload.accessibility_needs,
      registration_time: timeString,
      status: 'WAITING',
      is_priority: backendPayload.is_priority,
      priority_reason: backendPayload.priority_reason,
      estimated_wait_minutes: 12,
    };

    saveStorage(STORAGE_KEYS.TOKENS, [newToken, ...tokens]);

    if (backendPayload.is_priority) {
      const flags = loadStorage(STORAGE_KEYS.PRIORITY_FLAGS, INITIAL_PRIORITY_FLAGS);
      const newFlag = {
        id: Date.now(),
        token_id: newToken.id,
        token_number: newToken.token_number,
        department_id: targetDept.id,
        department_name: targetDept.name,
        patient_ref: newToken.patient_ref,
        age_group: newToken.age_group,
        reason: backendPayload.priority_reason,
        staff_note: backendPayload.priority_staff_note,
        reviewer: backendPayload.priority_verified_by,
        timestamp: timeString,
        status: 'PENDING',
        audit_log: [{
          action: 'Priority Flag Created',
          user: backendPayload.priority_verified_by,
          time: timeString,
          note: backendPayload.priority_staff_note,
        }]
      };
      saveStorage(STORAGE_KEYS.PRIORITY_FLAGS, [newFlag, ...flags]);
    }

    return adaptToken(newToken);
  },

  // 5. Queue: Call Next Patient
  async callNextToken(departmentId, counterNumber = 1, staffName = 'Doctor / Counter Staff') {
    let deptId = departmentId;
    if (typeof deptId === 'string' && !/^\d+$/.test(deptId)) {
      const depts = await this.getDepartments();
      const match = depts.find(d => d.code?.toLowerCase() === deptId.toLowerCase() || d.id === deptId);
      deptId = match ? match.numericId : 1;
    } else {
      deptId = parseInt(deptId, 10) || 1;
    }

    if (!IS_DEMO_MODE) {
      try {
        const called = await request(`/queue/${deptId}/call-next`, {
          method: 'POST',
          body: JSON.stringify({
            counter_number: counterNumber,
            staff_name: staffName,
          }),
        });
        return { success: true, token: adaptToken(called) };
      } catch (e) {
        if (e.status === 404) {
          return { success: false, message: 'No waiting patients currently available in this department.' };
        }
        console.warn(`Backend /queue/${deptId}/call-next failed:`, e.message);
      }
    }

    // LocalStorage fallback
    const tokens = loadStorage(STORAGE_KEYS.TOKENS, INITIAL_TOKENS);
    let targetIndex = tokens.findIndex(t => (t.departmentId === deptId || t.department_id === deptId) && t.status === 'Waiting' && t.isPriority);
    if (targetIndex === -1) {
      targetIndex = tokens.findIndex(t => (t.departmentId === deptId || t.department_id === deptId) && t.status === 'Waiting');
    }

    if (targetIndex === -1) {
      return { success: false, message: 'No waiting patients in this department.' };
    }

    const targetToken = { ...tokens[targetIndex] };
    targetToken.status = 'Called';
    targetToken.counter_number = counterNumber;
    targetToken.counterServed = `Counter ${counterNumber} (${staffName})`;
    targetToken.called_time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = [...tokens];
    updated[targetIndex] = targetToken;
    saveStorage(STORAGE_KEYS.TOKENS, updated);

    return { success: true, token: adaptToken(targetToken) };
  },

  // 6. Queue: Update Token Status
  async updateTokenStatus(tokenId, newStatus, metadata = {}) {
    const backendStatus = normalizeStatusToBackend(newStatus);
    
    if (!IS_DEMO_MODE) {
      try {
        const payload = {
          status: backendStatus,
          counter_number: metadata.counter_number || metadata.counterNumber,
          counter_served: metadata.counter_served || metadata.counterServed,
          service_duration_minutes: metadata.service_duration_minutes || metadata.serviceDurationMinutes,
          note: metadata.note,
        };
        const updated = await request(`/queue/tokens/${tokenId}/status`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        return { success: true, token: adaptToken(updated) };
      } catch (e) {
        console.warn(`Backend PATCH /queue/tokens/${tokenId}/status failed:`, e.message);
      }
    }

    // LocalStorage fallback
    const tokens = loadStorage(STORAGE_KEYS.TOKENS, INITIAL_TOKENS);
    const index = tokens.findIndex(t => t.id === tokenId);
    if (index === -1) return { success: false, message: 'Token not found.' };

    const updatedToken = { ...tokens[index], status: newStatus, ...metadata };
    if (newStatus === 'Completed') {
      updatedToken.completion_time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatedToken.service_duration_minutes = Math.floor(6 + Math.random() * 6);
    }

    const updated = [...tokens];
    updated[index] = updatedToken;
    saveStorage(STORAGE_KEYS.TOKENS, updated);

    return { success: true, token: adaptToken(updatedToken) };
  },

  // 7. Predictions: Waiting Time Estimate
  async getWaitingTimeEstimate(departmentId = 1) {
    let deptId = departmentId;
    if (typeof deptId === 'string' && !/^\d+$/.test(deptId)) {
      const depts = await this.getDepartments();
      const match = depts.find(d => d.code?.toLowerCase() === deptId.toLowerCase() || d.id === deptId);
      deptId = match ? match.numericId : 1;
    } else {
      deptId = parseInt(deptId, 10) || 1;
    }

    if (!IS_DEMO_MODE) {
      try {
        const estimate = await request(`/waiting-time/${deptId}`);
        return adaptWaitingTimeEstimate(estimate);
      } catch (e) {
        console.warn(`Backend /waiting-time/${deptId} failed:`, e.message);
      }
    }

    // Local heuristic calculation fallback
    const depts = await this.getDepartments();
    const dept = depts.find(d => d.id === deptId || d.numericId === deptId) || depts[0];
    const tokens = await this.getQueue(dept.id);
    const waitingTokens = tokens.filter(t => t.status === 'Waiting');
    const priorityTokens = waitingTokens.filter(t => t.isPriority);

    const calc = calculateWaitingTimeEstimate({
      waitingCount: waitingTokens.length,
      activeCounters: dept.activeCounters || 1,
      avgServiceTimeMinutes: dept.avgServiceTimeMinutes || 8,
      priorityCount: priorityTokens.length,
      departmentCode: dept.code,
    });

    return adaptWaitingTimeEstimate({
      department_id: dept.numericId || dept.id,
      department_name: dept.name,
      department_code: dept.code,
      active_counters: dept.activeCounters,
      waiting_count: waitingTokens.length,
      estimated_wait_minutes: calc.estimatedWaitMinutes,
      range: {
        minimum: calc.minWaitMinutes,
        maximum: calc.maxWaitMinutes,
      },
      uncertainty: calc.uncertaintyLevel || 'LOW',
      factors: [
        `${waitingTokens.length} waiting patients in ${dept.code} queue`,
        `${dept.activeCounters} staffed consultation counters active`,
        `Baseline ${dept.avgServiceTimeMinutes}m average doctor consultation duration`,
        priorityTokens.length > 0 ? `${priorityTokens.length} clinical priority cases active` : 'Standard linear patient intake flow'
      ],
      method: 'QueueSense Baseline Heuristic OPD Model',
      confidence_score: calc.confidenceScore || 90,
      congestion_level: calc.congestionLevel || 'Low',
      congestion_badge: calc.congestionBadge || 'Normal Flow',
      operational_advice: calc.operationalAdvice || 'Queue flow is within operational targets.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, dept);
  },

  // 8. Priority: List flags
  async getPriorityFlags(statusFilter = 'all') {
    if (!IS_DEMO_MODE) {
      try {
        const flags = await request(`/priority/flags?status=${statusFilter || 'all'}`);
        if (Array.isArray(flags)) {
          return flags.map(adaptPriorityFlag);
        }
      } catch (e) {
        console.warn('Backend /priority/flags failed:', e.message);
      }
    }

    initLocalStorageIfEmpty();
    const flags = loadStorage(STORAGE_KEYS.PRIORITY_FLAGS, INITIAL_PRIORITY_FLAGS).map(adaptPriorityFlag);
    if (!statusFilter || statusFilter === 'all') return flags;
    return flags.filter(f => f.status.toLowerCase() === statusFilter.toLowerCase());
  },

  // 8.1 Priority: Review and Update Flag
  async updatePriorityFlag(flagId, payload) {
    let backendStatus = 'PENDING';
    if (payload.status) {
      const s = payload.status.toLowerCase();
      if (s === 'confirmed' || s === 'accepted') backendStatus = 'ACCEPTED';
      else if (s === 'overridden' || s === 'rejected') backendStatus = 'REJECTED';
      else if (s === 'reviewed') backendStatus = 'REVIEWED';
      else backendStatus = payload.status.toUpperCase();
    }

    if (!IS_DEMO_MODE) {
      try {
        const body = {
          status: backendStatus,
          action: payload.action || 'Priority Reviewed',
          review_notes: payload.note || payload.review_notes || 'Clinical review completed',
          reviewer_name: payload.user || payload.reviewer_name || 'Medical Officer',
        };
        const updated = await request(`/priority/flags/${flagId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        return { success: true, flag: adaptPriorityFlag(updated) };
      } catch (e) {
        console.warn(`Backend PATCH /priority/flags/${flagId} failed:`, e.message);
      }
    }

    // LocalStorage fallback
    const flags = loadStorage(STORAGE_KEYS.PRIORITY_FLAGS, INITIAL_PRIORITY_FLAGS);
    const index = flags.findIndex(f => f.id === flagId);
    if (index === -1) return { success: false, message: 'Priority case not found.' };

    const currentFlag = flags[index];
    const newAuditEntry = {
      action: payload.action || 'Status Updated',
      user: payload.user || 'Medical Officer',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: payload.note || 'Audit record updated.',
    };

    const updatedFlag = {
      ...currentFlag,
      status: payload.status || currentFlag.status,
      auditLog: [newAuditEntry, ...(currentFlag.auditLog || currentFlag.audit_log || [])],
    };

    const updated = [...flags];
    updated[index] = updatedFlag;
    saveStorage(STORAGE_KEYS.PRIORITY_FLAGS, updated);

    return { success: true, flag: adaptPriorityFlag(updatedFlag) };
  },

  // 9. Analytics: Comprehensive Overview
  async getAnalytics(timeRange = 'today') {
    if (!IS_DEMO_MODE) {
      try {
        const data = await request(`/analytics/overview?range=${timeRange || 'today'}`);
        return adaptAnalytics(data);
      } catch (e) {
        console.warn('Backend /analytics/overview failed:', e.message);
      }
    }

    // LocalStorage / mock analytics fallback
    return {
      summary: {
        totalServedToday: 324,
        totalRegistered: 348,
        waitingCount: 16,
        inServiceCount: 8,
        avgWaitOverallMinutes: 21.4,
        avgServiceDurationMinutes: 7.8,
        peakCongestionHour: '10:00 AM – 11:30 AM',
        retentionRate: '96.8%',
        skippedTokenRate: '3.2%',
      },
      hourlyTrend: HOURLY_ANALYTICS_DATA,
      weeklyTrend: WEEKLY_TREND_DATA,
      departmentComparison: DEPARTMENT_COMPARISON_DATA,
      timestamp: new Date().toISOString(),
    };
  },

  // 10. Reset Demo Data
  resetDemoData() {
    setAuthToken(null);
    saveStorage(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    saveStorage(STORAGE_KEYS.TOKENS, INITIAL_TOKENS);
    saveStorage(STORAGE_KEYS.PRIORITY_FLAGS, INITIAL_PRIORITY_FLAGS);
    return { success: true, message: 'Demo data successfully reseeded.' };
  }
};

export default apiService;
