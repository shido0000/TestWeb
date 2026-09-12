// ============================================
// Billing Service with Stripe Integration
// ============================================
// Subscription management, payments, and invoicing

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

interface BillingPlan {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  limits: {
    scans: number;
    findings: number;
    storageMB: number;
    apiCalls: number;
    teamMembers: number;
    projects: number;
  };
  stripePriceId?: { monthly: string; yearly: string };
}

interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
}

interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceDate: Date;
  dueDate: Date;
  pdfUrl?: string;
  stripeInvoiceId?: string;
}

interface PaymentMethod {
  id: string;
  tenantId: string;
  type: 'card' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  // ============================================
  // PLAN MANAGEMENT
  // ============================================

  getPlans(): BillingPlan[] {
    return [
      {
        id: 'free',
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        features: [
          '50 scans/month',
          '500 findings stored',
          '1 GB storage',
          '5,000 API calls',
          '2 team members',
          '3 projects',
          'Community support',
          'Basic test suites',
        ],
        limits: {
          scans: 50,
          findings: 500,
          storageMB: 1000,
          apiCalls: 5000,
          teamMembers: 2,
          projects: 3,
        },
      },
      {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 99, yearly: 990 },
        features: [
          '1,000 scans/month',
          '10,000 findings stored',
          '20 GB storage',
          '100,000 API calls',
          '10 team members',
          '20 projects',
          'Priority support',
          'All test suites',
          'AI prioritization',
          'CI/CD integrations',
          'Custom reports',
        ],
        limits: {
          scans: 1000,
          findings: 10000,
          storageMB: 20000,
          apiCalls: 100000,
          teamMembers: 10,
          projects: 20,
        },
        stripePriceId: {
          monthly: 'price_pro_monthly',
          yearly: 'price_pro_yearly',
        },
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: { monthly: 499, yearly: 4990 },
        features: [
          '5,000 scans/month',
          '50,000 findings stored',
          '100 GB storage',
          '500,000 API calls',
          '50 team members',
          '100 projects',
          'Dedicated support',
          'All Pro features',
          'SSO/SAML',
          'Audit logs',
          'Custom domain',
          'SLA 99.9%',
          'On-premise option',
          'Custom integrations',
        ],
        limits: {
          scans: 5000,
          findings: 50000,
          storageMB: 100000,
          apiCalls: 500000,
          teamMembers: 50,
          projects: 100,
        },
        stripePriceId: {
          monthly: 'price_enterprise_monthly',
          yearly: 'price_enterprise_yearly',
        },
      },
    ];
  }

  getPlan(planId: string): BillingPlan {
    const plan = this.getPlans().find(p => p.id === planId);
    if (!plan) {
      throw new NotFoundException(`Plan '${planId}' not found`);
    }
    return plan;
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  async createSubscription(
    tenantId: string,
    planId: string,
    interval: 'monthly' | 'yearly',
    paymentMethodId: string
  ): Promise<Subscription> {
    const plan = this.getPlan(planId);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = tenant.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        name: tenant.name,
        email: tenant.billingEmail,
        metadata: { tenantId },
      });
      stripeCustomerId = customer.id;

      await this.prisma.tenant.update({
        where: { id: tenantId },
         { stripeCustomerId },
      });
    }

    // Attach payment method
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default payment method
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const priceId = plan.stripePriceId?.[interval];
    if (!priceId) {
      throw new BadRequestException('Stripe price ID not configured for this plan');
    }

    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Calculate period dates
    const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

    // Save subscription to database
    const subscription = await this.prisma.subscription.create({
       {
        tenantId,
        planId,
        status: stripeSubscription.status as Subscription['status'],
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: stripeSubscription.id,
      },
    });

    // Update tenant plan
    await this.prisma.tenant.update({
      where: { id: tenantId },
       { plan: planId },
    });

    return {
      id: subscription.id,
      tenantId: subscription.tenantId,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    };
  }

  async getSubscription(tenantId: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) return null;

    return {
      id: subscription.id,
      tenantId: subscription.tenantId,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    };
  }

  async cancelSubscription(tenantId: string, immediate: boolean = false): Promise<Subscription> {
    const subscription = await this.getSubscription(tenantId);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.stripeSubscriptionId) {
      if (immediate) {
        await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } else {
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      }
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
       {
        status: immediate ? 'canceled' : subscription.status,
        cancelAtPeriodEnd: !immediate,
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      planId: updated.planId,
      status: updated.status,
      currentPeriodStart: updated.currentPeriodStart,
      currentPeriodEnd: updated.currentPeriodEnd,
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      stripeSubscriptionId: updated.stripeSubscriptionId,
    };
  }

  async changePlan(tenantId: string, newPlanId: string): Promise<Subscription> {
    const subscription = await this.getSubscription(tenantId);
    
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundException('Active subscription not found');
    }

    const newPlan = this.getPlan(newPlanId);
    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Determine interval from current subscription
    const currentItem = stripeSubscription.items. [0];
    const interval = currentItem.price.recurring?.interval || 'month';

    const newPriceId = newPlan.stripePriceId?.[interval === 'month' ? 'monthly' : 'yearly'];
    if (!newPriceId) {
      throw new BadRequestException('New plan price ID not configured');
    }

    // Update subscription item
    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: currentItem.id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    // Update database
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
       { planId: newPlanId },
    });

    // Update tenant plan
    await this.prisma.tenant.update({
      where: { id: tenantId },
       { plan: newPlanId },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      planId: updated.planId,
      status: updated.status,
      currentPeriodStart: updated.currentPeriodStart,
      currentPeriodEnd: updated.currentPeriodEnd,
      cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      stripeSubscriptionId: updated.stripeSubscriptionId,
    };
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================

  async addPaymentMethod(
    tenantId: string,
    stripePaymentMethodId: string
  ): Promise<PaymentMethod> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.stripeCustomerId) {
      throw new NotFoundException('Tenant or Stripe customer not found');
    }

    // Retrieve payment method details from Stripe
    const pm = await this.stripe.paymentMethods.retrieve(stripePaymentMethodId);

    // Attach to customer
    await this.stripe.paymentMethods.attach(stripePaymentMethodId, {
      customer: tenant.stripeCustomerId,
    });

    // Check if this is the first payment method
    const existingMethods = await this.prisma.paymentMethod.count({
      where: { tenantId },
    });

    const paymentMethod = await this.prisma.paymentMethod.create({
       {
        tenantId,
        type: pm.type as PaymentMethod['type'],
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: existingMethods === 0,
        stripePaymentMethodId,
      },
    });

    return {
      id: paymentMethod.id,
      tenantId: paymentMethod.tenantId,
      type: paymentMethod.type,
      last4: paymentMethod.last4,
      brand: paymentMethod.brand,
      expMonth: paymentMethod.expMonth,
      expYear: paymentMethod.expYear,
      isDefault: paymentMethod.isDefault,
      stripePaymentMethodId: paymentMethod.stripePaymentMethodId,
    };
  }

  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { tenantId },
      orderBy: { isDefault: 'desc' },
    });

    return methods.map(m => ({
      id: m.id,
      tenantId: m.tenantId,
      type: m.type,
      last4: m.last4,
      brand: m.brand,
      expMonth: m.expMonth,
      expYear: m.expYear,
      isDefault: m.isDefault,
      stripePaymentMethodId: m.stripePaymentMethodId,
    }));
  }

  async setDefaultPaymentMethod(tenantId: string, paymentMethodId: string): Promise<void> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, tenantId },
    });

    if (!paymentMethod || !paymentMethod.stripePaymentMethodId) {
      throw new NotFoundException('Payment method not found');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.stripeCustomerId) {
      throw new NotFoundException('Tenant or Stripe customer not found');
    }

    // Update in Stripe
    await this.stripe.customers.update(tenant.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.stripePaymentMethodId,
      },
    });

    // Update in database
    await this.prisma.paymentMethod.updateMany({
      where: { tenantId },
       { isDefault: false },
    });

    await this.prisma.paymentMethod.update({
      where: { id: paymentMethodId },
       { isDefault: true },
    });
  }

  async removePaymentMethod(tenantId: string, paymentMethodId: string): Promise<void> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, tenantId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.isDefault) {
      throw new BadRequestException('Cannot remove default payment method');
    }

    // Detach from Stripe
    if (paymentMethod.stripePaymentMethodId) {
      await this.stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
    }

    await this.prisma.paymentMethod.delete({
      where: { id: paymentMethodId },
    });
  }

  // ============================================
  // INVOICES
  // ============================================

  async getInvoices(tenantId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { invoiceDate: 'desc' },
    });

    return invoices.map(i => ({
      id: i.id,
      tenantId: i.tenantId,
      subscriptionId: i.subscriptionId,
      amount: i.amount,
      currency: i.currency,
      status: i.status,
      invoiceDate: i.invoiceDate,
      dueDate: i.dueDate,
      pdfUrl: i.pdfUrl,
      stripeInvoiceId: i.stripeInvoiceId,
    }));
  }

  async getInvoicePdf(invoiceId: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || !invoice.stripeInvoiceId) {
      throw new NotFoundException('Invoice not found');
    }

    // Retrieve invoice from Stripe
    const stripeInvoice = await this.stripe.invoices.retrieve(invoice.stripeInvoiceId);

    if (!stripeInvoice.invoice_pdf) {
      throw new BadRequestException('Invoice PDF not available');
    }

    // Download PDF
    const response = await fetch(stripeInvoice.invoice_pdf);
    const buffer = Buffer.from(await response.arrayBuffer());

    return buffer;
  }

  // ============================================
  // WEBHOOK HANDLERS
  // ============================================

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'invoice.paid':
        await this.handleInvoicePaid(event. as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event. as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event. as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event. as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (!subscription) return;

    await this.prisma.invoice.create({
       {
        tenantId: subscription.tenantId,
        subscriptionId: subscription.id,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency,
        status: 'paid',
        invoiceDate: new Date(invoice.created * 1000),
        dueDate: new Date(invoice.due_date! * 1000),
        pdfUrl: invoice.invoice_pdf,
        stripeInvoiceId: invoice.id,
      },
    });
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
    });

    if (!subscription) return;

    await this.prisma.invoice.create({
       {
        tenantId: subscription.tenantId,
        subscriptionId: subscription.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        status: 'failed',
        invoiceDate: new Date(invoice.created * 1000),
        dueDate: new Date(invoice.due_date! * 1000),
        stripeInvoiceId: invoice.id,
      },
    });

    // Mark subscription as past_due
    await this.prisma.subscription.update({
      where: { id: subscription.id },
       { status: 'past_due' },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
       {
        status: subscription.status as Subscription['status'],
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
       { status: 'canceled' },
    });
  }
}
