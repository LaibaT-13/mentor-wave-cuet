/* ============================================
   Mentor Wave CUET - Configuration File
   Modify these values to customize the app
   ============================================ */

// Application Configuration
const APP_CONFIG = {
    // Application Info
    appName: "Mentor Wave CUET",
    appVersion: "1.0.0",
    appDescription: "CUET-Based Tutor Finding Platform",
    
    // Contact Information
    contactEmail: "info@mentorwavecuet.com",
    contactPhone: "+880 1XXX-XXXXXX",
    
    // Validation Rules
    validation: {
        minPasswordLength: 8,
        cuetEmailDomain: "@student.cuet.ac.bd",
        phonePattern: /^[0-9+\s-]+$/,
        minSalary: 3000,
        maxSalary: 20000
    },
    
    // Feature Flags
    features: {
        enableMessaging: true,
        enableNotifications: true,
        enableProfilePictures: false, // Future feature
        enableRatings: false, // Future feature
        enablePayments: false // Future feature
    },
    
    // UI Settings
    ui: {
        itemsPerPage: 10,
        maxRecentActivity: 5,
        notificationDuration: 3000, // milliseconds
        animationSpeed: 300 // milliseconds
    },

    // EmailJS configuration for client-side email sending (optional)
    // To enable, set `enabled: true` and fill `serviceId`, `templateId`, and `userId`.
    emailJs: {
        enabled: false,
        serviceId: "", // e.g., 'service_xxx'
        templateId: "", // e.g., 'template_xxx'
        userId: "", // public user id from EmailJS
        // template params mapping (optional)
        // e.g., { to_email: 'to_email', code: 'code', app_name: 'app_name' }
        templateParams: {
            to_email: 'to_email',
            code: 'code',
            app_name: 'app_name'
        }
    },
    
    // Date/Time Formats
    dateFormat: {
        short: "MM/DD/YYYY",
        long: "MMMM DD, YYYY",
        time: "hh:mm A"
    }
};

// Department List (CUET)
const DEPARTMENTS = [
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "EEE", name: "Electrical & Electronic Engineering" },
    { code: "ME", name: "Mechanical Engineering" },
    { code: "CE", name: "Civil Engineering" },
    { code: "URP", name: "Urban & Regional Planning" },
    { code: "ARCH", name: "Architecture" },
    { code: "IPE", name: "Industrial & Production Engineering" },
    { code: "ChE", name: "Chemical Engineering" },
    { code: "MME", name: "Materials & Metallurgical Engineering" },
    { code: "PME", name: "Petroleum & Mining Engineering" }
];

// Subject List
const SUBJECTS = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Bangla",
    "ICT",
    "Higher Mathematics",
    "Accounting",
    "Business Studies"
];

// Class Levels
const CLASS_LEVELS = [
    { value: "6", label: "Class 6" },
    { value: "7", label: "Class 7" },
    { value: "8", label: "Class 8" },
    { value: "9", label: "Class 9" },
    { value: "10", label: "Class 10" },
    { value: "11", label: "HSC 1st Year" },
    { value: "12", label: "HSC 2nd Year" }
];

// Medium Options
const MEDIUM_OPTIONS = [
    { value: "bangla", label: "Bangla Medium" },
    { value: "english", label: "English Medium" },
    { value: "english-version", label: "English Version" }
];

// Location Areas (Chittagong)
const LOCATION_AREAS = [
    "Agrabad",
    "Nasirabad",
    "Khulshi",
    "Panchlaish",
    "Halishahar",
    "Chawkbazar",
    "Kotwali",
    "Pahartali",
    "Bayezid Bostami",
    "GEC Circle",
    "Muradpur",
    "Oxygen"
];

// Salary Ranges (Monthly, in BDT)
const SALARY_RANGES = {
    class6to8: { min: 4000, max: 6000, label: "Class 6-8" },
    class9to10: { min: 6000, max: 9000, label: "Class 9-10" },
    hsc: { min: 8000, max: 12000, label: "HSC" },
    special: { min: 10000, max: 15000, label: "Special/Advanced" }
};

// Days Per Week Options
const DAYS_PER_WEEK = [2, 3, 4, 5, 6, 7];

// Hours Per Day Options
const HOURS_PER_DAY = [1, 1.5, 2, 2.5, 3];

// Gender Options
const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" }
];

// User Roles
const USER_ROLES = {
    TUTOR: "tutor",
    GUARDIAN: "guardian",
    ADMIN: "admin"
};

// Status Types
const STATUS_TYPES = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    VERIFIED: "verified",
    REJECTED: "rejected"
};

// Message Status
const MESSAGE_STATUS = {
    SENT: "sent",
    DELIVERED: "delivered",
    READ: "read"
};

// Default User Profile
const DEFAULT_PROFILE = {
    tutor: {
        subjects: [],
        classes: [],
        salary: "5000-10000",
        areas: "",
        experience: "",
        bio: "",
        phoneVisible: false,
        emailVisible: true,
        profileActive: true
    },
    guardian: {
        preferredLocation: "",
        budgetRange: ""
    }
};

// Sample Notification Messages
const NOTIFICATION_MESSAGES = {
    loginSuccess: "Login successful! Redirecting...",
    loginError: "Invalid credentials. Please try again.",
    registrationSuccess: "Registration successful! Please wait for admin verification.",
    profileUpdated: "Profile updated successfully!",
    tuitionPosted: "Tuition posted successfully! It will be visible after review.",
    interestSent: "Your interest has been sent to the guardian!",
    tutorApproved: "Tutor approved successfully!",
    tutorRejected: "Tutor rejected",
    messageSent: "Message sent successfully!",
    logoutSuccess: "Logged out successfully"
};

// API Endpoints (for future backend integration)
const API_ENDPOINTS = {
    // Authentication
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    
    // Tutors
    getTutors: "/api/tutors",
    getTutorById: "/api/tutors/:id",
    updateTutor: "/api/tutors/:id",
    verifyTutor: "/api/tutors/:id/verify",
    
    // Guardians
    getGuardians: "/api/guardians",
    getGuardianById: "/api/guardians/:id",
    updateGuardian: "/api/guardians/:id",
    
    // Tuitions
    getTuitions: "/api/tuitions",
    getTuitionById: "/api/tuitions/:id",
    createTuition: "/api/tuitions",
    updateTuition: "/api/tuitions/:id",
    deleteTuition: "/api/tuitions/:id",
    
    // Messages
    getMessages: "/api/messages",
    sendMessage: "/api/messages",
    markAsRead: "/api/messages/:id/read",
    
    // Admin
    getPendingVerifications: "/api/admin/verifications",
    getReports: "/api/admin/reports",
    getStatistics: "/api/admin/statistics"
};

// EmailJS (client-side email sending) configuration
// To enable real email sending with EmailJS:
// 1. Sign up at https://www.emailjs.com and create an email service + template.
// 2. Set `service_id`, `template_id`, and `public_key` below.
// 3. The template should expect `to_email`, `to_name`, and `code` variables.
const EMAILJS_CONFIG = {
    enabled: false, // set to true after adding your EmailJS credentials
    service_id: "your_service_id",
    template_id: "your_template_id",
    public_key: "your_public_key"
};

// Simple server email sending configuration (use the Express server in /server)
const SERVER_EMAIL_CONFIG = {
    enabled: false, // set to true to enable server-side sending
    endpoint: "http://localhost:3001/send-verification" // change if server runs elsewhere
};

// LocalStorage Keys
const STORAGE_KEYS = {
    currentUser: "currentUser",
    tutors: "tutors",
    guardians: "guardians",
    tuitions: "tuitions",
    messages: "messages",
    preferences: "userPreferences"
};

// Error Messages
const ERROR_MESSAGES = {
    invalidEmail: "Please enter a valid email address",
    invalidCuetEmail: "Email must be a valid @student.cuet.ac.bd address",
    passwordTooShort: "Password must be at least 8 characters",
    passwordMismatch: "Passwords do not match",
    requiredField: "This field is required",
    invalidPhone: "Please enter a valid phone number",
    noSubjectSelected: "Please select at least one subject",
    networkError: "Network error. Please try again.",
    unauthorized: "You are not authorized to perform this action"
};

// Success Messages
const SUCCESS_MESSAGES = {
    profileSaved: "Profile saved successfully",
    tuitionCreated: "Tuition post created successfully",
    messageSent: "Message sent successfully",
    applicationSubmitted: "Application submitted successfully"
};

// Regular Expressions for Validation
const REGEX_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    cuetEmail: /^[a-zA-Z0-9._%+-]+@student\.cuet\.ac\.bd$/,
    phone: /^(\+88)?01[0-9]{9}$/,
    studentId: /^\d{7}$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
};

// Export configuration (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        DEPARTMENTS,
        SUBJECTS,
        CLASS_LEVELS,
        MEDIUM_OPTIONS,
        LOCATION_AREAS,
        SALARY_RANGES,
        DAYS_PER_WEEK,
        HOURS_PER_DAY,
        GENDER_OPTIONS,
        USER_ROLES,
        STATUS_TYPES,
        MESSAGE_STATUS,
        DEFAULT_PROFILE,
        NOTIFICATION_MESSAGES,
        API_ENDPOINTS,
        STORAGE_KEYS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        REGEX_PATTERNS
    };
}

// Helper Functions for Configuration
const ConfigHelper = {
    /**
     * Get department name by code
     */
    getDepartmentName(code) {
        const dept = DEPARTMENTS.find(d => d.code === code);
        return dept ? dept.name : code;
    },
    
    /**
     * Get class label by value
     */
    getClassLabel(value) {
        const classLevel = CLASS_LEVELS.find(c => c.value === value);
        return classLevel ? classLevel.label : `Class ${value}`;
    },
    
    /**
     * Get salary range for class
     */
    getSalaryRange(classValue) {
        const classNum = parseInt(classValue);
        if (classNum >= 6 && classNum <= 8) return SALARY_RANGES.class6to8;
        if (classNum >= 9 && classNum <= 10) return SALARY_RANGES.class9to10;
        if (classNum >= 11 && classNum <= 12) return SALARY_RANGES.hsc;
        return SALARY_RANGES.special;
    },
    
    /**
     * Validate email based on role
     */
    validateEmail(email, role) {
        if (role === USER_ROLES.TUTOR) {
            return REGEX_PATTERNS.cuetEmail.test(email);
        }
        return REGEX_PATTERNS.email.test(email);
    },
    
    /**
     * Format phone number
     */
    formatPhone(phone) {
        // Remove all non-digit characters except +
        let cleaned = phone.replace(/[^\d+]/g, '');
        
        // Format as +880 1XXX-XXXXXX
        if (cleaned.startsWith('+880')) {
            return cleaned.slice(0, 4) + ' ' + 
                   cleaned.slice(4, 8) + '-' + 
                   cleaned.slice(8);
        }
        return phone;
    },
    
    /**
     * Format salary
     */
    formatSalary(amount) {
        return `৳${amount.toLocaleString()}/month`;
    }
};
