import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { GdriveService } from '../../common/gdrive.service';
import { IOrderService } from '../domain/order.service.interface';
import {
  AddOrderDataDto,
  AddOrderDto,
  EditOrderDataDto,
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
import { JsonUtil } from 'src/utils/json.util';

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
    const data = JsonUtil.parse<AddOrderDataDto>(req.data);

    try {
      this.validationService.validate(OrderValidation.ADD, {
        pictures: req.pictures,
        ...data,
      });

      // verify order progresses
      await this.processService.verifyAll(data.progresses, userId);

      orderPictures.push(...(await this.uploadOrderPictures(req.pictures)));

      return await this.orderRepository.add(
        mapAddOrderDto(userId, data),
        orderPictures,
        data.progresses,
      );
    } catch (e) {
      await this.rollbackUploadedPictures(orderPictures);
      throw e;
    } finally {
      await this.cleanupLocalFiles(req.pictures);
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
    const data = JsonUtil.parse<EditOrderDataDto>(req.data);

    try {
      this.validationService.validate(OrderValidation.EDIT_BY_ID, {
        addedPictures: req.addedPictures,
        ...data,
      });

      // verify order and order progresses
      await this.orderRepository.verify(id, userId);
      await this.processService.verifyAll(data.addedProgresses, userId);

      // verify if processes already exist. if exist, remove from request
      data.addedProgresses = await this.filterExistingProgresses(
        data.addedProgresses,
        id,
      );

      newPictures.push(...(await this.uploadOrderPictures(req.addedPictures)));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await this.prismaService.$transaction(async (tx) => {
        await this.orderRepository.addProgresses(id, data.addedProgresses);
        await this.orderRepository.deleteProgresses(id, data.deletedProgresses);
        await this.orderRepository.editById(
          id,
          mapEditOrderDto(data),
          newPictures,
        );
        await this.deleteRemovedPictures(data.deletedPictures);
      });
    } catch (e) {
      await this.rollbackUploadedPictures(newPictures);
      throw e;
    } finally {
      await this.cleanupLocalFiles(req.addedPictures);
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
    this.validationService.validate(OrderValidation.EDIT_PROGRESS_BY_ID, req);

    // verify the order with userId
    await this.orderRepository.verify(orderId, userId);
    // verify if the order progress exist
    await this.orderRepository.verifyProgress(id, orderId);
    await this.orderRepository.editProgressById(id, orderId, req.isFinish);
  }

  private async uploadOrderPictures(
    pictures: Express.Multer.File[],
  ): Promise<OrderPictureDto[]> {
    const folderId = process.env.GDRIVE_ORDER_FOLDER_ID;
    const uploadTasks = pictures.map((picture) =>
      this.gdriveService.upload(picture, folderId),
    );

    const uploadRes = await Promise.all(uploadTasks);
    return uploadRes.map((response) => ({
      id: response.id,
      url: `https://drive.google.com/uc?id=${response.id}`,
    }));
  }

  private async rollbackUploadedPictures(
    pictures: OrderPictureDto[],
  ): Promise<void> {
    await Promise.allSettled(
      pictures.map((picture) => this.gdriveService.delete(picture.id)),
    );
  }

  private async cleanupLocalFiles(
    pictures: Express.Multer.File[],
  ): Promise<void> {
    if (Array.isArray(pictures)) {
      await Promise.allSettled(
        pictures.map((picture) => fs.promises.unlink(picture.path)),
      );
    }
  }

  private async filterExistingProgresses(
    progresses: string[],
    orderId: string,
  ): Promise<string[]> {
    const validProgresses: string[] = [];

    await Promise.all(
      progresses.map(async (progressId) => {
        try {
          await this.orderRepository.verifyProgress(progressId, orderId);
        } catch (e) {
          if (e instanceof NotFoundException) {
            validProgresses.push(progressId);
          } else {
            throw e;
          }
        }
      }),
    );

    return validProgresses;
  }

  private async deleteRemovedPictures(pictureIds: string[]): Promise<void> {
    for (const pictureId of pictureIds) {
      try {
        await this.gdriveService.delete(pictureId);
      } catch (e) {
        if (!e.message.includes('File not found')) {
          throw e;
        }
      }
    }
  }
}
