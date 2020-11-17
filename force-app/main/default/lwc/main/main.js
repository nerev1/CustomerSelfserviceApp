import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
  resetOrderDetails() {
    this.template.querySelector('c-menu').resetOrderDetails();
  }
}