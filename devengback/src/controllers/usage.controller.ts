// src/controllers/usage.controller.ts

import { Request, Response } from 'express';
import { IUser } from '../models/User';
// Old: import SubscriptionLimitsService from '../services/subscription-limits.service';
// New:
import { BillingService } from '../services/billing.service'; // NEW: Import the unified BillingService
// Old: import UserSubscription from '../models/UserSubscription'; // No longer needed directly in controller

// NEW: Instantiate the BillingService

/**
 * Get the user's usage statistics and limits
 */
export const getUserUsageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser;

    // Old: const stats = await SubscriptionLimitsService.getUserUsageStats(user.id);
    // Old: const userSubscription = await UserSubscription.findOne({ where: { userId: user.id } });
    // New:
    const stats = await BillingService.getUserUsageStats(user.id); // NEW: Use BillingService

    res.json({
      success: true,
      stats,
      // Old: tier: userSubscription?.tier || 'free', // Get tier from UserSubscription
      // Old: status: userSubscription?.status || 'free', // Get status from UserSubscription
      // NEW: tier and status are now included directly in the stats object from BillingService
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
};

/**
 * Check if user can create a new template (e.g., Casts, Protocols)
 * Expects a query parameter `type` like '?type=cast' or '?type=protocol'
 */
export const checkTemplateLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser;
    // NEW: Expect templateType from query params
    const templateType = req.query.type as 'cast' | 'protocol';

    if (!templateType) {
      res.status(400).json({
        allowed: false,
        reason: 'Template type (e.g., cast, protocol) is required as a query parameter.',
      });
      return;
    }

    // Old: const result = await SubscriptionLimitsService.canCreateTemplate(user.id);
    // New:
    const result = await BillingService.canCreateTemplate(user.id, templateType); // NEW: Pass templateType

    res.json(result);
  } catch (error) {
    console.error('Error checking template limit:', error);
    res.status(500).json({ error: 'Failed to check template limit' });
  }
};

/**
 * Check if user can generate AI content (e.g., if they have enough Ducks)
 * This is a general check for the UI to disable/enable AI features.
 * The actual deduction happens in `addMessage`.
 */
export const checkAIGenerationLimit = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser;

    const estimatedTokens = parseInt(req.query.estimatedTokens as string) || 10; // Default to 10 tokens for a quick check
    const interactionType = (req.query.interactionType as string) || 'chat';
    const modelUsed = (req.query.modelUsed as string) || 'gemini-pro'; // Default model

    const result = await BillingService.canGenerateAI(
      user.id,
      estimatedTokens,
      interactionType,
      modelUsed
    );

    res.json(result);
  } catch (error) {
    console.error('Error checking AI generation limit:', error);
    res.status(500).json({ error: 'Failed to check AI generation limit' });
  }
};

/**
 * Check if user has access to a specific AI model
 */
export const checkModelAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = req.user as IUser;
    const { modelName } = req.params;

    if (!modelName) {
      res.status(400).json({ error: 'Model name is required' });
      return;
    }

    // Old: const result = await SubscriptionLimitsService.hasModelAccess(user.id, modelName);
    // New:
    const result = await BillingService.hasModelAccess(user.id, modelName); // NEW: Use BillingService

    res.json(result);
  } catch (error) {
    console.error('Error checking model access:', error);
    res.status(500).json({ error: 'Failed to check model access' });
  }
};
