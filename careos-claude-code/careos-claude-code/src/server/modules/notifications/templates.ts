/**
 * Notification Templates — Content per notification type
 *
 * Each template provides title and body per channel.
 * Variables are interpolated with {{variableName}} syntax.
 */
import type { NotificationType, NotificationChannel } from '@shared/types/notification.types';

export interface NotificationTemplate {
  title: string;
  body: string;
}

type TemplateMap = Record<NotificationType, Record<NotificationChannel, NotificationTemplate>>;

const templates: TemplateMap = {
  task_match: {
    push: {
      title: 'New Task Match',
      body: 'A care task near you needs help: {{taskTitle}}',
    },
    sms: {
      title: 'CareOS Task Match',
      body: 'Hi {{firstName}}, a care task near you needs help: {{taskTitle}}. Open the app to view details.',
    },
    email: {
      title: 'New Care Task Match - {{taskTitle}}',
      body: 'Hi {{firstName}},\n\nA care task near you needs help:\n\n{{taskTitle}}\n{{taskDescription}}\n\nEstimated time: {{estimatedHours}} hours\n\nOpen the CareOS app to accept this task.',
    },
    in_app: {
      title: 'New Task Match',
      body: 'A care task near you needs help: {{taskTitle}}',
    },
  },
  task_accepted: {
    push: {
      title: 'Task Accepted',
      body: '{{helperName}} accepted your task: {{taskTitle}}',
    },
    sms: {
      title: 'CareOS Task Update',
      body: 'Great news! {{helperName}} accepted your task: {{taskTitle}}.',
    },
    email: {
      title: 'Your Task Was Accepted - {{taskTitle}}',
      body: 'Hi {{firstName}},\n\n{{helperName}} has accepted your care task: {{taskTitle}}.\n\nThey will be in touch to coordinate the details.',
    },
    in_app: {
      title: 'Task Accepted',
      body: '{{helperName}} accepted your task: {{taskTitle}}',
    },
  },
  task_completed: {
    push: {
      title: 'Task Completed',
      body: '{{taskTitle}} has been completed. {{creditsEarned}} credits earned!',
    },
    sms: {
      title: 'CareOS Task Complete',
      body: '{{taskTitle}} is complete! {{creditsEarned}} credits earned. Thank you for helping your community.',
    },
    email: {
      title: 'Task Completed - {{taskTitle}}',
      body: 'Hi {{firstName}},\n\nThe care task "{{taskTitle}}" has been completed.\n\nCredits earned: {{creditsEarned}} hours\nYour balance: {{balance}} hours\n\nThank you for being part of the care community!',
    },
    in_app: {
      title: 'Task Completed',
      body: '{{taskTitle}} completed. {{creditsEarned}} credits earned!',
    },
  },
  condition_change: {
    push: {
      title: 'Condition Update',
      body: 'A change in condition has been reported for {{careRecipientName}}',
    },
    sms: {
      title: 'CareOS Alert',
      body: 'A change in condition has been reported for {{careRecipientName}}. Please check the app for details.',
    },
    email: {
      title: 'Condition Change Alert - {{careRecipientName}}',
      body: 'Hi {{firstName}},\n\nA change in condition has been reported for {{careRecipientName}}.\n\nPlease log in to CareOS to review the details and take any necessary action.',
    },
    in_app: {
      title: 'Condition Change',
      body: 'A change in condition has been reported for {{careRecipientName}}',
    },
  },
  assessment_due: {
    push: {
      title: 'Assessment Due',
      body: 'Time for a {{assessmentType}} assessment for {{careRecipientName}}',
    },
    sms: {
      title: 'CareOS Reminder',
      body: 'Reminder: {{assessmentType}} assessment is due for {{careRecipientName}}. Open the app to complete it.',
    },
    email: {
      title: 'Assessment Due - {{careRecipientName}}',
      body: 'Hi {{firstName}},\n\nA {{assessmentType}} assessment is due for {{careRecipientName}}.\n\nPlease complete it at your earliest convenience through the CareOS app.',
    },
    in_app: {
      title: 'Assessment Due',
      body: '{{assessmentType}} assessment is due for {{careRecipientName}}',
    },
  },
  lmn_expiry: {
    push: {
      title: 'LMN Expiring Soon',
      body: 'Letter of Medical Necessity for {{careRecipientName}} expires in {{daysRemaining}} days',
    },
    sms: {
      title: 'CareOS LMN Alert',
      body: 'LMN for {{careRecipientName}} expires in {{daysRemaining}} days. Renewal is needed to maintain HSA eligibility.',
    },
    email: {
      title: 'LMN Expiry Notice - {{careRecipientName}}',
      body: 'Hi {{firstName}},\n\nThe Letter of Medical Necessity for {{careRecipientName}} expires in {{daysRemaining}} days.\n\nTo maintain HSA eligibility for care services, please arrange for renewal with the medical director.',
    },
    in_app: {
      title: 'LMN Expiring',
      body: 'LMN for {{careRecipientName}} expires in {{daysRemaining}} days',
    },
  },
  deficit_warning: {
    push: {
      title: 'Balance Alert',
      body: 'Your time bank balance is {{balance}} hours. Give back to the community to restore your balance.',
    },
    sms: {
      title: 'CareOS Balance',
      body: 'Your time bank balance is {{balance}} hours. Lead a yoga class, help a neighbor, or join a wellness group to earn credits.',
    },
    email: {
      title: 'Time Bank Balance Alert',
      body: 'Hi {{firstName}},\n\nYour time bank balance is {{balance}} hours.\n\nThe community works best when everyone contributes. Lead a yoga or stretching session, help a neighbor with errands, or join a wellness group to earn credits and build community.',
    },
    in_app: {
      title: 'Balance Alert',
      body: 'Your balance is {{balance}} hours. Help a neighbor to earn credits.',
    },
  },
  streak_milestone: {
    push: {
      title: 'Community Milestone',
      body: 'Amazing! {{streakWeeks}} weeks of helping your community. Thank you, {{firstName}}!',
    },
    sms: {
      title: 'CareOS Milestone',
      body: 'Congratulations {{firstName}}! {{streakWeeks}} weeks of community service. Your neighbors appreciate you.',
    },
    email: {
      title: 'Community Milestone - {{streakWeeks}} Weeks!',
      body: 'Hi {{firstName}},\n\nWhat an achievement! You have been actively helping your community for {{streakWeeks}} consecutive weeks.\n\nYour dedication makes a real difference in the lives of your neighbors. Thank you for being part of CareOS.',
    },
    in_app: {
      title: 'Community Milestone',
      body: '{{streakWeeks}} weeks of helping your community! Thank you!',
    },
  },
  cri_pending_review: {
    push: {
      title: 'CRI Review Needed',
      body: 'A new CRI assessment for {{careRecipientName}} is pending your review',
    },
    sms: {
      title: 'CareOS MD Review',
      body: 'CRI assessment for {{careRecipientName}} needs your review. Acuity: {{acuity}}. SLA: 24 hours.',
    },
    email: {
      title: 'CRI Review Required - {{careRecipientName}}',
      body: 'Hi Dr. {{firstName}},\n\nA CRI assessment has been submitted for {{careRecipientName}} and requires your review.\n\nRaw score: {{rawScore}}\nAcuity: {{acuity}}\nLMN eligible: {{lmnEligible}}\n\nPlease review within 24 hours per SLA requirements.',
    },
    in_app: {
      title: 'CRI Review Needed',
      body: 'CRI for {{careRecipientName}} pending review ({{acuity}} acuity)',
    },
  },
  cri_approved: {
    push: {
      title: 'CRI Approved',
      body: 'CRI assessment for {{careRecipientName}} has been approved',
    },
    sms: {
      title: 'CareOS Update',
      body: 'CRI assessment for {{careRecipientName}} has been approved by the medical director.',
    },
    email: {
      title: 'CRI Assessment Approved - {{careRecipientName}}',
      body: 'Hi {{firstName}},\n\nThe CRI assessment for {{careRecipientName}} has been approved by the medical director.\n\nAcuity: {{acuity}}\n\nThe care plan has been updated accordingly.',
    },
    in_app: {
      title: 'CRI Approved',
      body: 'CRI for {{careRecipientName}} approved ({{acuity}} acuity)',
    },
  },
  cri_revision_requested: {
    push: {
      title: 'CRI Revision Requested',
      body: 'The medical director requested revisions to the CRI for {{careRecipientName}}',
    },
    sms: {
      title: 'CareOS Update',
      body: 'CRI for {{careRecipientName}} needs revisions. Check the app for MD notes.',
    },
    email: {
      title: 'CRI Revision Requested - {{careRecipientName}}',
      body: 'Hi {{firstName}},\n\nThe medical director has requested revisions to the CRI assessment for {{careRecipientName}}.\n\nNotes: {{reviewNotes}}\n\nPlease update the assessment and resubmit.',
    },
    in_app: {
      title: 'CRI Revision Needed',
      body: 'CRI for {{careRecipientName}} needs revisions. See MD notes.',
    },
  },
  kbs_decline_escalation: {
    push: {
      title: 'KBS Decline Alert',
      body: '{{careRecipientName}}: {{declinedDimensions}} declined by {{declinePoints}}+ points',
    },
    sms: {
      title: 'CareOS KBS Alert',
      body: 'KBS decline for {{careRecipientName}}: {{declinedDimensions}} dropped. Review required.',
    },
    email: {
      title: 'KBS Outcome Decline - {{careRecipientName}}',
      body: 'Hi Dr. {{firstName}},\n\nA significant KBS outcome decline has been detected for {{careRecipientName}}.\n\nOmaha Problem: {{omahaProblemName}}\nDeclined dimensions: {{declinedDimensions}}\nDecline details: {{declineDetails}}\n\nThis may indicate care plan ineffectiveness or a change in condition. Please review and consider care plan adjustments.',
    },
    in_app: {
      title: 'KBS Decline Alert',
      body: '{{careRecipientName}}: {{declinedDimensions}} declined ({{omahaProblemName}})',
    },
  },

  care_log_alert: {
    push: {
      title: 'Care Alert',
      body: '{{workerName}} flagged an alert for {{careRecipientName}}: {{category}}',
    },
    sms: {
      title: 'CareOS Alert',
      body: 'Alert: {{workerName}} flagged {{careRecipientName}} — {{category}}. {{notes}}',
    },
    email: {
      title: 'Care Log Alert - {{careRecipientName}}',
      body: 'A care worker has flagged an alert during a shift.\n\nCare Recipient: {{careRecipientName}}\nCategory: {{category}}\nOmaha Problems: {{problems}}\nNotes: {{notes}}\n\nPlease review and take appropriate action.',
    },
    in_app: {
      title: 'Care Alert',
      body: '{{workerName}} flagged {{careRecipientName}}: {{category}}',
    },
  },

  shift_swap_accepted: {
    push: {
      title: 'Shift Swap Accepted',
      body: 'Your shift on {{shiftDate}} has been picked up by {{acceptedBy}}',
    },
    sms: {
      title: 'CareOS',
      body: 'Your shift swap for {{shiftDate}} was accepted by {{acceptedBy}}.',
    },
    email: {
      title: 'Shift Swap Accepted - {{shiftDate}}',
      body: 'Your shift swap request for {{shiftDate}} has been accepted by {{acceptedBy}}. You are no longer scheduled for this shift.',
    },
    in_app: {
      title: 'Shift Swap Accepted',
      body: 'Your shift on {{shiftDate}} was picked up by {{acceptedBy}}',
    },
  },

  shift_swap_available: {
    push: {
      title: 'Shift Available',
      body: 'A team member needs coverage on {{shiftDate}} for {{careRecipientName}}',
    },
    sms: {
      title: 'CareOS',
      body: 'Shift available: {{shiftDate}} for {{careRecipientName}}. Open the app to pick it up.',
    },
    email: {
      title: 'Shift Available - {{shiftDate}}',
      body: 'A team member has requested a shift swap and needs coverage.\n\nDate: {{shiftDate}}\nCare Recipient: {{careRecipientName}}\nReason: {{reason}}\n\nOpen CareOS to accept this shift.',
    },
    in_app: {
      title: 'Shift Available',
      body: 'Coverage needed {{shiftDate}} for {{careRecipientName}}',
    },
  },

  membership_renewal_reminder: {
    push: {
      title: 'Membership Renewal',
      body: 'Your co-op.care membership renews in {{daysUntilRenewal}} days',
    },
    sms: {
      title: 'co-op.care',
      body: 'Hi {{familyName}}, your membership renews in {{daysUntilRenewal}} days on {{renewalDate}}.',
    },
    email: {
      title: 'Membership Renewal Reminder',
      body: 'Hi {{familyName}},\n\nYour co-op.care membership renews in {{daysUntilRenewal}} days.\n\nRenewal date: {{renewalDate}}\nMembership: {{membershipStatus}}\n\nIf you have a payment method on file, renewal is automatic. Otherwise, please update your payment details in the app.',
    },
    in_app: {
      title: 'Membership Renewal',
      body: 'Your membership renews in {{daysUntilRenewal}} days',
    },
  },
};

/**
 * Get a notification template for a given type and channel
 */
export function getTemplate(
  type: NotificationType,
  channel: NotificationChannel,
): NotificationTemplate {
  return templates[type][channel];
}

/**
 * Interpolate template variables: {{varName}} → value
 */
export function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return variables[key] ?? `{{${key}}}`;
  });
}

/**
 * Render a notification template with variables
 */
export function renderTemplate(
  type: NotificationType,
  channel: NotificationChannel,
  variables: Record<string, string>,
): NotificationTemplate {
  const template = getTemplate(type, channel);
  return {
    title: interpolate(template.title, variables),
    body: interpolate(template.body, variables),
  };
}

/**
 * Get the default channels for a notification type
 * Urgent → push, scheduled → email, informational → in_app
 */
export function getDefaultChannels(type: NotificationType): NotificationChannel[] {
  switch (type) {
    case 'condition_change':
      return ['push', 'sms', 'in_app']; // Urgent — multi-channel
    case 'lmn_expiry':
      return ['email', 'in_app']; // Scheduled
    case 'assessment_due':
      return ['email', 'in_app']; // Scheduled
    case 'task_match':
      return ['push', 'in_app']; // Time-sensitive
    case 'task_accepted':
      return ['push', 'in_app']; // Informational
    case 'task_completed':
      return ['push', 'in_app']; // Informational
    case 'deficit_warning':
      return ['in_app']; // Gentle nudge
    case 'streak_milestone':
      return ['in_app']; // Community recognition
    case 'cri_pending_review':
      return ['push', 'email', 'in_app']; // MD must review within 24h SLA
    case 'cri_approved':
      return ['push', 'in_app']; // Informational
    case 'cri_revision_requested':
      return ['push', 'email', 'in_app']; // Needs action
    case 'kbs_decline_escalation':
      return ['push', 'email', 'in_app']; // Clinical escalation
    case 'care_log_alert':
      return ['push', 'in_app']; // Needs attention
    case 'shift_swap_accepted':
      return ['push', 'in_app']; // Informational
    case 'shift_swap_available':
      return ['push', 'in_app']; // Time-sensitive
    case 'membership_renewal_reminder':
      return ['email', 'push']; // Scheduled — email primary, push backup
  }
}
