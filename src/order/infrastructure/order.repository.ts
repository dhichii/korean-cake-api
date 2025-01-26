import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { IOrderRepository } from '../domain/order.repository.interface';
import { EditOrderEntity, OrderEntity } from '../domain/order.entity';
import {
  AddOrderResponseDto,
  GetAllOrderResponseDto,
  GetOrderByIdResponseDto,
  OrderStatus,
} from '../interface/http/order.response';
import {
  GetAllOrderDto,
  OrderPictureDto,
} from '../interface/http/order.request';
import { countOffset } from '../../utils/pagination';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private db: PrismaService) {}

  async add(
    data: OrderEntity,
    pictures: OrderPictureDto[],
    progresses: string[],
  ): Promise<AddOrderResponseDto> {
    const progressesData = progresses.map((v) => ({
      process: {
        connect: {
          id: v,
        },
      },
    }));
    await this.db.order.create({
      data: {
        ...data,
        pictures: {
          create: pictures,
        },
        progresses: {
          create: progressesData,
        },
      },
    });

    return { id: data.id };
  }

  async getAll(
    req: GetAllOrderDto,
  ): Promise<[number, GetAllOrderResponseDto[]]> {
    const where = { userId: req.userId };

    // if status 'INPROGRESS' return the order with some unfinished progresses
    // if status 'COMPLETED' return the order with every finished progresses
    if (req.status === OrderStatus.INPROGRESS) {
      Object.assign(where, {
        progresses: {
          some: { isFinish: false },
        },
      });
    } else if (req.status === OrderStatus.COMPLETED) {
      Object.assign(where, {
        progresses: {
          every: { isFinish: true },
        },
      });
    }

    const [totalResult, res] = await Promise.all([
      this.db.order.count({ where }),
      this.db.order.findMany({
        include: {
          pictures: { select: { id: true, url: true } },
          progresses: {
            select: { isFinish: true },
            where: { isFinish: false },
          },
        },
        where,
        skip: countOffset(req.page, req.limit),
        take: req.limit,
      }),
    ]);

    const data = res.map((v) => ({
      id: v.id,
      size: v.size,
      status:
        v.progresses.length != 0
          ? OrderStatus.INPROGRESS
          : OrderStatus.COMPLETED,
      layer: v.layer,
      isUseTopper: v.isUseTopper,
      pickupTime: v.pickupTime.toString(),
      text: v.text,
      textColor: v.textColor,
      price: v.price,
      downPayment: v.downPayment,
      remainingPayment: v.remainingPayment,
      telp: v.telp,
      notes: v.notes,
      pictures: v.pictures,
    }));

    return [totalResult, data];
  }

  async getById(id: string, userId: string): Promise<GetOrderByIdResponseDto> {
    const res = await this.db.order.findFirst({
      select: {
        id: true,
        size: true,
        layer: true,
        isUseTopper: true,
        pickupTime: true,
        text: true,
        textColor: true,
        price: true,
        downPayment: true,
        remainingPayment: true,
        telp: true,
        notes: true,
        pictures: { select: { id: true, url: true } },
        progresses: {
          include: { process: true },
          orderBy: { process: { step: 'asc' } },
        },
      },
      where: { id, userId },
    });

    if (!res) {
      throw new NotFoundException('order not found');
    }

    // count inprogress processes and restructure progresses
    let inprogressProcessesCount = 0;
    const progresses = res.progresses.map((v) => {
      const process = v.process;

      if (!v.isFinish) {
        inprogressProcessesCount++;
      }

      return {
        id: process.id,
        name: process.name,
        step: process.step,
        isFinish: v.isFinish,
      };
    });

    return {
      id: res.id,
      status:
        inprogressProcessesCount != 0
          ? OrderStatus.INPROGRESS
          : OrderStatus.COMPLETED,
      ...res,
      pickupTime: res.pickupTime.toString(),
      pictures: res.pictures,
      progresses,
    };
  }

  async editById(
    id: string,
    data: EditOrderEntity,
    newPictures: OrderPictureDto[],
  ): Promise<void> {
    await this.db.order.update({
      where: { id },
      data: {
        ...data,
        pictures: {
          create: newPictures,
        },
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.db.order.delete({ where: { id, userId } });
  }

  async addProgresses(orderId: string, ids: string[]): Promise<void> {
    const progressesData = ids.map((v) => ({
      process: {
        connect: {
          id: v,
        },
      },
    }));
    await this.db.order.update({
      where: { id: orderId },
      data: { progresses: { create: progressesData } },
    });
  }

  async editProgressById(
    id: string,
    orderId: string,
    isFinish: boolean,
  ): Promise<void> {
    await this.db.orderProgress.update({
      where: { orderId_processId: { processId: id, orderId } },
      data: { isFinish },
    });
  }

  async deleteProgresses(orderId: string, ids: string[]): Promise<void> {
    await this.db.orderProgress.deleteMany({
      where: { orderId, processId: { in: ids } },
    });
  }

  async verify(id: string, userId: string): Promise<void> {
    const res = this.db.order.count({ where: { id, userId } });
    if (!res) {
      throw new NotFoundException('order not found');
    }
  }

  async verifyProgress(processId: string, orderId: string): Promise<void> {
    const res = this.db.orderProgress.count({
      where: { orderId, processId },
    });

    if (!res) {
      throw new NotFoundException('order progress not found');
    }
  }
}
