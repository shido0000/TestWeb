// ============================================
// Billing Controller
// ============================================

import { Controller, Get, Post, Put, Delete, Param, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { BillingService } from './billing.service';
import Stripe from 'stripe';

@Controller('billing')
export class BillingController {
  private stripe: Stripe;

  constructor(private readonly billingService: BillingService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  @Get('plans')
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string) {
    return this.billingService.getPlan(id);
  }

  @Post('subscriptions')
  async createSubscription(
    @Body('tenantId') tenantId: string,
    @Body('planId') planId: string,
    @Body('interval') interval: 'monthly' | 'yearly',
    @Body('paymentMethodId') paymentMethodId: string
  ) {
    return this.billingService.createSubscription(tenantId, planId, interval, paymentMethodId);
  }

  @Get('subscriptions/:tenantId')
  async getSubscription(@Param('tenantId') tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @Post('subscriptions/:tenantId/cancel')
  async cancelSubscription(
    @Param('tenantId') tenantId: string,
    @Body('immediate') immediate?: boolean
  ) {
    return this.billingService.cancelSubscription(tenantId, immediate);
  }

  @Put('subscriptions/:tenantId/change-plan')
  async changePlan(
    @Param('tenantId') tenantId: string,
    @Body('newPlanId') newPlanId: string
  ) {
    return this.billingService.changePlan(tenantId, newPlanId);
  }

  @Post('payment-methods')
  async addPaymentMethod(
    @Body('tenantId') tenantId: string,
    @Body('stripePaymentMethodId') stripePaymentMethodId: string
  ) {
    return this.billingService.addPaymentMethod(tenantId, stripePaymentMethodId);
  }

  @Get('payment-methods/:tenantId')
  async getPaymentMethods(@Param('tenantId') tenantId: string) {
    return this.billingService.getPaymentMethods(tenantId);
  }

  @Put('payment-methods/:tenantId/:id/default')
  async setDefaultPaymentMethod(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string
  ) {
    return this.billingService.setDefaultPaymentMethod(tenantId, id);
  }

  @Delete('payment-methods/:tenantId/:id')
  async removePaymentMethod(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string
  ) {
    return this.billingService.removePaymentMethod(tenantId, id);
  }

  @Get('invoices/:tenantId')
  async getInvoices(@Param('tenantId') tenantId: string) {
    return this.billingService.getInvoices(tenantId);
  }

  @Get('invoices/:id/pdf')
  async getInvoicePdf(@Param('id') id: string) {
    const buffer = await this.billingService.getInvoicePdf(id);
    return {
      contentType: 'application/pdf',
      data: buffer.toString('base64'),
    };
  }

  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<any>
  ) {
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    await this.billingService.handleStripeWebhook(event);

    return { received: true };
  }
}
