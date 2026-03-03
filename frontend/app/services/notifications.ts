import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Obligation } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async scheduleObligationNotification(obligation: Obligation): Promise<void> {
    if (!obligation.dueDate) return;

    try {
      // Cancel existing notification for this obligation
      await this.cancelObligationNotification(obligation.id);

      // Calculate next occurrence
      const now = new Date();
      const day = obligation.dueDate;
      let notificationDate = new Date(now.getFullYear(), now.getMonth(), day, 9, 0, 0);
      
      // If the date has passed this month, schedule for next month
      if (notificationDate <= now) {
        notificationDate = new Date(now.getFullYear(), now.getMonth() + 1, day, 9, 0, 0);
      }

      await Notifications.scheduleNotificationAsync({
        identifier: obligation.id,
        content: {
          title: 'Payment Reminder',
          body: `${obligation.name} - ₹${obligation.monthlyAmount.toLocaleString('en-IN')} due today`,
          data: { obligationId: obligation.id },
        },
        trigger: {
          date: notificationDate,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  async cancelObligationNotification(obligationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(obligationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  },

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  },
};
