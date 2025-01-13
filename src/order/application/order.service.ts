import { Inject, Injectable } from '@nestjs/common';
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
      for (const picture of req.pictures) {
        const response = await this.gdriveService.upload(
          picture,
          process.env.GDRIVE_ORDER_FOLDER_ID,
        );

        orderPictures.push({
          id: response.id,
          url: `https://drive.google.com/uc?id=${response.id}`,
        });
      }

      return await this.orderRepository.add(
        mapAddOrderDto(userId, req),
        orderPictures,
        req.progresses,
      );
    } catch (e) {
      for (const picture of orderPictures) {
        await this.gdriveService.delete(picture.id);
      }

      throw e;
    } finally {
      // remove the local file
      for (const picture of req.pictures) {
        fs.promises.unlink(picture.path);
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
          await this.gdriveService.delete(pictureId);
        }
      });
    } catch (e) {
      for (const picture of newPictures) {
        await this.gdriveService.delete(picture.id);
      }

      throw e;
    } finally {
      // remove the local file
      for (const picture of req.addedPictures) {
        fs.promises.unlink(picture.path);
      }
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
