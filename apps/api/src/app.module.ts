import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CrmModule } from './modules/crm/crm.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { ChatModule } from './modules/chat/chat.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    ResourcesModule,
    WorkflowsModule,
    NotificationsModule,
    CrmModule,
    ReportsModule,
    AdminModule,
    ChatModule,
    WhatsappModule,
    UploadsModule,
    WebsocketModule,
    DashboardModule,
  ],
})
export class AppModule {}
