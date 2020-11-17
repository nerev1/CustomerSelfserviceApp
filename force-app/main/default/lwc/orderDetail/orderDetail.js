import { LightningElement, api, track } from 'lwc';

export default class OrderDetail extends LightningElement {
  @api dishes;
  @track dishList;
  @track totalPrice;

  closeModal() {
    const closeModalEvent = new CustomEvent('closemodalevent');
    this.dispatchEvent(closeModalEvent);
  }

  connectedCallback() {
    this.dishList = this.dishes;
    this.totalPrice = 0;
    this.dishList.forEach(dish => {
      this.totalPrice += dish.value.count * dish.value.price;
    });
  }
}