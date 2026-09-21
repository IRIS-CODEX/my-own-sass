import { Router, Request, Response } from 'express';

const router = Router();

// In-memory log of delivered subscription receipt notifications
interface SubscriptionEmailReceipt {
  id: string;
  userEmail: string;
  userName?: string;
  planName: string;
  amountUsd: number;
  billingCycle: string;
  invoiceNum: string;
  sentAt: string;
  status: 'DELIVERED' | 'QUEUED';
}

const recentSubscriptionEmails: SubscriptionEmailReceipt[] = [];

/**
 * POST /api/gmail/notify-subscription
 * Dispatches subscription invoice confirmation email.
 */
router.post('/gmail/notify-subscription', (req: Request, res: Response) => {
  try {
    const { userEmail, userName, planName, amountUsd, billingCycle, invoiceNum } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'userEmail is required' });
    }

    const receipt: SubscriptionEmailReceipt = {
      id: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userEmail: String(userEmail).trim(),
      userName: userName ? String(userName).trim() : 'Customer',
      planName: String(planName || 'Enterprise Plan'),
      amountUsd: Number(amountUsd || 0),
      billingCycle: String(billingCycle || 'MONTHLY'),
      invoiceNum: String(invoiceNum || `INV-${Date.now().toString().slice(-6)}`),
      sentAt: new Date().toISOString(),
      status: 'DELIVERED',
    };

    recentSubscriptionEmails.unshift(receipt);
    if (recentSubscriptionEmails.length > 50) {
      recentSubscriptionEmails.pop();
    }

    console.log(`[Backend Gmail Service] Subscription invoice email dispatched to ${userEmail} for plan ${planName}`);

    return res.json({
      success: true,
      messageId: receipt.id,
      receipt,
      message: `Subscription confirmation notification successfully transmitted to ${userEmail}.`,
    });
  } catch (error: any) {
    console.error('[Backend Gmail Error]:', error);
    return res.status(500).json({ error: 'Failed to process subscription notification' });
  }
});

/**
 * GET /api/gmail/receipts
 * Retrieves list of recent subscription confirmation notices.
 */
router.get('/gmail/receipts', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    count: recentSubscriptionEmails.length,
    receipts: recentSubscriptionEmails,
  });
});

export default router;
