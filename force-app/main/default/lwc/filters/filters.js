import { LightningElement, api, wire , track} from 'lwc';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import DISH_OBJECT from '@salesforce/schema/Dish__c';

export default class Filters extends LightningElement {
  
  @track categoryValuesList = [];
  @track subcategoryValuesList = [];
  @track subcategoryValues = [];
  @track selectedCategory;
  @track selectedSubcategory;
  @track error;
  @track controlValues;
  
  @track isDisabledSubcategory = false;

  @wire(getObjectInfo, { objectApiName: DISH_OBJECT })
  objectInfo;

  @wire(getPicklistValuesByRecordType, 
    { objectApiName: DISH_OBJECT, recordTypeId: '$objectInfo.data.defaultRecordTypeId'})
  categoryPicklistValues({ data, error }) {
    if (data) {
      this.error = null;
      let categoryOptions = [{label: 'All', value: 'All'}];
      this.selectedCategory = categoryOptions[0].value;
      data.picklistFieldValues.Category__c.values.forEach(category => {
        categoryOptions.push({
          label: category.label,
          value: category.value
        })
      });
      this.categoryValues = categoryOptions;
      
      let subcategoryOptions = [{label: 'All', value: 'All'}];
      this.selectedSubcategory = subcategoryOptions[0].value;
      this.controlValues = data.picklistFieldValues.Subcategory__c.controllerValues;
      this.subcategoryValuesList = data.picklistFieldValues.Subcategory__c.values;
      this.subcategoryValuesList.forEach( subcategory => {
        subcategoryOptions.push({
          label: subcategory.label,
          value: subcategory.value
        })
      });
      this.subcategoryValues = subcategoryOptions;
      this.isDisabledSubcategory = true;
    }
    if (error) {
      this.error = JSON.stringify(error);
    }
  }

  handleCategoryChange(event) {
    let subcategoryOptions = [{label: 'All', value: 'All'}];
    if (event.target.value === this.categoryValues[0].value) {
      this.selectedCategory = this.categoryValues[0].value;
      this.selectedSubcategory = subcategoryOptions[0].value;
      this.isDisabledSubcategory = true;
    } else {
      this.isDisabledSubcategory = false;
      this.selectedCategory = event.target.value;
      this.subcategoryValuesList.forEach( subcategory => {
        if (subcategory.validFor[0] === this.controlValues[this.selectedCategory]) {
          subcategoryOptions.push({
            label: subcategory.label,
            value: subcategory.value
          });
          this.selectedSubcategory = subcategoryOptions[0].value;
          this.subcategoryValues = subcategoryOptions;
        }
      });
    }
    this.dispatchCategoryFiltersSwitchEvent();
    
  }

  handleSubcategoryChange(event) {
    this.selectedSubcategory = event.target.value;
    this.dispatchCategoryFiltersSwitchEvent();
    
  }

  dispatchCategoryFiltersSwitchEvent() {
    const switchCategoryFilters = new CustomEvent('switchcategories', {
      detail: {
        category: this.selectedCategory,
        subcategory: this.selectedSubcategory
      }
    });
    this.dispatchEvent(switchCategoryFilters);
  }

}