import { LightningElement, api, track } from 'lwc';

export default class Paginator extends LightningElement {
  @api totalItemsCount;
  
  @track itemsCountOnPage;
  @track firstDisplayedItem;
  
  @track currentPage;
  @track pageCount;
  @track itemsCountOnPageOptions;

  @track isFirstDisabled;
  @track isPreviousDisabled;
  @track isNextDisabled;
  @track isLastDisabled;
  
  connectedCallback() {
    this.itemsCountOnPageOptions = [
      {label: '4', value: '4'},
      {label: '8', value: '8'},
      {label: '12', value: '12'},
      {label: '16', value: '16'}
    ];
    this.currentPage = 1;
    this.itemsCountOnPage = +this.itemsCountOnPageOptions[0].value;
    this.generatePageButtons();
    this.dispatchDispayedItems();
  }

  handleChangeItemsCount(event) {
    this.itemsCountOnPage = event.target.value;
    this.currentPage = 1;
    this.generatePageButtons();
    this.dispatchDispayedItems();
  }

  generatePageButtons() {
    this.pageCount = this.totalItemsCount < 1 
      ? 1 
      : Math.ceil(this.totalItemsCount / this.itemsCountOnPage);
    this.firstDisplayedItem = (this.currentPage - 1) * this.itemsCountOnPage;
    this.dispatchDispayedItems();
    this.togglePageButtonsState();
  }

  dispatchDispayedItems() {
    let dishesInfo = {
                      itemsCountOnPage: +this.itemsCountOnPage,
                      firstDisplayedItem: this.firstDisplayedItem
                     };
    const switchCountEvent = new CustomEvent('switchitemscount', {
      detail: dishesInfo
    });
    this.dispatchEvent(switchCountEvent);
  }

  @api
  resetPagination(count) {
    this.itemsCount = count;
    this.currentPage = 1;
    this.generatePageButtons();
    this.dispatchDispayedItems();
  }

  togglePageButtonsState() {
    if (this.currentPage === 1) {
      this.isFirstDisabled = true;
      this.isPreviousDisabled = true;
    } else {
      this.isFirstDisabled = false;
      this.isPreviousDisabled = false;
    }

    if (this.currentPage === this.pageCount) {
      this.isLastDisabled = true;
      this.isNextDisabled = true;
    } else {
      this.isLastDisabled = false;
      this.isNextDisabled = false;
    }
  }

  clickFirstPage() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.generatePageButtons();
    }
  }

  clickPreviousPage() {
    if (this.currentPage !== 1) {
      this.currentPage--;
      this.generatePageButtons();
    }
  }

  clickLastPage() {
    if (this.currentPage !== this.pageCount) {
      this.currentPage = this.pageCount;
      this.generatePageButtons();
    }
  }

  clickNextPage() {
    if (this.currentPage !== this.pageCount) {
      this.currentPage++;
      this.generatePageButtons();
    }
  }
}