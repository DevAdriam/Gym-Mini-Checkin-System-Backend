import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/members',
})
export class MemberGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MemberGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Join admin room for admin notifications
    client.join('admin-room');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit event when a new member is registered
   */
  emitMemberRegistered(member: any) {
    this.logger.log(`Emitting member registered event for: ${member.memberId}`);
    this.server.to('admin-room').emit('member:registered', {
      event: 'member:registered',
      data: {
        id: member.id,
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        membershipPackage: member.membershipPackage,
        createdAt: member.createdAt,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event when a member is approved
   */
  emitMemberApproved(member: any) {
    this.logger.log(`Emitting member approved event for: ${member.memberId}`);
    const eventData = {
      event: 'member:approved',
      data: {
        id: member.id,
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        startDate: member.startDate,
        endDate: member.endDate,
        membershipPackage: member.membershipPackage,
        approvedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // Emit to admin room
    this.server.to('admin-room').emit('member:approved', eventData);
    // Emit to member's personal room
    this.server.to(`member:${member.id}`).emit('member:approved', eventData);
  }

  /**
   * Emit event when a member is rejected
   */
  emitMemberRejected(member: any) {
    this.logger.log(`Emitting member rejected event for: ${member.memberId}`);
    const eventData = {
      event: 'member:rejected',
      data: {
        id: member.id,
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        rejectedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // Emit to admin room
    this.server.to('admin-room').emit('member:rejected', eventData);
    // Emit to member's personal room
    this.server.to(`member:${member.id}`).emit('member:rejected', eventData);
  }

  /**
   * Emit event when a member is approved or rejected (backward compatibility)
   */
  emitMemberApprovalStatusChanged(member: any) {
    if (member.status === 'APPROVED') {
      this.emitMemberApproved(member);
    } else if (member.status === 'REJECTED') {
      this.emitMemberRejected(member);
    }
  }

  /**
   * Handle client subscription to member events
   */
  @SubscribeMessage('subscribe:members')
  handleSubscribe(client: Socket) {
    client.join('admin-room');
    this.logger.log(`Client ${client.id} subscribed to member events`);
    return {
      event: 'subscribed',
      message: 'Successfully subscribed to member events',
    };
  }

  /**
   * Handle member subscription to their own events
   */
  @SubscribeMessage('subscribe:member-events')
  handleMemberSubscribe(client: Socket, payload: { memberId: string }) {
    if (payload?.memberId) {
      client.join(`member:${payload.memberId}`);
      this.logger.log(
        `Client ${client.id} subscribed to member events for: ${payload.memberId}`,
      );
      return {
        event: 'subscribed',
        message: `Successfully subscribed to events for member ${payload.memberId}`,
      };
    }
    return {
      event: 'error',
      message: 'memberId is required',
    };
  }

  /**
   * Handle client unsubscription from member events
   */
  @SubscribeMessage('unsubscribe:members')
  handleUnsubscribe(client: Socket) {
    client.leave('admin-room');
    this.logger.log(`Client ${client.id} unsubscribed from member events`);
    return {
      event: 'unsubscribed',
      message: 'Successfully unsubscribed from member events',
    };
  }
}
