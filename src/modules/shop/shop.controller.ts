import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import {
  AddBasketItemDto,
  CheckoutOrderDto,
  ListProductsQueryDto,
  UpdateBasketItemQuantityDto,
} from './dto/shop.dto';
import { ShopService } from './shop.service';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  /** List / search products in the Wellbeing Shop. */
  @Get('products')
  listProducts(@Query() query: ListProductsQueryDto) {
    return this.shopService.listProducts(query);
  }

  /** Product details. */
  @Get('products/:id')
  getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopService.getProductById(id);
  }

  /** Product categories. */
  @Get('categories')
  listCategories() {
    return this.shopService.listCategories();
  }

  // --- Basket Routes (Customer session) ---

  /** Get user's persistent basket. */
  @UseGuards(PatientAuthGuard)
  @Get('basket')
  getBasket(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.shopService.getBasket(account.sub);
  }

  /** Add or update item in basket. */
  @UseGuards(PatientAuthGuard)
  @Post('basket/items')
  addItemToBasket(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: AddBasketItemDto,
  ) {
    return this.shopService.addItemToBasket(account.sub, body);
  }

  /** Update quantity of item in basket. */
  @UseGuards(PatientAuthGuard)
  @Patch('basket/items/:productId')
  updateItemQuantity(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: UpdateBasketItemQuantityDto,
  ) {
    return this.shopService.updateItemQuantity(account.sub, productId, body.quantity);
  }

  /** Remove item from basket. */
  @UseGuards(PatientAuthGuard)
  @Delete('basket/items/:productId')
  removeItemFromBasket(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.shopService.removeItemFromBasket(account.sub, productId);
  }

  /** Clear all items in basket. */
  @UseGuards(PatientAuthGuard)
  @Delete('basket')
  clearBasket(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.shopService.clearBasket(account.sub);
  }

  // --- Orders & Checkout ---

  /** Checkout and place order ("My shop orders"). */
  @UseGuards(PatientAuthGuard)
  @Post('orders')
  checkout(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: CheckoutOrderDto,
  ) {
    return this.shopService.checkout(account.sub, body);
  }

  /** List user's retail order history. */
  @UseGuards(PatientAuthGuard)
  @Get('orders')
  listOrders(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.shopService.listOrders(account.sub);
  }

  /** Get specific shop order detail. */
  @UseGuards(PatientAuthGuard)
  @Get('orders/:id')
  getOrderById(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shopService.getOrderById(account.sub, id);
  }
}
