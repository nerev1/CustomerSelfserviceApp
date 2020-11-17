import { LightningElement, api, wire, track} from 'lwc';
import DISH_ORDER_MC from '@salesforce/messageChannel/DishCountUpdate__c';
import { publish, MessageContext } from 'lightning/messageService';

export default class DishTile extends LightningElement {
  @api dishId;
  @api dishName;
  @api dishPrice;
  @api dishDescription;
  @track dishComment = '';
  @track dishCount;
  @track isDecreaseDisabled;
  @track isCommentModalOpen = false;

  @wire(MessageContext)
  messageContext;

  decreaseCount() {
    this.dishCount--;
    this.updateDishItem();
    if (this.dishCount === 0) {
      this.isDecreaseDisabled = true;
    }
  }

  increaseCount() {
    this.dishCount++;
    this.updateDishItem();
    this.isDecreaseDisabled = false;
  }

  updateDishItem() {
    const message = {
      dishId: this.dishId,
      dishName: this.dishName,
      dishPrice: this.dishPrice,
      dishCount: this.dishCount,
      dishComment: this.dishComment
    }
    publish(this.messageContext, DISH_ORDER_MC, message);
  }

  @api
  resetDetail() {
    this.dishCount = 0;
    this.dishComment = '';
    this.updateDishItem();
    this.isDecreaseDisabled = true;
  }

  changeComment(event) {
    this.dishComment = event.target.value;
  }

  openCommentModal() {
    this.isCommentModalOpen = true;
  }

  confirmComment() {
    this.updateDishItem();
    this.isCommentModalOpen = false;
  }

  closeCommentModal() {
    this.dishComment = '';
    this.isCommentModalOpen = false;
  }

  connectedCallback() {
    this.isDecreaseDisabled = true;
    this.dishCount = 0;
  }
}