export type UserRole = 'student' | 'driver' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  studentId?: string; // e.g. BLR-2024-CS042
  department?: string;
  assignedRouteId?: string;
  assignedBusId?: string;
  favoriteStopId?: string;
  favoriteBusId?: string;
  favoriteRouteId?: string;
}

export type BusStatus = 'ON_TIME' | 'DELAYED' | 'EARLY' | 'STANDBY' | 'MAINTENANCE' | 'EMERGENCY' | 'COMPLETED';

export type OccupancyStatus = 'SEATS_AVAILABLE' | 'FILLING_UP' | 'ALMOST_FULL' | 'FULL';

export interface BusLocation {
  latitude: number;
  longitude: number;
  speedKmH: number;
  heading: number;
  accuracyMeters?: number;
  timestamp: string;
}

export interface Bus {
  id: string;
  busNumber: string; // e.g. BUS-03
  plateNumber: string; // KA-34-E-1042
  routeId: string;
  driverId: string;
  capacity: number; // 50
  currentOccupancy: number; // e.g. 36
  occupancyPercentage: number; // 72%
  status: BusStatus;
  delayMinutes: number; // e.g. 7 or 0
  delayReason?: string;
  isEmergency: boolean;
  emergencyReason?: string;
  location: BusLocation;
  currentStopIndex: number;
  nextStopId: string;
  etaMinutesToNextStop: number;
  tripStatus: 'IDLE' | 'IN_TRANSIT' | 'PAUSED' | 'COMPLETED';
  lastUpdated: string;
  speed: number;
}

export interface BusStop {
  id: string;
  name: string; // e.g. Gandhi Nagar
  landmark: string;
  latitude: number;
  longitude: number;
  routeIds: string[];
  averageWalkingTimeMinutes: number; // standard walking time from nearby homes
  sequenceNumber: number;
}

export interface RouteStop {
  stopId: string;
  sequence: number;
  estimatedMinutesFromOrigin: number;
  distanceFromPrevKm: number;
}

export interface CampusRoute {
  id: string;
  name: string; // e.g. ROUTE A (Ballari Central to Campus)
  code: string; // ROUTE-A
  color: string; // #2563EB
  originName: string;
  destinationName: string; // Ballari Campus Gate
  totalDistanceKm: number;
  stops: RouteStop[];
  isDemo: boolean;
  activeBusIds: string[];
  description: string;
}

export interface SmartCommuteAdvice {
  busId: string;
  busNumber: string;
  routeCode: string;
  targetStopId: string;
  targetStopName: string;
  busDistanceKm: number;
  etaMinutes: number;
  walkingTimeMinutes: number;
  safetyBufferMinutes: number;
  recommendedDepartureTime: string; // e.g. "8:10 AM"
  departureCountDownMinutes: number; // e.g. 2
  actionHeadline: string; // "LEAVE IN 2 MINUTES" | "LEAVE NOW" | "BUS MISSED" | "BUS DELAYED"
  urgencyLevel: 'urgent' | 'warning' | 'normal' | 'missed';
  confidenceScore: number; // e.g. 92
  confidenceLevel: 'High' | 'Medium' | 'Low';
  occupancyStatus: OccupancyStatus;
  occupancyPercent: number;
  alternativeBus?: {
    busNumber: string;
    routeCode: string;
    etaMinutes: number;
    occupancyPercent: number;
    reason: string;
  };
  approachingAlertMessage?: string;
  isMissed: boolean;
}

export interface DigitalBusPass {
  id: string;
  passNumber: string; // BLR-PASS-88492
  studentId: string;
  studentName: string;
  studentCode: string; // BLR-2024-CS042
  department: string;
  academicYear: string;
  routeCode: string;
  routeName: string;
  validFrom: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  qrVerificationCode: string;
  photoUrl: string;
  emergencyContact: string;
}

export interface PassVerificationLog {
  id: string;
  passId: string;
  studentName: string;
  studentCode: string;
  driverId: string;
  busId: string;
  verifiedAt: string;
  result: 'VALID' | 'INVALID' | 'EXPIRED';
  locationName: string;
}

export interface Trip {
  id: string;
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  driverId: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentOccupancy: number;
  peakOccupancy: number;
  delayMinutes: number;
  distanceCoveredKm: number;
  events: TripEvent[];
}

export interface TripEvent {
  id: string;
  tripId: string;
  type: 'STARTED' | 'STOP_ARRIVED' | 'STOP_DEPARTED' | 'DELAY_RECORDED' | 'OCCUPANCY_CHANGED' | 'EMERGENCY_TRIGGERED' | 'COMPLETED';
  message: string;
  timestamp: string;
  location?: { lat: number; lng: number };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'APPROACHING' | 'DELAY' | 'ANNOUNCEMENT' | 'EMERGENCY' | 'PASS' | 'RECOMMENDATION';
  timestamp: string;
  read: boolean;
  busId?: string;
  routeId?: string;
  targetRole?: UserRole | 'all';
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'GENERAL' | 'DELAY' | 'WEATHER' | 'ROUTE_CHANGE' | 'URGENT';
  targetAudience: 'all' | 'route' | 'bus' | 'stop';
  targetValue?: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface RouteDisruption {
  id: string;
  routeId: string;
  stopId?: string;
  type: 'TRAFFIC' | 'ROAD_BLOCK' | 'ACCIDENT' | 'WEATHER' | 'MAINTENANCE';
  title: string;
  description: string;
  estimatedDelayMinutes: number;
  reportedAt: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface StudentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  busId?: string;
  routeId?: string;
  rating: number; // 1 to 5
  issueType: 'Bus Late' | 'Bus Crowded' | 'Bus Missing' | 'Stop Issue' | 'Driver Behavior' | 'App Issue' | 'Other';
  comment: string;
  createdAt: string;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
}

export interface EmergencyAlert {
  id: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  routeCode: string;
  location: { lat: number; lng: number; address: string };
  reason: string;
  timestamp: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  resolvedAt?: string;
}

export interface AppState {
  currentUser: UserProfile;
  currentRole: UserRole;
  buses: Bus[];
  routes: CampusRoute[];
  stops: BusStop[];
  users: UserProfile[];
  passes: DigitalBusPass[];
  verificationLogs: PassVerificationLog[];
  announcements: Announcement[];
  emergencyAlerts: EmergencyAlert[];
  feedbackList: StudentFeedback[];
  notifications: NotificationItem[];
  disruptions: RouteDisruption[];
  trips: Trip[];
  activeTripIdByBus: Record<string, string>;
  isSimulationRunning: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  selectedStopId: string;
  selectedBusId: string;
  isDarkMode: boolean;
  lastSyncTimestamp: number;
}
