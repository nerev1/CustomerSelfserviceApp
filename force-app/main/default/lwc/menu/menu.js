import { LightningElement, api, track, wire} from 'lwc';
import getDishes from '@salesforce/apex/DishController.getDishes';

export default class Menu extends LightningElement {
  @track error;
  @track dishes;
  @track displayedDishes;
  @track firstDisplayedItemNumber;
  @track itemsPerPage;
  @track selectedCategory;
  @track selectedSubcategory;

  loadDishes() {
    return getDishes({
      category: this.selectedCategory,
      subcategory: this.selectedSubcategory
    })
      .then(result => {
        this.dishes = result;
        return result.length;
      })
      .then(result => {
        this.updateDispayedDishes();
        return result;
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
    this.updateDispayedDishes();
  }

  handleSwitchCategories(event) {
    this.selectedCategory = event.detail.category === 'All' ? null : event.detail.category;
    this.selectedSubcategory = event.detail.subcategory === 'All' ? null : event.detail.subcategory;
    this.loadDishes()
      .then(result => {
        this.resetPaginationItem(result);
      });
  }

  resetPaginationItem(count) {
    this.template.querySelector('c-paginator').resetPagination(count);
  }

  @api
  resetOrderDetails() {
    this.template.querySelectorAll('c-dish-tile').forEach(tile => {
      tile.resetDetail();
    });
  }

  connectedCallback() {
    this.loadDishes()
      .then(result => {
        this.resetPaginationItem(result);
      });
  }
}