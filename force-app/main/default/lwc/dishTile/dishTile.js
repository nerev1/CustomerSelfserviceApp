import { LightningElement, api} from 'lwc';

export default class DishTile extends LightningElement {
  @api dishName;
  @api dishPrice;
  @api dishDescription;
}