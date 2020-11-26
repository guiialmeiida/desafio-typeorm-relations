/* eslint-disable no-return-assign */
import CustomersRepository from '@modules/customers/infra/typeorm/repositories/CustomersRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import ProductsRepository from '@modules/products/infra/typeorm/repositories/ProductsRepository';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import Order from '../infra/typeorm/entities/Order';
import OrdersRepository from '../infra/typeorm/repositories/OrdersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject(OrdersRepository)
    private ordersRepository: IOrdersRepository,
    @inject(ProductsRepository)
    private productsRepository: IProductsRepository,
    @inject(CustomersRepository)
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found');
    }

    const existentProducts = await this.productsRepository.findAllById(
      products,
    );

    if (existentProducts.length < 1) {
      throw new AppError('Could not find any product with the given ids');
    }

    const existentProductsIds = existentProducts.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !existentProductsIds.includes(product.id),
    );

    if (checkInexistentProducts.length) {
      let products_ids = '=> ';
      checkInexistentProducts.forEach(
        item => (products_ids = ` ${products_ids} product_id: ${item.id}. `),
      );

      throw new AppError(`Could not find products with ids ${products_ids}`);
    }

    const productQuantityNoAvailable: IProduct[] = [];

    products.forEach(product =>
      existentProducts.forEach(item => {
        if (product.id === item.id) {
          if (product.quantity > item.quantity) {
            productQuantityNoAvailable.push(product);
          }
        }
      }),
    );

    if (productQuantityNoAvailable.length > 0) {
      let productIdNotquantity = ' => ';
      productQuantityNoAvailable.forEach(
        item =>
          (productIdNotquantity = `${productIdNotquantity} productId: ${item.id}. `),
      );

      throw new AppError(
        `The amount of the reported products ${productIdNotquantity} , is lower than in stock `,
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existentProducts.filter(item => item.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer,
      products: serializedProducts,
    });

    const orderedProductsQuantity = products.map(product => ({
      id: product.id,
      quantity:
        existentProducts.filter(item => item.id === product.id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
