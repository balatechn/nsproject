import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly config: ConfigService) {}

  private get apiUrl() { return this.config.get('WHATSAPP_API_URL', 'http://localhost:8080'); }
  private get apiKey() { return this.config.get('WHATSAPP_API_KEY', ''); }
  private get instance() { return this.config.get('WHATSAPP_INSTANCE', 'nsproject'); }

  private headers() {
    return { apikey: this.apiKey, 'Content-Type': 'application/json' };
  }

  async sendText(to: string, message: string) {
    try {
      const res = await axios.post(
        `${this.apiUrl}/message/sendText/${this.instance}`,
        { number: to, options: { delay: 1200 }, textMessage: { text: message } },
        { headers: this.headers() },
      );
      return res.data;
    } catch (error: any) {
      this.logger.error(`WhatsApp send failed: ${error.message}`);
      throw error;
    }
  }

  async sendTaskAlert(phone: string, task: { title: string; dueDate?: Date; projectName: string }) {
    const message = `📋 *Task Alert*\n\n` +
      `*Task:* ${task.title}\n` +
      `*Project:* ${task.projectName}\n` +
      (task.dueDate ? `*Due:* ${new Date(task.dueDate).toLocaleDateString()}\n` : '') +
      `\n_NsProject Enterprise_`;
    return this.sendText(phone, message);
  }

  async sendProjectUpdate(phone: string, project: { name: string; status: string }) {
    const message = `🚀 *Project Update*\n\n` +
      `*Project:* ${project.name}\n` +
      `*Status:* ${project.status}\n\n` +
      `_NsProject Enterprise_`;
    return this.sendText(phone, message);
  }

  async sendApprovalRequest(phone: string, details: { requester: string; type: string }) {
    const message = `⏳ *Approval Required*\n\n` +
      `*From:* ${details.requester}\n` +
      `*Type:* ${details.type}\n\n` +
      `Please log in to approve or reject.\n_NsProject Enterprise_`;
    return this.sendText(phone, message);
  }

  async getInstanceStatus() {
    try {
      const res = await axios.get(
        `${this.apiUrl}/instance/connectionState/${this.instance}`,
        { headers: this.headers() },
      );
      return res.data;
    } catch {
      return { state: 'disconnected' };
    }
  }
}
