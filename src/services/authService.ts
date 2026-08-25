import { supabase, isSupabaseConfigured } from './supabase';
import {
  DbStudent,
  DbDriver,
  DbSystemNotification,
  DbStudentFeedback,
  INITIAL_STUDENTS_SEED,
  INITIAL_DRIVERS_SEED,
  StandardPassQRPayload,
} from './supabaseSchema';
import { UserProfile, UserRole, PassVerificationLog } from '../types';
import { store } from './store';

const SESSION_STORAGE_KEY = 'campusgo_auth_session';
const STUDENTS_STORAGE_KEY = 'campusgo_local_students';
const DRIVERS_STORAGE_KEY = 'campusgo_local_drivers';

export interface AuthSession {
  role: UserRole;
  user: UserProfile;
  studentData?: DbStudent;
  driverData?: DbDriver;
  loggedInAt: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  session?: AuthSession;
}

class AuthService {
  private localStudents: DbStudent[] = [];
  private localDrivers: DbDriver[] = [];

  constructor() {
    this.initLocalCache();
  }

  private initLocalCache() {
    try {
      const savedStudents = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (savedStudents) {
        this.localStudents = JSON.parse(savedStudents);
      } else {
        this.localStudents = [...INITIAL_STUDENTS_SEED];
        this.saveLocalStudents();
      }

      const savedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
      if (savedDrivers) {
        this.localDrivers = JSON.parse(savedDrivers);
      } else {
        this.localDrivers = [...INITIAL_DRIVERS_SEED];
        this.saveLocalDrivers();
      }
    } catch {
      this.localStudents = [...INITIAL_STUDENTS_SEED];
      this.localDrivers = [...INITIAL_DRIVERS_SEED];
    }
  }

  private saveLocalStudents() {
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(this.localStudents));
    } catch (e) {
      console.warn('Failed to persist local students cache', e);
    }
  }

  private saveLocalDrivers() {
    try {
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(this.localDrivers));
    } catch (e) {
      console.warn('Failed to persist local drivers cache', e);
    }
  }

  // ==========================================
  // 1. STUDENT LOGIN
  // ==========================================
  async loginStudent(usn: string, fullName: string): Promise<AuthResult> {
    const cleanUsn = usn.trim().toUpperCase();
    const cleanName = fullName.trim();

    if (!cleanUsn || !cleanName) {
      return {
        success: false,
        error: 'Please enter both USN and Student Full Name.',
      };
    }

    let studentRecord: DbStudent | null = null;

    // Try Supabase first if online and configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('usn', cleanUsn)
          .maybeSingle();

        if (!error && data) {
          // Check case-insensitive full_name matching
          const dbName = (data.full_name || '').trim().toLowerCase();
          const inputName = cleanName.toLowerCase();

          if (dbName === inputName || dbName.includes(inputName) || inputName.includes(dbName)) {
            studentRecord = data as DbStudent;
          }
        }
      } catch (err) {
        console.warn('Supabase students query error, falling back to local registry:', err);
      }
    }

    // Fallback to local memory/seeded DB if Supabase not reachable or table not yet initialized
    if (!studentRecord) {
      const match = this.localStudents.find(
        (s) =>
          s.usn.toUpperCase() === cleanUsn &&
          s.full_name.trim().toLowerCase() === cleanName.toLowerCase()
      );
      if (match) {
        studentRecord = match;
      }
    }

    // Auto-provision if valid USN & Name provided
    if (!studentRecord) {
      const newStudent: DbStudent = {
        usn: cleanUsn,
        full_name: cleanName,
        department: 'Computer Science & Engineering',
        route_id: 'route-a',
        pass_status: 'ACTIVE',
      };
      this.localStudents.push(newStudent);
      this.saveLocalStudents();
      studentRecord = newStudent;

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('students').insert([newStudent]);
        } catch (e) {
          // non-blocking fallback
        }
      }
    }

    // Build user profile
    const userProfile: UserProfile = {
      id: studentRecord.id || `student-${studentRecord.usn}`,
      email: `${studentRecord.usn.toLowerCase()}@campus.edu`,
      name: studentRecord.full_name,
      role: 'student',
      studentId: studentRecord.usn,
      department: studentRecord.department || 'Computer Science & Engineering',
      phone: studentRecord.phone ? `+91 ${studentRecord.phone}` : '+91 98450 12345',
      assignedRouteId: studentRecord.route_id || 'route-a',
      favoriteStopId: studentRecord.route_id === 'route-b' ? 'stop-parvathi-nagar' : 'stop-gandhi-nagar',
      favoriteBusId: studentRecord.route_id === 'route-b' ? 'bus-05' : 'bus-03',
      favoriteRouteId: studentRecord.route_id || 'route-a',
      avatarUrl:
        studentRecord.full_name.toLowerCase().includes('priya')
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    };

    const session: AuthSession = {
      role: 'student',
      user: userProfile,
      studentData: studentRecord,
      loggedInAt: new Date().toISOString(),
    };

    this.saveSession(session);
    store.setCurrentUser(userProfile);
    store.switchRole('student');

    // Trigger Realtime System Notification
    this.recordSystemNotification({
      user_type: 'STUDENT',
      user_identifier: studentRecord.usn,
      action: `Student ${studentRecord.full_name} (${studentRecord.usn}) logged into portal`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return {
      success: true,
      session,
    };
  }

  // ==========================================
  // 2. DRIVER LOGIN
  // ==========================================
  async loginDriver(phoneNumber: string): Promise<AuthResult> {
    const rawPhone = phoneNumber.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone;

    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        success: false,
        error: 'Please enter a valid 10-digit registered phone number.',
      };
    }

    let driverRecord: DbDriver | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*');

        if (!error && Array.isArray(data)) {
          const match = data.find((d: DbDriver) => {
            const num = (d.phone_number || '').replace(/[^0-9]/g, '');
            return num.endsWith(cleanPhone) || cleanPhone.endsWith(num);
          });
          if (match) {
            driverRecord = match;
          }
        }
      } catch (err) {
        console.warn('Supabase drivers query notice, falling back:', err);
      }
    }

    if (!driverRecord) {
      const match = this.localDrivers.find((d) => {
        const num = d.phone_number.replace(/[^0-9]/g, '');
        return num.endsWith(cleanPhone) || cleanPhone.endsWith(num);
      });
      if (match) {
        driverRecord = match;
      }
    }

    if (!driverRecord) {
      // Auto-provision driver profile for any valid 10-digit phone number entered during testing
      const newDriver: DbDriver = {
        phone_number: cleanPhone,
        full_name: `Driver (${cleanPhone.slice(-4)})`,
        bus_number: 'BUS-03',
        assigned_route_id: 'route-a',
      };
      this.localDrivers.push(newDriver);
      this.saveLocalDrivers();
      driverRecord = newDriver;

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('drivers').insert([newDriver]);
        } catch (e) {
          // non-blocking
        }
      }
    }

    const userProfile: UserProfile = {
      id: driverRecord.id || `driver-${cleanPhone}`,
      email: `${driverRecord.full_name.toLowerCase().replace(/\s+/g, '.')}@campusgo.in`,
      name: driverRecord.full_name,
      role: 'driver',
      phone: `+91 ${driverRecord.phone_number}`,
      assignedBusId: (driverRecord.bus_number || 'BUS-03').toLowerCase().replace('bus-', 'bus-'),
      assignedRouteId: driverRecord.assigned_route_id || 'route-a',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };

    const session: AuthSession = {
      role: 'driver',
      user: userProfile,
      driverData: driverRecord,
      loggedInAt: new Date().toISOString(),
    };

    this.saveSession(session);
    store.setCurrentUser(userProfile);
    store.switchRole('driver');

    // Trigger Admin Realtime Notification
    this.recordSystemNotification({
      user_type: 'DRIVER',
      user_identifier: driverRecord.phone_number,
      action: `Driver ${driverRecord.full_name} (${driverRecord.bus_number}) logged in and started session`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return {
      success: true,
      session,
    };
  }

  // ==========================================
  // 3. ADMIN LOGIN
  // ==========================================
  async loginAdmin(usernameOrEmail: string, password?: string): Promise<AuthResult> {
    const input = usernameOrEmail.trim().toLowerCase();

    // Master login for Admin operations
    if (
      input === 'admin' ||
      input === 'admin@campusgo.edu' ||
      input.includes('transit.ops') ||
      input.includes('patil')
    ) {
      const userProfile: UserProfile = {
        id: 'admin-01',
        email: 'transit.ops@campusgo.ballari.edu',
        name: 'Prof. S. N. Patil',
        role: 'admin',
        department: 'Chief Transport Officer, Ballari Campus',
        phone: '+91 98800 11223',
        avatarUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      };

      const session: AuthSession = {
        role: 'admin',
        user: userProfile,
        loggedInAt: new Date().toISOString(),
      };

      this.saveSession(session);
      store.setCurrentUser(userProfile);
      store.switchRole('admin');

      this.recordSystemNotification({
        user_type: 'ADMIN',
        user_identifier: 'admin',
        action: 'Transit Administrator opened Operations Center',
        timestamp: new Date().toISOString(),
        read: false,
      });

      return {
        success: true,
        session,
      };
    }

    return {
      success: false,
      error: 'Invalid administrator credentials.',
    };
  }

  // ==========================================
  // 4. QR CODE PARSER & REAL-TIME DRIVER VERIFICATION
  // ==========================================
  async verifyScannedPass(
    scannedText: string,
    driverId: string = 'driver-03',
    busId: string = 'bus-03'
  ): Promise<{
    isValid: boolean;
    status: 'VALID' | 'INVALID' | 'EXPIRED';
    studentName: string;
    studentCode: string;
    routeCode: string;
    message: string;
    timestamp: string;
    log: PassVerificationLog;
  }> {
    let parsedUsn = '';
    let parsedName = '';
    let parsedRoute = 'ROUTE A';

    // 1. Try parsing JSON format: {"usn": "3BR21CS007", "name": "...", "validUntil": "...", ...}
    try {
      const parsed = JSON.parse(scannedText);
      if (parsed && typeof parsed === 'object') {
        parsedUsn = parsed.usn || parsed.studentCode || '';
        parsedName = parsed.name || parsed.studentName || '';
        parsedRoute = parsed.routeCode || parsedRoute;
      }
    } catch {
      // 2. Fallback: Parse colon-delimited string or plain USN
      if (scannedText.includes('CAMPUSGO:PASS:')) {
        const parts = scannedText.split(':');
        parsedUsn = parts[3] || '';
      } else if (scannedText.trim().length >= 5) {
        parsedUsn = scannedText.trim().toUpperCase();
      }
    }

    const cleanUsn = (parsedUsn || '').trim().toUpperCase();
    let studentInDb: DbStudent | null = null;

    // Query Supabase students table in real time
    if (cleanUsn && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('usn', cleanUsn)
          .maybeSingle();

        if (!error && data) {
          studentInDb = data as DbStudent;
        }
      } catch (err) {
        console.warn('Realtime Supabase QR lookup error:', err);
      }
    }

    // Fallback to local students table
    if (!studentInDb && cleanUsn) {
      studentInDb =
        this.localStudents.find((s) => s.usn.toUpperCase() === cleanUsn) || null;
    }

    let status: 'VALID' | 'INVALID' | 'EXPIRED' = 'INVALID';
    let message = '';
    let studentName = parsedName || 'Unknown Commuter';
    let studentCode = cleanUsn || 'UNREGISTERED-PASS';

    if (studentInDb) {
      studentName = studentInDb.full_name;
      studentCode = studentInDb.usn;
      parsedRoute = (studentInDb.route_id || 'route-a').toUpperCase().replace('ROUTE-', 'ROUTE ');

      if (studentInDb.pass_status === 'ACTIVE') {
        status = 'VALID';
        message = `Pass verified active for ${studentInDb.full_name} (${studentInDb.usn}). Boarding approved.`;
      } else if (studentInDb.pass_status === 'EXPIRED') {
        status = 'EXPIRED';
        message = `Pass has EXPIRED for ${studentInDb.full_name}. Please renew semester pass.`;
      } else {
        status = 'INVALID';
        message = `Pass is SUSPENDED for ${studentInDb.full_name}. Contact transport administrator.`;
      }
    } else {
      status = 'INVALID';
      message = cleanUsn
        ? `USN "${cleanUsn}" not found in institutional database.`
        : 'Invalid or corrupted QR Code signature.';
    }

    const log: PassVerificationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      passId: `pass-${studentCode}`,
      studentName,
      studentCode,
      driverId,
      busId,
      verifiedAt: new Date().toISOString(),
      result: status,
      locationName: 'Active Bus Conductor Gate',
    };

    // Store in global store verification logs
    store.addVerificationLog(log);

    // Broadcast system notification
    this.recordSystemNotification({
      user_type: 'STUDENT',
      user_identifier: studentCode,
      action: `Pass ${status} scan for ${studentName} (${studentCode}) on ${busId.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return {
      isValid: status === 'VALID',
      status,
      studentName,
      studentCode,
      routeCode: parsedRoute,
      message,
      timestamp: new Date().toISOString(),
      log,
    };
  }

  // ==========================================
  // 5. STUDENT FEEDBACK DIRECT ROUTING
  // ==========================================
  async submitFeedback(feedback: {
    studentUsn: string;
    studentName?: string;
    busId?: string;
    category: string;
    message: string;
    rating?: number;
  }): Promise<boolean> {
    const feedbackPayload: DbStudentFeedback = {
      student_usn: feedback.studentUsn,
      student_name: feedback.studentName || 'Student',
      bus_id: feedback.busId || 'BUS-03',
      category: feedback.category,
      message: feedback.message,
      rating: feedback.rating || 5,
      timestamp: new Date().toISOString(),
    };

    // Push to Supabase student_feedback table
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('student_feedback').insert([feedbackPayload]);
      } catch (err) {
        console.warn('Failed to insert feedback into Supabase:', err);
      }
    }

    // Emit system notification for Admin
    this.recordSystemNotification({
      user_type: 'STUDENT',
      user_identifier: feedback.studentUsn,
      action: `New ${feedback.category} feedback submitted by ${feedback.studentName || feedback.studentUsn}`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    return true;
  }

  // ==========================================
  // 6. REAL-TIME SYSTEM NOTIFICATIONS
  // ==========================================
  async recordSystemNotification(item: DbSystemNotification) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('system_notifications').insert([
          {
            user_type: item.user_type,
            user_identifier: item.user_identifier,
            action: item.action,
            timestamp: item.timestamp,
            read: item.read,
          },
        ]);
      } catch (err) {
        console.warn('Supabase notification broadcast notice:', err);
      }
    }

    // Also push to in-app notification feed in store
    store.addNotification({
      title: `${item.user_type} Event`,
      message: item.action,
      type: item.action.includes('Emergency') || item.action.includes('SOS') ? 'EMERGENCY' : 'RECOMMENDATION',
      targetRole: 'admin',
    });
  }

  async fetchSystemNotifications(): Promise<DbSystemNotification[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('system_notifications')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20);

        if (!error && Array.isArray(data)) {
          return data as DbSystemNotification[];
        }
      } catch (e) {
        console.warn('Supabase fetch notifications error', e);
      }
    }
    return [];
  }

  // ==========================================
  // 7. ADMIN CRUD FOR STUDENTS & DRIVERS
  // ==========================================
  async getStudentsList(): Promise<DbStudent[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          this.localStudents = data;
          this.saveLocalStudents();
          return data;
        }
      } catch (e) {
        console.warn('Supabase getStudentsList notice:', e);
      }
    }
    return this.localStudents;
  }

  async getDriversList(): Promise<DbDriver[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          this.localDrivers = data;
          this.saveLocalDrivers();
          return data;
        }
      } catch (e) {
        console.warn('Supabase getDriversList notice:', e);
      }
    }
    return this.localDrivers;
  }

  async saveStudent(student: DbStudent): Promise<boolean> {
    const cleanUsn = student.usn.trim().toUpperCase();
    const payload = {
      ...student,
      usn: cleanUsn,
      created_at: student.created_at || new Date().toISOString(),
    };

    // Update local cache
    const idx = this.localStudents.findIndex((s) => s.usn.toUpperCase() === cleanUsn);
    if (idx >= 0) {
      this.localStudents[idx] = payload;
    } else {
      this.localStudents.unshift(payload);
    }
    this.saveLocalStudents();

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('students').upsert([payload], { onConflict: 'usn' });
      } catch (e) {
        console.warn('Supabase saveStudent notice:', e);
      }
    }

    return true;
  }

  async deleteStudent(usn: string): Promise<boolean> {
    const cleanUsn = usn.trim().toUpperCase();
    this.localStudents = this.localStudents.filter((s) => s.usn.toUpperCase() !== cleanUsn);
    this.saveLocalStudents();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('students').delete().eq('usn', cleanUsn);
      } catch (e) {
        console.warn('Supabase deleteStudent notice:', e);
      }
    }
    return true;
  }

  async saveDriver(driver: DbDriver): Promise<boolean> {
    const raw = driver.phone_number.replace(/[^0-9]/g, '');
    const payload = {
      ...driver,
      phone_number: raw,
      created_at: driver.created_at || new Date().toISOString(),
    };

    const idx = this.localDrivers.findIndex((d) => d.phone_number === raw);
    if (idx >= 0) {
      this.localDrivers[idx] = payload;
    } else {
      this.localDrivers.unshift(payload);
    }
    this.saveLocalDrivers();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('drivers').upsert([payload], { onConflict: 'phone_number' });
      } catch (e) {
        console.warn('Supabase saveDriver notice:', e);
      }
    }
    return true;
  }

  async deleteDriver(phoneNumber: string): Promise<boolean> {
    const raw = phoneNumber.replace(/[^0-9]/g, '');
    this.localDrivers = this.localDrivers.filter((d) => d.phone_number !== raw);
    this.saveLocalDrivers();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('drivers').delete().eq('phone_number', raw);
      } catch (e) {
        console.warn('Supabase deleteDriver notice:', e);
      }
    }
    return true;
  }

  // ==========================================
  // 8. SESSION MANAGEMENT
  // ==========================================
  saveSession(session: AuthSession) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Session save notice:', e);
    }
  }

  getSession(): AuthSession | null {
    try {
      const str = localStorage.getItem(SESSION_STORAGE_KEY);
      if (str) {
        return JSON.parse(str);
      }
    } catch {
      return null;
    }
    return null;
  }

  logout() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn('Logout notice:', e);
    }
  }
}

export const authService = new AuthService();
