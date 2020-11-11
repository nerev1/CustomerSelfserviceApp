import { publish, MessageContext } from 'lightning/messageService';
import ORDERMC from '@salesforce/messageChannel/DishCountUpdate__c';
import { LightningElement, track, wire} from 'lwc';
import getDishes from '@salesforce/apex/DishController.getDishes';

export default class Menu extends LightningElement {
  @track error;
  @track dishes;
  @track displayedDishes;
  @track itemsCount;
  @track firstDisplayedItemNumber;
  @track itemsPerPage;
  @track selectedCategory;
  @track selectedSubcategory;
  @track count;
  @track hello = '2ss';
  @wire(MessageContext)
  messageContext;

  handleMenuClick() {
    const message = {
      hello: this.hello
    }
    publish(this.messageContext, ORDERMC, message);
    alert(message.dishCount);
  }

  loadDishes() {
    getDishes({
      category: this.selectedCategory,
      subcategory: this.selectedSubcategory
    })
      .then(result => {
        this.dishes = result;
        this.updateDispayedDishes();
      })
      .catch(error => {
        this.error = error;
      });
  }

  updateDispayedDishes() {
    this.displayedDishes = [];
    let lastDisplayedItemNumber = +this.firstDisplayedItemNumber + +this.itemsPerPage;
    for (let i = this.firstDisplayedItemNumber; i < lastDisplayedItemNumber; i++) {
      if (this.dishes[i]) {
        this.displayedDishes.push(this.dishes[i]);
      }
    }
  }

  handleChangeItemsCount(event) {
    this.itemsPerPage = event.detail.pageItemsCount;
    this.firstDisplayedItemNumber = event.detail.firstDisplayedItemNumber - 1;
    this.loadDishes()
      .then(result => {
        this.template.querySelector('c-paginator').resetPagination(this.dishes.length);
      });
  }

  handleSwitchCategories(event) {
    this.selectedCategory = event.detail.category === 'All' ? null : event.detail.category;
    this.selectedSubcategory = event.detail.subcategory === 'All' ? null : event.detail.subcategory;
    this.loadDishes()
      .then(result => {
        this.template.querySelector('c-paginator').resetPagination(this.dishes.length);
      });
  }

  connectedCallback() {
    this.loadDishes();
  }
}