public with sharing class DishOrderController {
  @AuraEnabled
  public static String makeOrder(Decimal totalPrice) {
    Order_Item__c order = new Order_Item__c(
      Total_Price__c = totalPrice
    );
    insert order;
    return order.Id;
  }

  @AuraEnabled
  public static void addDishToOrder(String orderId, 
                                      String dishId,
                                      String dishComment,
                                      Integer dishCount) {
    Order_Dish__c orderDish = new Order_Dish__c();
    orderDish.Order_Item__c = orderId;
    orderDish.Dish__c = dishId;
    orderDish.Dish_Count__c = dishCount;
    orderDish.Comment__c = dishComment;
    insert orderDish;
  }
}
