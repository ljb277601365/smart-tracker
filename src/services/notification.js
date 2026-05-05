import { LocalNotifications } from '@capacitor/local-notifications'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function requestNotificationPermission() {
  try {
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (e) {
    console.error('Failed to request notification permission:', e)
    return false
  }
}

export async function showReminderNotification(title, body, items) {
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy })

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title,
          body,
          extra: { items }
        }
      ]
    })
  } catch (e) {
    console.error('Failed to show notification:', e)
  }
}

export async function cancelAllNotifications() {
  try {
    await LocalNotifications.cancelAll()
  } catch (e) {
    console.error('Failed to cancel notifications:', e)
  }
}