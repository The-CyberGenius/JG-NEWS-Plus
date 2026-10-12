import mongoose from 'mongoose';

const loginSessionSchema = new mongoose.Schema({
    role: { 
        type: String, 
        required: true, 
        enum: ['admin', 'subadmin', 'super_super_admin'],
    },
    token: { 
        type: String, 
        required: true, 
        index: true 
    },
    ip: { 
        type: String, 
        default: 'Unknown' 
    },
    userAgent: { 
        type: String, 
        default: '' 
    },
    device: { 
        type: String, 
        default: 'Desktop' 
    },
    loginTime: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    lastActive: { 
        type: Date, 
        default: Date.now 
    },
    isActive: { 
        type: Boolean, 
        default: true, 
        index: true 
    },
    loggedOutAt: { 
        type: Date 
    },
    logoutReason: { 
        type: String, 
        default: '' 
    }, // 'user_logout' | 'force_logout_by_super_admin'
}, { timestamps: true });

export default mongoose.model('LoginSession', loginSessionSchema);
