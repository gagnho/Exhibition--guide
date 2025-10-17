const Visitor = require('../models/Visitor');
const Project = require('../models/Project');

class AnalyticsService {
    async getDashboardStats() {
        try {
            const [totalVisitors, activeProjects, visitorStats] = await Promise.all([
                Visitor.countDocuments(),
                Project.countDocuments(),
                this.getVisitorStats()
            ]);

            return {
                totalVisitors,
                activeProjects,
                averageVisitDuration: visitorStats.averageDuration,
                popularProjects: await this.getPopularProjects(),
                visitorTrends: await this.getVisitorTrends(),
                realtimeActivity: await this.getRealtimeActivity()
            };
        } catch (error) {
            throw new Error('Error fetching analytics: ' + error.message);
        }
    }

    async getVisitorStats() {
        const stats = await Visitor.aggregate([
            {
                $match: {
                    exitTime: { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    averageDuration: {
                        $avg: {
                            $divide: [
                                { $subtract: ['$exitTime', '$entryTime'] },
                                60000 // Convert to minutes
                            ]
                        }
                    }
                }
            }
        ]);

        return {
            averageDuration: stats[0]?.averageDuration || 0
        };
    }

    async getVisitorTrends() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return await Visitor.aggregate([
            {
                $match: {
                    entryTime: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$entryTime' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);
    }

    async getPopularProjects() {
        return await Project.aggregate([
            {
                $lookup: {
                    from: 'visits',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'visits'
                }
            },
            {
                $project: {
                    title: 1,
                    visitCount: { $size: '$visits' }
                }
            },
            {
                $sort: { visitCount: -1 }
            },
            {
                $limit: 5
            }
        ]);
    }

    async getRealtimeActivity() {
        return await Visitor.find()
            .sort({ entryTime: -1 })
            .limit(10)
            .select('location entryTime');
    }
}

module.exports = new AnalyticsService();
