/**
 * Brevo List Management Service
 *
 * Handles user journey tracking through Brevo email lists
 * Manages contact lifecycle from registration → onboarding → service creation
 */

import { brevoClient } from './client';
import { BrevoListId, DoulitsaContactAttributes } from './types';

export class BrevoListManagementService {
  /**
   * Add contact to a specific Brevo list
   */
  async addContactToList(
    email: string,
    listId: BrevoListId,
    attributes?: DoulitsaContactAttributes
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(`Adding contact ${email} to list ${listId}`, attributes);

      // Create or update contact with list assignment
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY || '',
        },
        body: JSON.stringify({
          email,
          listIds: [listId],
          attributes: attributes || {},
          updateEnabled: true, // Update if contact already exists
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Contact already exists is not an error for us
        if (response.status === 400 && errorData.code === 'duplicate_parameter') {
          console.log(`Contact ${email} already exists, updating...`);
          return { success: true, message: 'Contact already exists, updated' };
        }
        throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log(`✅ Successfully added ${email} to list ${listId}`);
      return { success: true, message: 'Contact added to list' };
    } catch (error) {
      console.error(`Failed to add contact ${email} to list ${listId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add contact',
      };
    }
  }

  /**
   * Remove contact from a specific list
   */
  async removeContactFromList(
    email: string,
    listId: BrevoListId
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(`Removing contact ${email} from list ${listId}`);

      const response = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${listId}/contacts/remove`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY || '',
          },
          body: JSON.stringify({
            emails: [email],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Already removed is not an error for us
        if (
          response.status === 400 &&
          (errorData.code === 'invalid_parameter' || errorData.message?.includes('does not exist'))
        ) {
          console.log(`Contact ${email} not in list ${listId} or already removed`);
          return { success: true, message: 'Contact not in list or already removed' };
        }
        throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log(`✅ Successfully removed ${email} from list ${listId}`);
      return { success: true, message: 'Contact removed from list' };
    } catch (error) {
      console.error(`Failed to remove contact ${email} from list ${listId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove contact',
      };
    }
  }

  /**
   * Move contact from one list to another
   * This is the primary method for user journey progression
   */
  async moveContactBetweenLists(
    email: string,
    fromListId: BrevoListId | null,
    toListId: BrevoListId,
    attributes?: DoulitsaContactAttributes
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(`Moving contact ${email} from list ${fromListId} to ${toListId}`);

      // Remove from old list if specified
      if (fromListId !== null) {
        await this.removeContactFromList(email, fromListId);
      }

      // Add to new list
      const addResult = await this.addContactToList(email, toListId, attributes);

      if (!addResult.success) {
        throw new Error(`Failed to add to new list: ${addResult.message}`);
      }

      console.log(`✅ Successfully moved ${email} from list ${fromListId} to ${toListId}`);
      return {
        success: true,
        message: `Contact moved from ${fromListId} to ${toListId}`,
      };
    } catch (error) {
      console.error(
        `Failed to move contact ${email} from ${fromListId} to ${toListId}:`,
        error
      );
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to move contact',
      };
    }
  }

  /**
   * USER JOURNEY: New user registration
   * Type "user" → "users" list
   * Type "pro" → "emptyprofile" list
   */
  async onUserRegistration(
    email: string,
    userType: 'user' | 'pro',
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      const listId =
        userType === 'user'
          ? BrevoListId.USERS
          : BrevoListId.EMPTYPROFILE;

      await this.addContactToList(email, listId, attributes);
      console.log(`✅ User ${email} (${userType}) added to list ${listId} on registration`);
    } catch (error) {
      console.error(`Failed to handle user registration for ${email}:`, error);
      // Don't throw - this shouldn't block registration
    }
  }

  /**
   * USER JOURNEY: OAuth setup completion
   * Type "user" → "users" list
   * Type "pro" → "emptyprofile" list
   */
  async onOAuthSetupComplete(
    email: string,
    userType: 'user' | 'pro',
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      const listId =
        userType === 'user'
          ? BrevoListId.USERS
          : BrevoListId.EMPTYPROFILE;

      await this.addContactToList(email, listId, attributes);
      console.log(`✅ User ${email} (${userType}) added to list ${listId} after OAuth setup`);
    } catch (error) {
      console.error(`Failed to handle OAuth setup for ${email}:`, error);
      // Don't throw - this shouldn't block OAuth flow
    }
  }

  /**
   * USER JOURNEY: Onboarding completion
   * emptyprofile → noservices
   */
  async onOnboardingComplete(
    email: string,
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      await this.moveContactBetweenLists(
        email,
        BrevoListId.EMPTYPROFILE,
        BrevoListId.NOSERVICES,
        attributes
      );
      console.log(`✅ User ${email} moved to noservices list after onboarding`);
    } catch (error) {
      console.error(`Failed to handle onboarding completion for ${email}:`, error);
      // Don't throw - this shouldn't block onboarding
    }
  }

  /**
   * USER JOURNEY: First service creation
   * noservices → pros
   */
  async onFirstServiceCreated(
    email: string,
    attributes?: DoulitsaContactAttributes
  ): Promise<void> {
    try {
      await this.moveContactBetweenLists(
        email,
        BrevoListId.NOSERVICES,
        BrevoListId.PROS,
        attributes
      );
      console.log(`✅ User ${email} moved to pros list after first service creation`);
    } catch (error) {
      console.error(`Failed to handle first service creation for ${email}:`, error);
      // Don't throw - this shouldn't block service creation
    }
  }

  /**
   * Update contact attributes without changing lists
   */
  async updateContactAttributes(
    email: string,
    attributes: DoulitsaContactAttributes
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(`Updating attributes for contact ${email}`, attributes);

      const response = await fetch(
        `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY || '',
          },
          body: JSON.stringify({
            attributes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log(`✅ Successfully updated attributes for ${email}`);
      return { success: true, message: 'Attributes updated' };
    } catch (error) {
      console.error(`Failed to update attributes for ${email}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update attributes',
      };
    }
  }
}

// Export singleton instance
export const brevoListManager = new BrevoListManagementService();
