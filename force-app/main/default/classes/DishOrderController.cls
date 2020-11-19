public with sharing class DishOrderController {
  @AuraEnabled
  public static String makeOrder(Decimal totalPrice, 
                                 String deliveryAddress) {
    Date orderDate = System.today();
    String status = 'Ordered';
    Order_Item__c order = new Order_Item__c(
      Total_Price__c = totalPrice,
      Delivery_Address__c = deliveryAddress,
      Status__c = status,
      Order_Date__c = orderDate
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

  @AuraEnabled(Cacheable=true)
    public static List<Order_Item__c> getOrders() {
      Id currentUser = UserInfo.getUserId();    
      return [SELECT Id, Name, Order_Date__c, Status__c, Total_Price__c, Delivery_Address__c, (SELECT Dish__r.Name FROM Order_Dishes__r) 
              FROM Order_Item__c 
              WHERE OwnerId = :currentUser
              ORDER BY Order_Date__c DESC];
    }
}