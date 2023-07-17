import type router from '@logto/cloud/routes';
import { type GuardedResponse, type RouterRoutes } from '@withtyped/client';

type GetRoutes = RouterRoutes<typeof router>['get'];

export type SubscriptionPlanResponse = GuardedResponse<
  GetRoutes['/api/subscription-plans']
>[number];

export type Subscription = GuardedResponse<GetRoutes['/api/tenants/:tenantId/subscription']>;