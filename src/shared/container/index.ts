import CustomersRepository from '@modules/customers/infra/typeorm/repositories/CustomersRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import OrdersRepository from '@modules/orders/infra/typeorm/repositories/OrdersRepository';
import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ProductsRepository from '@modules/products/infra/typeorm/repositories/ProductsRepository';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import { container } from 'tsyringe';

container.registerSingleton<ICustomersRepository>(
  'CustomersRepository',
  CustomersRepository,
);

container.registerSingleton<IProductsRepository>(
  'ProductsRepository',
  ProductsRepository,
);

container.registerSingleton<IOrdersRepository>(
  'OrdersRepository',
  OrdersRepository,
);
