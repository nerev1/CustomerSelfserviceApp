import { LightningElement, track, wire } from 'lwc';
import getOrders from '@salesforce/apex/DishOrderController.getOrders';
import ORDER_ITEM_OBJECT from '@salesforce/schema/Order_Item__c';
import STATUS_FIELD from '@salesforce/schema/Order_Item__c.Status__c';
import {getObjectInfo} from 'lightning/uiObjectInfoApi';
import {getPicklistValues} from 'lightning/uiObjectInfoApi';

export default class Orders extends LightningElement {
  @track orders;
  @track filteredOrders;
  @track error;
  @track columns = [
    { label: 'Total Price', fieldName: 'Total_Price__c', type: 'currency' },
    { label: 'Order Data', fieldName: 'Order_Date__c', type: 'date' },
    { label: 'Delivery Address', fieldName: 'Delivery_Address__c', type: 'text' },
    { label: 'Status', fieldName: 'Status__c', type: 'text' },
  ];
  @track statusOptions = []; 
  @track dateOptions=[]; 
  @track dishesOptions = [];
  
  @track totalPricesSum = 0;

  @wire(getObjectInfo, {objectApiName: ORDER_ITEM_OBJECT })
    orderInfo;

  @wire(getPicklistValues, {recordTypeId: '$orderInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD })
    statusFieldInfo({ data, error }) {
        if (data){
            this.statusOptions = [...data.values];
            this.statusOptions.push({label: 'All', value: 'All'});
        }
    }

  status = 'All';
  orderDate = 'All';
  orderDish = 'All';

  connectedCallback() {
    this.loadOrders();
  }
  
  closeModal() {
    this.dispatchCloseModal();
  }

  loadOrders() {
    return getOrders()
    .then(result => {
      this.orders = result;
      this.filteredOrders = result;
      this.getDateOptions(result);
      this.getDishOptions(result);
      this.calculateTotalPrice();
    })
    .catch(error => {
      this.error = error;
    });
  }

  filterOrders() {
    this.filteredOrders = this.orders;

    if(this.status != 'All') {
        this.filteredOrders = this.filteredOrders.filter((order) => {
            return order.Status__c == this.status;
        })
    }

    if(this.orderDate != 'All') {
        this.filteredOrders = this.filteredOrders.filter((order) => {
            return order.Order_Date__c == this.orderDate;
        })
    }

    if(this.orderDish != 'All') {
        this.filteredOrders = this.filteredOrders.filter((order) => {
            let orderItems = order.Order_Items__r;
            orderItems = orderItems.filter((orderItem) => {
                return orderItem.Dish__r.Name == this.orderDish;
            });
        return orderItems.length > 0;
      });
    }
  }
  
  handleStatusChange(event) {
    this.status = event.detail.value;
    this.filterOrders();
    this.calculateTotalPrice();
  }

  handleDateChange(event) {
      this.orderDate = event.detail.value;
      this.filterOrders();
      this.calculateTotalPrice();
  }

  handleDishChange(event) {
      this.orderDish = event.detail.value;
      this.filterOrders();
      this.calculateTotalPrice();
  }   

  getDateOptions(result){
      this.dateOptions = [{label:'All', value:'All'}];
      const setOfDate = new Set();
      result.forEach(element => {
          let date = element.Order_Date__c;
          setOfDate.add(date);
      });

      setOfDate.forEach(element => {
          this.dateOptions.push({value: element , label: element});
      });
  }

  getDishOptions(result){
      this.dishesOptions = [{label:'All', value:'All'}];
      const setOfDishes = new Set();
      result.forEach((order) => {
          const orderDishes = order.Order_Dishes__r;

          orderDishes.forEach((orderDish) => {
              setOfDishes.add(orderDish.Dish__r.Name);
              console.log(orderDish.Dish__r.Name)
          });
      });

      const arrayOfDishes = [...setOfDishes];

      arrayOfDishes.forEach((dishName) => {
          this.dishesOptions.push({
              label: dishName,
              value: dishName
          })
      });
  }

  calculateTotalPrice(){
    this.totalPricesSum = 0;

    this.filteredOrders.forEach((order) => {
        this.totalPricesSum += order.Total_Price__c;
    });
  }

  dispatchCloseModal() {
    this.status = 'All';
    this.orderDate = 'All';
    this.orderDish = 'All'; 
    const event = new CustomEvent('closemodal');
    this.dispatchEvent(event);
    this.getOrders();
  }
}