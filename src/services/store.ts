import {
  Bus,
  CampusRoute,
  BusStop,
  UserProfile,
  Trip,
  DigitalBusPass,
  PassVerificationLog,
  Announcement,
  EmergencyAlert,
  StudentFeedback,
  NotificationItem,
  RouteDisruption,
  AppState,
  UserRole,
} from '../types';
import {
  INITIAL_BUSES,
  DEMO_ROUTES,
  DEMO_STOPS,
  DEMO_USERS,
  DEMO_PASS,
  CAMPUS_COORDINATES,
} from '../data/ballariData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'campusgo_ballari_state_v1';
const BROADCAST_CHANNEL_NAME = 'campusgo_realtime_broadcast';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel unavailable
}

// Initial state builder
function getInitialState(): AppState {
  const defaultDriver = DEMO_USERS.find((u) => u.role === 'driver') || DEMO_USERS[2];
  return {
    currentUser: defaultDriver,
    currentRole: 'driver',
    buses: JSON.parse(JSON.stringify(INITIAL_BUSES)),
    routes: JSON.parse(JSON.stringify(DEMO_ROUTES)),
    stops: JSON.parse(JSON.stringify(DEMO_STOPS)),
    users: JSON.parse(JSON.stringify(DEMO_USERS)),
    passes: [DEMO_PASS],
    verificationLogs: [],
    announcements: [
      {
        id: 'ann-1',
        title: 'Morning Campus Bus Schedule Active',
        message: 'All 5 morning fleet buses are operating normally on Ballari routes.',
        category: 'GENERAL',
        targetAudience: 'all',
        createdBy: 'Prof. S. N. Patil (Transport Ops)',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isActive: true,
      },
    ],
    emergencyAlerts: [],
    feedbackList: [
      {
        id: 'fb-1',
        studentId: 'student-02',
        studentName: 'Priya Kulkarni',
        busId: 'bus-02',
        routeId: 'route-b',
        rating: 4,
        issueType: 'Bus Crowded',
        comment: 'BUS-02 was very crowded near Parvathi Nagar stop yesterday morning.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'REVIEWED',
      },
    ],
    notifications: [
      {
        id: 'notif-init-1',
        title: 'Welcome to CampusGo Ballari',
        message: 'Your primary stop is set to Gandhi Nagar. Next bus is BUS-03 in 7 min.',
        type: 'RECOMMENDATION',
        timestamp: new Date().toISOString(),
        read: false,
        busId: 'bus-03',
        routeId: 'route-a',
      },
    ],
    disruptions: [],
    trips: [
      {
        id: 'trip-demo-01',
        busId: 'bus-03',
        busNumber: 'BUS-03',
        routeId: 'route-a',
        routeName: 'Ballari Central - Cowl Bazaar - Campus',
        driverId: 'driver-03',
        driverName: 'Ramesh Kumar',
        startTime: new Date(Date.now() - 1200000).toISOString(),
        status: 'IN_PROGRESS',
        currentOccupancy: 36,
        peakOccupancy: 38,
        delayMinutes: 0,
        distanceCoveredKm: 4.6,
        events: [
          {
            id: 'ev-1',
            tripId: 'trip-demo-01',
            type: 'STARTED',
            message: 'Trip started from Ballari Central by Ramesh Kumar',
            timestamp: new Date(Date.now() - 1200000).toISOString(),
          },
          {
            id: 'ev-2',
            tripId: 'trip-demo-01',
            type: 'STOP_ARRIVED',
            message: 'Arrived at Cantonment Area Stop',
            timestamp: new Date(Date.now() - 800000).toISOString(),
          },
          {
            id: 'ev-3',
            tripId: 'trip-demo-01',
            type: 'STOP_ARRIVED',
            message: 'Departed Cowl Bazaar Stop heading to Gandhi Nagar',
            timestamp: new Date(Date.now() - 200000).toISOString(),
          },
        ],
      },
    ],
    activeTripIdByBus: {
      'bus-03': 'trip-demo-01',
    },
    isSimulationRunning: false,
    simulationSpeed: 1,
    selectedStopId: 'stop-gandhi-nagar',
    selectedBusId: 'bus-03',
    isDarkMode: false,
    lastSyncTimestamp: Date.now(),
  };
}

class StoreService {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();
  private simulationInterval: any = null;

  constructor() {
    this.state = this.loadState();
    
    // Listen to broadcast channel for multi-tab sync
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATE') {
          this.state = {
            ...event.data.payload,
            lastSyncTimestamp: Date.now(),
          };
          this.notify();
        }
      };
    }

    // Set up Supabase Realtime channel if configured
    this.setupSupabaseRealtime();
  }

  private loadState(): AppState {
    const defaultDriver = DEMO_USERS.find((u) => u.role === 'driver') || DEMO_USERS[2];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...getInitialState(),
          ...parsed,
          currentRole: 'driver',
          currentUser: parsed.currentUser && parsed.currentUser.role === 'driver' ? parsed.currentUser : defaultDriver,
          buses: parsed.buses && parsed.buses.length ? parsed.buses : INITIAL_BUSES,
        };
      }
    } catch {
      // Fallback
    }
    return getInitialState();
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore quota errors
    }
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'STATE_UPDATE',
        payload: this.state,
      });
    }
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AppState {
    return this.state;
  }

  private setupSupabaseRealtime() {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const channel = supabase.channel('campusgo_public_fleet');
      channel
        .on('broadcast', { event: 'bus_location_update' }, ({ payload }) => {
          if (payload && payload.busId) {
            this.handleRemoteLocationUpdate(payload);
          }
        })
        .on('broadcast', { event: 'announcement' }, ({ payload }) => {
          if (payload) {
            this.state.announcements = [payload, ...this.state.announcements];
            this.saveState();
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime init notice:', e);
    }
  }

  private handleRemoteLocationUpdate(payload: any) {
    const busIndex = this.state.buses.findIndex((b) => b.id === payload.busId);
    if (busIndex !== -1) {
      this.state.buses[busIndex] = {
        ...this.state.buses[busIndex],
        location: {
          latitude: payload.lat,
          longitude: payload.lng,
          speedKmH: payload.speed || this.state.buses[busIndex].speed,
          heading: payload.heading || this.state.buses[busIndex].location.heading,
          accuracyMeters: payload.accuracy,
          timestamp: new Date().toISOString(),
        },
        speed: payload.speed || this.state.buses[busIndex].speed,
        lastUpdated: 'Just now',
      };
      this.saveState();
    }
  }

  // Action methods
  public setCurrentUser(user: UserProfile) {
    this.state.currentUser = user;
    this.state.currentRole = user.role;
    if (user.role === 'student') {
      if (user.favoriteStopId) this.state.selectedStopId = user.favoriteStopId;
      if (user.favoriteBusId) this.state.selectedBusId = user.favoriteBusId;
    } else if (user.role === 'driver') {
      if (user.assignedBusId) this.state.selectedBusId = user.assignedBusId;
    }
    this.saveState();
  }

  public switchRole(role: UserRole) {
    this.state.currentRole = role;
    const found = this.state.users.find((u) => u.role === role);
    if (found) {
      this.setCurrentUser(found);
    } else {
      this.saveState();
    }
  }

  public switchDemoRole(role: UserRole, targetId?: string) {
    const found = this.state.users.find((u) => (targetId ? u.id === targetId : u.role === role));
    if (found) {
      this.setCurrentUser(found);
    }
  }

  public setSelectedStop(stopId: string) {
    this.state.selectedStopId = stopId;
    this.saveState();
  }

  public setSelectedBus(busId: string) {
    this.state.selectedBusId = busId;
    this.saveState();
  }

  public toggleDarkMode() {
    this.state.isDarkMode = !this.state.isDarkMode;
    if (this.state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.saveState();
  }

  public updateBusLocation(
    busId: string,
    lat: number,
    lng: number,
    speed: number,
    heading: number,
    accuracy: number = 5
  ) {
    const bus = this.state.buses.find((b) => b.id === busId);
    if (!bus) return;

    bus.location = {
      latitude: lat,
      longitude: lng,
      speedKmH: Math.round(speed),
      heading: Math.round(heading),
      accuracyMeters: accuracy,
      timestamp: new Date().toISOString(),
    };
    bus.speed = Math.round(speed);
    bus.lastUpdated = 'Just now';

    // Check approaching stops & notify
    this.checkApproachingThresholds(bus);

    // Save & Broadcast
    this.saveState();

    if (isSupabaseConfigured && supabase) {
      supabase.channel('campusgo_public_fleet').send({
        type: 'broadcast',
        event: 'bus_location_update',
        payload: { busId, lat, lng, speed, heading, accuracy },
      });
    }
  }

  public updateBusOccupancy(busId: string, count: number) {
    const bus = this.state.buses.find((b) => b.id === busId);
    if (!bus) return;

    const clampedCount = Math.max(0, Math.min(bus.capacity, count));
    bus.currentOccupancy = clampedCount;
    bus.occupancyPercentage = Math.round((clampedCount / bus.capacity) * 100);

    if (bus.occupancyPercentage >= 85) {
      this.addNotification({
        title: `${bus.busNumber} is Almost Full (${bus.occupancyPercentage}%)`,
        message: `High passenger load reported. Students may consider alternate bus BUS-05.`,
        type: 'RECOMMENDATION',
        busId: bus.id,
      });
    }

    this.saveState();
  }

  public triggerBusDelay(busId: string, delayMinutes: number, reason: string = 'Traffic congestion') {
    const bus = this.state.buses.find((b) => b.id === busId);
    if (!bus) return;

    bus.delayMinutes = delayMinutes;
    bus.delayReason = reason;
    bus.status = delayMinutes > 0 ? 'DELAYED' : 'ON_TIME';

    this.addNotification({
      title: `${bus.busNumber} Delay Alert (+${delayMinutes} min)`,
      message: `${bus.busNumber} is delayed by ${delayMinutes} minutes due to ${reason}. Smart commute schedules adjusted.`,
      type: 'DELAY',
      busId: bus.id,
      routeId: bus.routeId,
    });

    this.saveState();
  }

  public updateBusDelay(busId: string, delayMinutes: number, reason: string = 'Traffic delay') {
    this.triggerBusDelay(busId, delayMinutes, reason);
  }

  public advanceToNextStop(busId: string) {
    const bus = this.state.buses.find((b) => b.id === busId);
    if (!bus) return;
    const route = this.state.routes.find((r) => r.id === bus.routeId);
    if (!route) return;

    const nextIdx = (bus.currentStopIndex + 1) % route.stops.length;
    const nextStopObj = route.stops[nextIdx];
    if (nextStopObj) {
      this.arrivedAtStop(busId, nextStopObj.stopId);
    }
  }

  public triggerEmergency(busId: string, reason: string, customLat?: number, customLng?: number) {
    const bus = this.state.buses.find((b) => b.id === busId);
    if (!bus) return;

    const driver = this.state.users.find((u) => u.id === bus.driverId) || {
      name: 'Ramesh Kumar',
      id: 'driver-03',
    };
    const route = this.state.routes.find((r) => r.id === bus.routeId);

    bus.isEmergency = true;
    bus.emergencyReason = reason;
    bus.status = 'EMERGENCY';

    const lat = customLat || bus.location.latitude;
    const lng = customLng || bus.location.longitude;

    const newAlert: EmergencyAlert = {
      id: `sos-${Date.now()}`,
      busId: bus.id,
      busNumber: bus.busNumber,
      driverId: driver.id,
      driverName: driver.name,
      routeCode: route?.code || 'ROUTE A',
      location: {
        lat,
        lng,
        address: `Near Ballari coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      },
      reason,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    };

    this.state.emergencyAlerts = [newAlert, ...this.state.emergencyAlerts];

    this.addNotification({
      title: `🚨 EMERGENCY SOS: ${bus.busNumber}`,
      message: `Driver triggered emergency SOS: ${reason}. Transit ops dispatched.`,
      type: 'EMERGENCY',
      busId: bus.id,
      targetRole: 'admin',
    });

    this.saveState();
  }

  public resolveEmergency(alertId: string) {
    const alert = this.state.emergencyAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();

    const bus = this.state.buses.find((b) => b.id === alert.busId);
    if (bus) {
      bus.isEmergency = false;
      bus.status = bus.delayMinutes > 0 ? 'DELAYED' : 'ON_TIME';
    }

    this.saveState();
  }

  public startTrip(busId: string, driverId: string, routeId: string) {
    const bus = this.state.buses.find((b) => b.id === busId);
    const driver = this.state.users.find((u) => u.id === driverId);
    const route = this.state.routes.find((r) => r.id === routeId);

    if (!bus) return;

    bus.tripStatus = 'IN_TRANSIT';
    bus.status = 'ON_TIME';
    bus.currentStopIndex = 0;

    const newTripId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      id: newTripId,
      busId: bus.id,
      busNumber: bus.busNumber,
      routeId: routeId,
      routeName: route ? `${route.code} (${route.name})` : 'Route',
      driverId: driverId,
      driverName: driver?.name || 'Driver',
      startTime: new Date().toISOString(),
      status: 'IN_PROGRESS',
      currentOccupancy: bus.currentOccupancy,
      peakOccupancy: bus.currentOccupancy,
      delayMinutes: bus.delayMinutes,
      distanceCoveredKm: 0,
      events: [
        {
          id: `ev-${Date.now()}`,
          tripId: newTripId,
          type: 'STARTED',
          message: `Trip started by ${driver?.name || 'Driver'}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.state.trips = [newTrip, ...this.state.trips];
    this.state.activeTripIdByBus[busId] = newTripId;

    this.addNotification({
      title: `${bus.busNumber} Trip Started`,
      message: `${bus.busNumber} is now live on ${route?.code || 'Route A'}.`,
      type: 'ANNOUNCEMENT',
      busId: bus.id,
    });

    this.saveState();
  }

  public arrivedAtStop(busId: string, stopId: string) {
    const bus = this.state.buses.find((b) => b.id === busId);
    const stop = this.state.stops.find((s) => s.id === stopId);
    if (!bus || !stop) return;

    const tripId = this.state.activeTripIdByBus[busId];
    if (tripId) {
      const trip = this.state.trips.find((t) => t.id === tripId);
      if (trip) {
        trip.events.push({
          id: `ev-${Date.now()}`,
          tripId,
          type: 'STOP_ARRIVED',
          message: `Arrived at ${stop.name}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Advance stop index
    const route = this.state.routes.find((r) => r.id === bus.routeId);
    if (route) {
      const currentIdx = route.stops.findIndex((s) => s.stopId === stopId);
      if (currentIdx !== -1) {
        bus.currentStopIndex = currentIdx;
        const nextStop = route.stops[currentIdx + 1];
        if (nextStop) {
          bus.nextStopId = nextStop.stopId;
          bus.etaMinutesToNextStop = 4;
        }
      }
    }

    this.addNotification({
      title: `${bus.busNumber} Arrived at ${stop.name}`,
      message: `Boarding currently underway at ${stop.name}.`,
      type: 'APPROACHING',
      busId: bus.id,
    });

    this.saveState();
  }

  public endTrip(busId: string) {
    const bus = this.state.buses.find((b) => b.id === busId);
    if (!bus) return;

    bus.tripStatus = 'COMPLETED';
    bus.status = 'COMPLETED';

    const tripId = this.state.activeTripIdByBus[busId];
    if (tripId) {
      const trip = this.state.trips.find((t) => t.id === tripId);
      if (trip) {
        trip.status = 'COMPLETED';
        trip.endTime = new Date().toISOString();
        trip.events.push({
          id: `ev-${Date.now()}`,
          tripId,
          type: 'COMPLETED',
          message: 'Trip completed safely at Ballari Campus Gate',
          timestamp: new Date().toISOString(),
        });
      }
    }

    this.saveState();
  }

  public broadcastAnnouncement(
    title: string,
    message: string,
    category: Announcement['category'] = 'GENERAL',
    targetAudience: Announcement['targetAudience'] = 'all',
    targetValue?: string
  ) {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      message,
      category,
      targetAudience,
      targetValue,
      createdBy: this.state.currentUser.name || 'Transit Ops',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    this.state.announcements = [newAnn, ...this.state.announcements];

    this.addNotification({
      title: `📢 ${title}`,
      message,
      type: 'ANNOUNCEMENT',
      busId: targetAudience === 'bus' ? targetValue : undefined,
      routeId: targetAudience === 'route' ? targetValue : undefined,
    });

    this.saveState();
  }

  public submitFeedback(feedback: Omit<StudentFeedback, 'id' | 'createdAt' | 'status'>) {
    const newFb: StudentFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'NEW',
    };

    this.state.feedbackList = [newFb, ...this.state.feedbackList];
    this.saveState();
    return newFb;
  }

  public addVerificationLog(log: PassVerificationLog) {
    this.state.verificationLogs = [log, ...this.state.verificationLogs.slice(0, 49)];
    this.saveState();
  }

  public getFeedbacks(): StudentFeedback[] {
    return this.state.feedbackList || [];
  }

  public getVerificationLogs(): PassVerificationLog[] {
    return this.state.verificationLogs || [];
  }

  public verifyPass(qrString: string, driverId: string, busId: string): PassVerificationLog {
    const isMockFormat = qrString.startsWith('CAMPUSGO:PASS');
    const matchedPass = this.state.passes.find(
      (p) => p.qrVerificationCode === qrString || qrString.includes(p.passNumber) || qrString.includes(p.studentCode)
    ) || DEMO_PASS;

    const isValid = isMockFormat || matchedPass.status === 'ACTIVE';

    const log: PassVerificationLog = {
      id: `ver-${Date.now()}`,
      passId: matchedPass.id,
      studentName: matchedPass.studentName,
      studentCode: matchedPass.studentCode,
      driverId,
      busId,
      verifiedAt: new Date().toISOString(),
      result: isValid ? 'VALID' : 'INVALID',
      locationName: 'Gandhi Nagar Stop (Driver Scan)',
    };

    this.state.verificationLogs = [log, ...this.state.verificationLogs];
    this.saveState();
    return log;
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.state.notifications = [newNotif, ...this.state.notifications.slice(0, 40)];
    this.saveState();
  }

  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveState();
    }
  }

  public markAllNotificationsRead() {
    this.state.notifications.forEach((n) => (n.read = true));
    this.saveState();
  }

  private checkApproachingThresholds(bus: Bus) {
    const targetStop = this.state.stops.find((s) => s.id === this.state.selectedStopId);
    if (!targetStop) return;

    // Approximate distance in km
    const dLat = (bus.location.latitude - targetStop.latitude) * 111;
    const dLng = (bus.location.longitude - targetStop.longitude) * 105;
    const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng);

    // 1 km alert
    if (distanceKm <= 1.0 && distanceKm > 0.6) {
      const existing = this.state.notifications.find(
        (n) => n.type === 'APPROACHING' && n.title.includes('Approaching') && n.busId === bus.id
      );
      if (!existing) {
        this.addNotification({
          title: `BUS-03 is approaching ${targetStop.name}`,
          message: `Distance ~${(distanceKm * 1000).toFixed(0)}m. Please proceed to the boarding point.`,
          type: 'APPROACHING',
          busId: bus.id,
        });
      }
    } else if (distanceKm <= 0.5 && distanceKm > 0.2) {
      // 500m alert
      const existing = this.state.notifications.find(
        (n) => n.type === 'APPROACHING' && n.title.includes('Arriving Soon') && n.busId === bus.id
      );
      if (!existing) {
        this.addNotification({
          title: `BUS-03 is arriving soon at ${targetStop.name}`,
          message: `Distance ~450m. ETA under 2 minutes.`,
          type: 'APPROACHING',
          busId: bus.id,
        });
      }
    }
  }

  // SIMULATOR CONTROLS
  public toggleSimulation() {
    if (this.state.isSimulationRunning) {
      this.pauseSimulation();
    } else {
      this.startSimulation();
    }
  }

  public setSimulationSpeed(speed: number) {
    this.state.simulationSpeed = speed;
    if (this.state.isSimulationRunning) {
      this.pauseSimulation();
      this.startSimulation();
    }
    this.saveState();
  }

  public startSimulation() {
    this.state.isSimulationRunning = true;
    if (this.simulationInterval) clearInterval(this.simulationInterval);

    const stepIntervalMs = Math.max(250, 1000 / this.state.simulationSpeed);

    this.simulationInterval = setInterval(() => {
      this.stepSimulation();
    }, stepIntervalMs);

    this.saveState();
  }

  public pauseSimulation() {
    this.state.isSimulationRunning = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.saveState();
  }

  public resetSimulation() {
    this.pauseSimulation();
    this.state.buses = JSON.parse(JSON.stringify(INITIAL_BUSES));
    this.state.emergencyAlerts = [];
    this.saveState();
  }

  public stepSimulation() {
    const speedFactor = 0.00035 * this.state.simulationSpeed;

    this.state.buses.forEach((bus) => {
      if (bus.isEmergency || bus.tripStatus === 'COMPLETED') return;

      const route = this.state.routes.find((r) => r.id === bus.routeId);
      if (!route) return;

      const stopIds = route.stops.map((s) => s.stopId);
      const nextStop = this.state.stops.find((s) => s.id === bus.nextStopId) || this.state.stops[0];

      const dLat = nextStop.latitude - bus.location.latitude;
      const dLng = nextStop.longitude - bus.location.longitude;
      const dist = Math.hypot(dLat, dLng);

      if (dist < 0.0008) {
        const currIdx = stopIds.indexOf(nextStop.id);
        if (currIdx < stopIds.length - 1) {
          bus.currentStopIndex = currIdx;
          bus.nextStopId = stopIds[currIdx + 1];
        } else {
          bus.tripStatus = 'COMPLETED';
          bus.location.latitude = CAMPUS_COORDINATES.lat;
          bus.location.longitude = CAMPUS_COORDINATES.lng;
          return;
        }
      }

      const angle = Math.atan2(dLat, dLng);
      bus.location.latitude += Math.sin(angle) * speedFactor;
      bus.location.longitude += Math.cos(angle) * speedFactor;
      bus.location.heading = Math.round(((angle * 180) / Math.PI + 360) % 360);
      bus.location.timestamp = new Date().toISOString();
      bus.lastUpdated = 'Just now';
    });

    this.saveState();
  }
}

export const store = new StoreService();
