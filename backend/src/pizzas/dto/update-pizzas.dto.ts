import { PartialType } from '@nestjs/mapped-types';
import { CreatePizzaDto } from './create-pizzas.dto';

export class UpdatePizzaDto extends PartialType(CreatePizzaDto) {}
