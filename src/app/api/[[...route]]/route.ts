/**
 * Main Hono API Router for Next.js App Router
 * Using complete handler imports and following Hono docs
 */

import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import {
  corsMiddleware,
  loggerMiddleware,
  securityMiddleware,
  rateLimit,
  requireAuth,
  optionalAuth,
} from '@/lib/api/middleware.ts';
import { errorHandler } from '@/middlewares/errorHandler';
import { testDatabaseConnection } from '@/lib/api/database.ts';
import { successResponse } from '@/lib/api/responses.ts';

// Import all handlers
import * as authHandlers from '@/lib/api/handlers/auth.ts';
import * as userHandlers from '@/lib/api/handlers/users.ts';
import * as emailHandlers from '@/lib/api/handlers/emails.ts';
import * as profileHandlers from '@/lib/api/handlers/profiles.ts';
import * as serviceHandlers from '@/lib/api/handlers/services.ts';
import * as reviewHandlers from '@/lib/api/handlers/reviews.ts';
import * as mediaHandlers from '@/lib/api/handlers/media.ts';
import * as chatHandlers from '@/lib/api/handlers/chats.ts';
import * as messageHandlers from '@/lib/api/handlers/messages.ts';

// Configure for Edge Runtime

// Initialize Hono app with base path
const app = new Hono().basePath('/api');

// Apply global middleware
app.use('*', corsMiddleware);
app.use('*', loggerMiddleware);
app.use('*', securityMiddleware);
app.use('*', rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// =============================================================================
// HEALTH & UTILITY ROUTES
// =============================================================================

app.get('/health', async (c) => {
  const dbStatus = await testDatabaseConnection();

  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbStatus ? 'connected' : 'disconnected',
    runtime: 'edge',
    environment: process.env.NODE_ENV,
  });
});

// =============================================================================
// EMAIL ROUTES
// =============================================================================

app.post('/send-email', ...emailHandlers.sendEmail);
app.post('/send-bulk-email', requireAuth, ...emailHandlers.sendBulkEmail);
app.post(
  '/test-email-connection',
  requireAuth,
  emailHandlers.testEmailConnection,
);
app.get('/email-templates', requireAuth, emailHandlers.getEmailTemplates);

// =============================================================================
// AUTH ROUTES (Better Auth Integration)
// =============================================================================

app.get('/auth/session', authHandlers.getSession);
app.post('/auth/signout', requireAuth, authHandlers.signOut);
app.patch('/auth/user-type', ...authHandlers.updateUserType);
app.get('/auth/me', requireAuth, authHandlers.getCurrentUser);
app.post('/auth/verify-email', requireAuth, authHandlers.verifyEmail);
app.post('/auth/forgot-password', ...authHandlers.forgotPassword);
app.post('/auth/reset-password', ...authHandlers.resetPassword);
app.get('/auth/providers', authHandlers.getProviders);
app.post('/auth/refresh', authHandlers.refreshSession);

// =============================================================================
// USER ROUTES
// =============================================================================

app.get('/users', ...userHandlers.getUsers);
app.get('/users/me/stats', requireAuth, userHandlers.getCurrentUserStats);
app.get('/users/by-type/:type', requireAuth, ...userHandlers.getUsersByType);
app.get('/users/:id', ...userHandlers.getUserById);
app.put('/users/me', requireAuth, ...userHandlers.updateCurrentUser);
app.patch(
  '/users/onboarding-step',
  requireAuth,
  ...userHandlers.updateOnboardingStep,
);
// app.put('/users/:id', requireAuth, ...userHandlers.updateUser);
app.delete('/users/:id', requireAuth, ...userHandlers.deleteUser);
app.post('/users/:id/activate', requireAuth, ...userHandlers.activateUser);

// =============================================================================
// PROFILE ROUTES
// =============================================================================

app.get('/profiles', ...profileHandlers.getProfiles);
app.get('/profiles/user/:userId', ...profileHandlers.getProfileByUserId);
app.get('/profiles/:id', ...profileHandlers.getProfileById);
app.post('/profiles', requireAuth, ...profileHandlers.createProfile);
// app.put('/profiles/:id', requireAuth, ...profileHandlers.updateProfile);
app.delete('/profiles/:id', requireAuth, ...profileHandlers.deleteProfile);
// app.post(
//   '/profiles/:id/toggle-published',
//   requireAuth,
//   ...profileHandlers.toggleProfilePublished,
// );

// =============================================================================
// SERVICE ROUTES
// =============================================================================

app.get('/services', ...serviceHandlers.getServices);
// app.get('/services/user/:userId', ...serviceHandlers.getServicesByUserId);
app.get('/services/:id', ...serviceHandlers.getServiceById);
app.post('/services', requireAuth, ...serviceHandlers.createService);
// app.put('/services/:id', requireAuth, ...serviceHandlers.updateService);
app.delete('/services/:id', requireAuth, ...serviceHandlers.deleteService);

// =============================================================================
// REVIEW ROUTES
// =============================================================================

app.get('/reviews', ...reviewHandlers.getReviews);
// app.get('/reviews/service/:serviceId', ...reviewHandlers.getReviewsByService);
// app.get('/reviews/user/:userId', ...reviewHandlers.getReviewsByUser);
app.get('/reviews/:id', ...reviewHandlers.getReviewById);
app.post('/reviews', requireAuth, ...reviewHandlers.createReview);
// app.put('/reviews/:id', requireAuth, ...reviewHandlers.updateReview);
app.delete('/reviews/:id', requireAuth, ...reviewHandlers.deleteReview);

// =============================================================================
// MEDIA ROUTES
// =============================================================================

app.get('/media', ...mediaHandlers.getMedia);
// app.get('/media/user/:userId', ...mediaHandlers.getMediaByUserId);
// app.get('/media/category/:category', ...mediaHandlers.getMediaByCategory);
app.get('/media/stats', requireAuth, mediaHandlers.getMediaStats);
app.get('/media/:id', ...mediaHandlers.getMediaById);
app.post('/media/upload', requireAuth, ...mediaHandlers.uploadMedia);
// app.put('/media/:id', requireAuth, ...mediaHandlers.updateMedia);
app.delete('/media/:id', requireAuth, ...mediaHandlers.deleteMedia);
app.post('/media/bulk-delete', requireAuth, ...mediaHandlers.bulkDeleteMedia);

// =============================================================================
// CHAT ROUTES
// =============================================================================

app.get('/chat', requireAuth, ...chatHandlers.getChats);
app.get('/chat/:id', requireAuth, ...chatHandlers.getChatById);
// app.get('/chat/:id/participants', requireAuth, ...chatHandlers.getChatParticipants);
app.post('/chat', requireAuth, ...chatHandlers.createChat);
// app.put('/chat/:id', requireAuth, ...chatHandlers.updateChat);
app.delete('/chat/:id', requireAuth, ...chatHandlers.deleteChat);
// app.post('/chat/:id/participants', requireAuth, ...chatHandlers.addParticipant);
// app.delete('/chat/:id/participants/:participantId', requireAuth, ...chatHandlers.removeParticipant);
// app.post('/chat/:id/leave', requireAuth, ...chatHandlers.leaveChat);

// =============================================================================
// MESSAGE ROUTES
// =============================================================================

app.get('/messages', requireAuth, ...messageHandlers.getMessages);
app.get('/messages/unread-count', requireAuth, messageHandlers.getUnreadCount);
app.get('/messages/:id', requireAuth, ...messageHandlers.getMessageById);
// app.get('/chat/:chatId/messages', requireAuth, ...messageHandlers.getChatMessages);
// app.post('/chat/:chatId/messages', requireAuth, ...messageHandlers.sendMessage);
// app.put('/messages/:id', requireAuth, ...messageHandlers.updateMessage);
app.delete('/messages/:id', requireAuth, ...messageHandlers.deleteMessage);
app.post('/messages/:id/read', requireAuth, ...messageHandlers.markAsRead);
app.post(
  '/chat/:chatId/messages/mark-all-read',
  requireAuth,
  ...messageHandlers.markAllChatMessagesAsRead,
);

// =============================================================================
// UTILITY ROUTES
// =============================================================================

app.get('/verify-token', requireAuth, async (c) => {
  const user = c.get('user');

  return successResponse(
    {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        type: user.type,
      },
    },
    'Token is valid',
  );
});

app.all('/graphql', async (c) => {
  return successResponse({
    message: 'GraphQL endpoint - implement your logic here',
    endpoint: '/api/graphql',
    methods: ['GET', 'POST'],
  });
});

// Freelancer routes (legacy compatibility)
app.get('/freelancer', ...profileHandlers.getProfiles);

// =============================================================================
// ERROR HANDLING & 404
// =============================================================================

// Error handling
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: 'API endpoint not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
      path: c.req.path,
      method: c.req.method,
    },
    404,
  );
});

// Export handlers for Next.js App Router
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
