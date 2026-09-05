import { Request, Response, NextFunction } from "express";
import { AnalyticsService, AnalyticsRange } from "../services/analytics.service";

export class AnalyticsController {
  static async getRestaurantAnalytics(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const rangeQuery = (req.query.range || req.query.timeRange || "7d") as string;

      const validRanges: AnalyticsRange[] = ["today", "7d", "30d", "all"];
      const range: AnalyticsRange = validRanges.includes(rangeQuery as AnalyticsRange)
        ? (rangeQuery as AnalyticsRange)
        : "7d";

      const analytics = await AnalyticsService.getRestaurantAnalytics(id, range);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
