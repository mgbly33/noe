import { Controller, Get } from '@nestjs/common';

import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  async listProducts() {
    return {
      code: 0,
      data: await this.catalogService.listProducts(),
    };
  }
}
