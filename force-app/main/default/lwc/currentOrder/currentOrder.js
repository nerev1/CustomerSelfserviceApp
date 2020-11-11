import { subscribe, unsubscribe, APPLICATION_SCOPE,MessageContext } from 'lightning/messageService';
import ORDERMC from '@salesforce/messageChannel/DishCountUpdate__c';
import { LightningElement, api, wire, track } from 'lwc';

export default class CurrentOrder extends LightningElement {
  @wire(MessageContext)
  messageContext;
  @track subscription = null;
  @track hello;

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      ORDERMC,
      (message) => this.handleMessage(message),
      { scope: APPLICATION_SCOPE }
    );
  }

  handleMessage(message) {
    this.hello = message.hello;
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }
}