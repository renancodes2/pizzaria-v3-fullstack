import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendOrderStatusUpdate(orderId: number, status: string) {
    this.server.to(`order_${orderId}`).emit('orderStatusUpdate', { orderId, status });
  }

  @SubscribeMessage('subscribeOrder')
  handleSubscribeOrder(client: Socket, @MessageBody() orderId: number) {
    client.join(`order_${orderId}`);
    client.emit('subscribed', `Subscribed to order ${orderId}`);
  }
}
