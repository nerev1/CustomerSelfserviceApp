import { LightningElement, api, track } from 'lwc';

export default class Paginator extends LightningElement {
  @api totalItemsCount;

  @track itemsCount;
  @track itemsCountList;
  @track pageItemsCount;
  @track currentPage;
  @track pageCount;

  @track isFirstDisabled = true;
  @track isPreviousDisabled = true;
  @track isNextDisabled = true;
  @track isLastDisabled = true;

  handleChangeItemsCount(event) {
    this.pageItemsCount = event.target.value;
    this.currentPage = 1;
    this.generatePageButtons();
  }

  generatePageButtons() {
    this.pageCount = this.itemsCount < 1 ? 1 : Math.ceil(this.itemsCount / this.pageItemsCount);
    this.dispatchDispayedItems();
    this.togglePageButtonsState();
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

  dispatchDispayedItems() {
    let firstDisplayedItem = (this.currentPage - 1) * this.pageItemsCount + 1;
    let dishesInfo = { 
                      pageItemsCount: this.pageItemsCount,
                      firstDisplayedItemNumber: firstDisplayedItem
                     };
    const switchCountEvent = new CustomEvent('switchitemscount', {
      detail: dishesInfo
    });
    this.dispatchEvent(switchCountEvent);
  }

  connectedCallback() {
    this.itemsCount = this.totalItemsCount;
    this.itemsCountList = [
      {label: '4', value: '4'},
      {label: '8', value: '8'},
      {label: '12', value: '12'},
    ];
    this.currentPage = 1;
    this.pageItemsCount = 4;
    this.generatePageButtons();
  }

  @api
  resetPagination(count) {
    this.itemsCount = count;
    this.currentPage = 1;
    this.generatePageButtons();
  }
}