package com.retriever.entity;

/**
 * Notification types used by the NotificationService.
 * Demonstrates <b>Abstraction</b> via enum used by notification handling logic.
 */
public enum NotificationType {
    CLAIM_UPDATE,
    POTENTIAL_MATCH,
    ITEM_UPDATE,
    SYSTEM
}