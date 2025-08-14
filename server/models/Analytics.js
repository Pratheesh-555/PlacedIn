import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  metrics: {
    dailyActiveUsers: {
      type: Number,
      default: 0
    },
    newRegistrations: {
      type: Number,
      default: 0
    },
    experiencesSubmitted: {
      type: Number,
      default: 0
    },
    experiencesApproved: {
      type: Number,
      default: 0
    },
    experiencesRejected: {
      type: Number,
      default: 0
    },
    pageViews: {
      type: Number,
      default: 0
    },
    searchQueries: {
      type: Number,
      default: 0
    },
    topCompanies: [{
      name: String,
      count: Number
    }],
    topGraduationYears: [{
      year: Number,
      count: Number
    }]
  },
  performance: {
    avgResponseTime: {
      type: Number,
      default: 0
    },
    errorRate: {
      type: Number,
      default: 0
    },
    uptime: {
      type: Number,
      default: 100
    }
  }
}, {
  timestamps: true
});

// Unique index to prevent duplicate daily records
AnalyticsSchema.index({ date: 1 }, { unique: true });

// Static method to update daily metrics
AnalyticsSchema.statics.updateDailyMetrics = async function(date, metrics) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  return this.findOneAndUpdate(
    { date: dayStart },
    { 
      $inc: metrics,
      $setOnInsert: { date: dayStart }
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

export default mongoose.model('Analytics', AnalyticsSchema);
