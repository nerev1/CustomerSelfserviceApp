import { subscribe, unsubscribe, APPLICATION_SCOPE,MessageContext } from 'lightning/messageService';
import DISH_ORDER_MC from '@salesforce/messageChannel/DishCountUpdate__c';
import { LightningElement, api, wire, track } from 'lwc';
import makeOrder from '@salesforce/apex/DishOrderController.makeOrder';
import addDishToOrder from '@salesforce/apex/DishOrderController.addDishToOrder';

export default class CurrentOrder extends LightningElement {
  @wire(MessageContext)
  messageContext;
  @track subscription = null;
  @track dishMap = new Map();
  @track dishes = [];
  @track isModalOpen = false;
  @track totalPrice = 0;

  @track orderId;

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      DISH_ORDER_MC,
      (message) => this.handleMessage(message),
      { scope: APPLICATION_SCOPE }
    );
  }

  handleMessage(message) {
    if (this.dishMap.has(message.dishId)) {
      if (message.dishCount > 0) {
        let dishDetail = this.dishMap.get(message.dishId);
        dishDetail.count = message.dishCount;
        dishDetail.comment = message.dishComment;
        dishDetail.totalPrice = dishDetail.count * dishDetail.price;
      } else {
        this.dishMap.delete(message.dishId);
      }
    } else {
      if (message.dishCount) {
        this.dishMap.set(message.dishId, {
          name: message.dishName,
          price: message.dishPrice,
          count: message.dishCount,
          totalPrice: message.dishPrice,
          comment: message.dishComment
        });
      }
    }
    this.mapToArray();
    this.updateTotalPrice();
  }

  mapToArray() {
    this.dishes = [];
    for (let key of this.dishMap.keys()) {
      this.dishes.push({
        key: key,
        value: this.dishMap.get(key)
      });
    }
  }

  updateTotalPrice() {
    this.totalPrice = 0;
    this.dishes.forEach(dish => {
      this.totalPrice += dish.value.count * dish.value.price;
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
  }

  makeAnOrder() {
    if (!this.dishes) {
      return;
    }
    makeOrder({totalPrice: this.totalPrice})
      .then(result => {
        return result;
      })
      .then(result => {
        console.log(result);
        for (let [key, value] of this.dishMap) {
          console.log(key + ' . ' + value);
          addDishToOrder({
            orderId: result,
            dishId: key,
            dishComment: value.comment,
            dishCount: value.count
          });
        }
      })
      .catch(error => {
        console.log(JSON.stringify(error));
      });
    //this.dishMap = new Map();
    //this.dishes = [];
    const resetOrderDetails = new CustomEvent('resetorder');
    this.dispatchEvent(resetOrderDetails);
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }
}