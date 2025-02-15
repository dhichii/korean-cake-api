import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GdriveService } from '../../common/gdrive.service';
import { IOrderService } from '../domain/order.service.interface';
import {
  AddOrderDto,
  EditOrderDto,
  EditOrderProgressDto,
  GetAllOrderDto,
  mapAddOrderDto,
  mapEditOrderDto,
  OrderPictureDto,
} from '../interface/http/order.request';
import {
  AddOrderResponseDto,
  GetAllOrderResponseDto,
  GetOrderByIdResponseDto,
} from '../interface/http/order.response';
import { IProcessService } from '../../process/domain/process.service.interface';
import { ValidationService } from '../../common/validation.service';
import { IOrderRepository } from '../domain/order.repository.interface';
import { PrismaService } from '../../common/prisma.service';
import * as fs from 'fs';
import { OrderValidation } from './order.validation';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    @Inject('IOrderRepository') private orderRepository: IOrderRepository,
    @Inject('IProcessService') private processService: IProcessService,
    private validationService: ValidationService,
    private gdriveService: GdriveService,
    private prismaService: PrismaService,
  ) {}

  async add(req: AddOrderDto, userId: string): Promise<AddOrderResponseDto> {
    const orderPictures: OrderPictureDto[] = [];
    try {
      req = this.validationService.validate(OrderValidation.ADD, req);

      // verify order progresses
      await this.processService.verifyAll(req.progresses, userId);
      // upload and mapping pictures
      const folderId = process.env.GDRIVE_ORDER_FOLDER_ID;
      const uploadTasks = req.pictures.map((picture) =>
        this.gdriveService.upload(picture, folderId),
      );
      const uploadRes = await Promise.all(uploadTasks);
      uploadRes.forEach((response) => {
        orderPictures.push({
          id: response.id,
          url: `https://drive.google.com/uc?id=${response.id}`,
        });
      });

      return await this.orderRepository.add(
        mapAddOrderDto(userId, req),
        orderPictures,
        req.progresses,
      );
    } catch (e) {
      await Promise.allSettled(
        orderPictures.map((picture) => this.gdriveService.delete(picture.id)),
      );

      throw e;
    } finally {
      // remove the local file
      if (Array.isArray(req.pictures)) {
        await Promise.allSettled(
          req.pictures.map((picture) => fs.promises.unlink(picture.path)),
        );
      }
    }
  }

  async getAll(
    req: GetAllOrderDto,
  ): Promise<[number, GetAllOrderResponseDto[]]> {
    return await this.orderRepository.getAll(req);
  }

  async getById(id: string, userId: string): Promise<GetOrderByIdResponseDto> {
    this.validationService.validate(OrderValidation.GET_BY_ID, { id, userId });

    return await this.orderRepository.getById(id, userId);
  }

  async editById(id: string, userId: string, req: EditOrderDto): Promise<void> {
    const newPictures: OrderPictureDto[] = [];
    try {
      req = this.validationService.validate(OrderValidation.EDIT_BY_ID, req);

      // verify order and order progresses
      await this.orderRepository.verify(id, userId);
      await this.processService.verifyAll(req.addedProgresses, userId);

      // verify if processes already exist. if exist, remove from request
      const progressVerifications = req.addedProgresses.map(
        async (progressId, index) => {
          try {
            await this.orderRepository.verifyProgress(progressId, id);
            req.addedProgresses.splice(index, 1);
          } catch (e) {
            if (!(e instanceof NotFoundException)) {
              throw e;
            }
          }
        },
      );
      await Promise.all(progressVerifications);

      // upload and mapping pictures
      for (const picture of req.addedPictures) {
        const response = await this.gdriveService.upload(
          picture,
          process.env.GDRIVE_ORDER_FOLDER_ID,
        );

        newPictures.push({
          id: response.id,
          url: `https://drive.google.com/uc?id=${response.id}`,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await this.prismaService.$transaction(async (tx) => {
        await this.orderRepository.addProgresses(id, req.addedProgresses);
        await this.orderRepository.deleteProgresses(id, req.deletedProgresses);
        await this.orderRepository.editById(
          id,
          mapEditOrderDto(req),
          newPictures,
        );
        for (const pictureId of req.deletedPictures) {
          try {
            await this.gdriveService.delete(pictureId);
          } catch (e) {
            if (!e.message.includes('File not found')) {
              throw e;
            }
          }
        }
      });
    } catch (e) {
      await Promise.allSettled(
        newPictures.map((picture) => this.gdriveService.delete(picture.id)),
      );

      throw e;
    } finally {
      // remove the local file
      await Promise.allSettled(
        req.addedPictures.map((picture) => fs.promises.unlink(picture.path)),
      );
    }
  }

  async deleteById(id: string, userId: string): Promise<void> {
    this.validationService.validate(OrderValidation.DELETE_BY_ID, {
      id,
      userId,
    });

    await this.orderRepository.verify(id, userId);
    await this.orderRepository.deleteById(id, userId);
  }

  async editProgressById(
    id: string,
    orderId: string,
    userId: string,
    req: EditOrderProgressDto,
  ): Promise<void> {
    req = this.validationService.validate(
      OrderValidation.EDIT_PROGRESS_BY_ID,
      req,
    );

    // verify the order with userId
    await this.orderRepository.verify(orderId, userId);
    // verify if the order progress exist
    await this.orderRepository.verifyProgress(id, orderId);
    await this.orderRepository.editProgressById(id, orderId, req.isFinish);
  }
}
