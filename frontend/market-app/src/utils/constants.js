export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID_AWAITING_SHIPMENT: 'paid_awaiting_shipment',
  PENDING_MERCHANT_DELIVERY: 'pending_merchant_delivery',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  AT_HUB_VERIFICATION_PENDING: 'at_hub_verification_pending',
  AT_HUB_READY_FOR_PICKUP: 'at_hub_ready_for_pickup',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING_PAYMENT]: 'Pending Payment',
  [ORDER_STATUS.PAID_AWAITING_SHIPMENT]: 'Payment Received',
  [ORDER_STATUS.PENDING_MERCHANT_DELIVERY]: 'Awaiting Delivery',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.IN_TRANSIT]: 'In Transit',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.AT_HUB_VERIFICATION_PENDING]: 'At Hub - Pending Verification',
  [ORDER_STATUS.AT_HUB_READY_FOR_PICKUP]: 'Ready for Pickup',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const PAYMENT_METHODS = {
  MPESA: 'mpesa_delivery',
  COD: 'cash_on_delivery'
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  MERCHANT: 'merchant',
  ADMIN: 'admin',
  HUB_STAFF: 'hub_staff'
};
