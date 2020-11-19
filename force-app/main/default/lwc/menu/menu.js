import { LightningElement, api, track, wire} from 'lwc';
import getDishes from '@salesforce/apex/DishController.getDishes';
import DISH_ORDER_MC from '@salesforce/messageChannel/DishCountUpdate__c';
import { publish, MessageContext } from 'lightning/messageService';

export default class Menu extends LightningElement {
  @track dishes;
  @track allDishesData;
  @track firstDisplayedItem;
  @track itemsCountOnPage;
  @track category;
  @track subcategory;
  @track displayedDishes;
  @track error;
  @track isOpenHistory = false;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.doInit();
  }

  doInit() {
    this.category = null;
    this.subcategory = null;
    this.loadDishes()
    .then(result => {
      this.allDishesData = result.map((dish) => ({
        ...dish,
        comment: '',
        count: 0
      }));
    })
    .then(() => {
      this.syncDishOrderData();
    })
    .then(() => {
      this.updateDisplayedDishes();
      this.template.querySelector('c-paginator').resetPagination(this.dishes.length);
    })
    .then(() => {
      this.publishDishesData();
    })
    .catch(error => {
      this.error = error;
    });
  }

  loadDishes() {
    return getDishes({
      category: this.category,
      subcategory: this.subcategory
    })
    .then(result => {
      this.dishes = result;
      return result;
    })
    .catch(error => {
      this.error = error;
    });
  }

  handleUpdateDishData(event) {
    const id = event.detail.dishId;
    const comment = event.detail.dishComment;
    const count = event.detail.dishCount;
    this.allDishesData.forEach(dish => {
      if (dish.Id === id) {
        dish.comment = comment;
        dish.count = count;
      }
    });
    this.syncDishOrderData();
    this.publishDishesData();
  }

  updateDisplayedDishes() {
    this.displayedDishes = [];
    let lastDisplayedItem = this.firstDisplayedItem + this.itemsCountOnPage;
    for (let i = this.firstDisplayedItem; i < lastDisplayedItem; i++) {
      if (this.dishes[i]) {
        this.displayedDishes.push(this.dishes[i]);
      }
    }
  }

  handleChangeItemsCount(event) {
    this.itemsCountOnPage = event.detail.itemsCountOnPage;
    this.firstDisplayedItem = event.detail.firstDisplayedItem;
    this.updateDisplayedDishes();
  }

  handleSwitchCategories(event) {
    this.category = event.detail.category === 'All' ? null : event.detail.category;
    this.subcategory = event.detail.subcategory === 'All' ? null : event.detail.subcategory;
    this.loadDishes()
    .then((result) => {
      this.syncDishOrderData();
      this.template.querySelector('c-paginator').resetPagination(result.length);
    })
    .catch(error => {
      this.error = error;
      console.log(error);
    });
  }

  syncDishOrderData() {
    let result = [];
    this.dishes.forEach(dish => {
      result.push(this.allDishesData.find(dishData => dishData.Id === dish.Id));
    });
    this.dishes = result;
  }

  publishDishesData() {
    const message = {
      dishes: this.allDishesData,
    }
    publish(this.messageContext, DISH_ORDER_MC, message);
  }

  openOrderHistory() {
    this.isOpenHistory = true;
  }

  closeOrderHistory() {
    this.isOpenHistory = false;
  }

  @api
  resetOrderDetails() {
    this.doInit();
  }
}