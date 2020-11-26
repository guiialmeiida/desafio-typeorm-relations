import ICreateProductDTO from '../dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '../dtos/IUpdateProductsQuantityDTO';
import Product from '../infra/typeorm/entities/Product';


interface IFindProducts {
  id: string;
}

export default interface IProductsRepository {
  create(data: ICreateProductDTO): Promise<Product>;
  findByName(name: string, create?: boolean): Promise<Product | undefined>;
  findAllById(products: IFindProducts[]): Promise<Product[]>;
  updateQuantity(products: IUpdateProductsQuantityDTO[]): Promise<Product[]>;
}
