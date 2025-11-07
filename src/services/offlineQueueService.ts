/**
 * Offline Message Queue Service
 * Queues messages when offline and sends them when back online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SendMessagePayload } from '../types/messaging';
import messagingService from './messagingService';

const QUEUE_STORAGE_KEY = '@fixrx_offline_message_queue';

interface QueuedMessage {
  id: string;
  conversationId: string;
  payload: SendMessagePayload;
  timestamp: number;
  retries: number;
}

class OfflineQueueService {
  private queue: QueuedMessage[] = [];
  private processing = false;
  private maxRetries = 3;

  async initialize() {
    // Load queue from storage
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`Loaded ${this.queue.length} queued messages from storage`);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  async queueMessage(conversationId: string, payload: SendMessagePayload): Promise<string> {
    const queuedMessage: QueuedMessage = {
      id: `queued-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      payload,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(queuedMessage);
    await this.saveQueue();

    console.log(`Message queued for offline sending: ${queuedMessage.id}`);
    return queuedMessage.id;
  }

  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`Processing ${this.queue.length} queued messages...`);

    const failedMessages: QueuedMessage[] = [];

    for (const queuedMessage of this.queue) {
      try {
        // Attempt to send message
        const result = await messagingService.sendMessage(
          queuedMessage.conversationId,
          queuedMessage.payload
        );

        if (result.success) {
          console.log(`✅ Queued message sent successfully: ${queuedMessage.id}`);
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error(`❌ Failed to send queued message: ${queuedMessage.id}`, error);
        
        // Increment retry count
        queuedMessage.retries++;

        // Re-queue if under max retries
        if (queuedMessage.retries < this.maxRetries) {
          failedMessages.push(queuedMessage);
          console.log(`Will retry message ${queuedMessage.id} (attempt ${queuedMessage.retries}/${this.maxRetries})`);
        } else {
          console.log(`❌ Message ${queuedMessage.id} exceeded max retries, discarding`);
        }
      }
    }

    // Update queue with only failed messages
    this.queue = failedMessages;
    await this.saveQueue();

    this.processing = false;
    console.log(`Queue processing complete. ${this.queue.length} messages remaining.`);
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    console.log('Offline queue cleared');
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getQueuedMessages(): QueuedMessage[] {
    return [...this.queue];
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }
}

export const offlineQueueService = new OfflineQueueService();
export default offlineQueueService;
