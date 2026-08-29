import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Notification)
def dispatch_fcm_on_notification_create(sender, instance, created, **kwargs):
    """
    Stub for FCM push dispatch, per implementation_plan.md §4.3:
    "When a Notification record is created, a Django signal dispatches it
    via FCM to registered devices (if the user has an FCM token stored)."

    TODO: integrate the Firebase Admin SDK here. Look up the user's stored
    FCM device token(s), send the push via `firebase_admin.messaging`, and
    set `instance.fcm_sent = True` (with an update_fields save) on success.
    For now this just logs a no-op so the notification pipeline is wired
    end-to-end without a live FCM/Firebase project.
    """
    if not created:
        return

    logger.info(
        "TODO(FCM): would dispatch push notification %s to user_id=%s (title=%r)",
        instance.type,
        instance.user_id,
        instance.title,
    )
