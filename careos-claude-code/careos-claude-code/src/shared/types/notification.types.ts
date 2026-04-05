export type NotificationChannel = 'push' | 'sms' | 'email' | 'in_app';

export type NotificationType =
  | 'task_match'
  | 'task_accepted'
  | 'task_completed'
  | 'condition_change'
  | 'assessment_due'
  | 'lmn_expiry'
  | 'deficit_warning'
  | 'streak_milestone'
  | 'cri_pending_review'
  | 'cri_approved'
  | 'cri_revision_requested'
  | 'kbs_decline_escalation'
  | 'care_log_alert'
  | 'shift_swap_accepted'
  | 'shift_swap_available'
  | 'membership_renewal_reminder';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  sentAt: string;
  readAt?: string;
}
