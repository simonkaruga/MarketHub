"""
Merchant Analytics Routes
Analytics and performance metrics for merchants
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, date
from sqlalchemy import func, desc, and_
from app import db
from app.models.user import User
from app.models.product import Product
from app.models.order import SubOrder, OrderItem, SubOrderStatus
from app.models.review import Review
from app.utils.decorators import merchant_required

# Create blueprint
bp = Blueprint('merchant_analytics', __name__)


def parse_date_range(period=None, start_date=None, end_date=None):
    """
    Parse date range from query parameters
    
    Args:
        period: 'today', 'week', 'month', 'year', 'custom'
        start_date: Custom start date (YYYY-MM-DD)
        end_date: Custom end date (YYYY-MM-DD)
        
    Returns:
        tuple: (start_datetime, end_datetime)
    """
    now = datetime.utcnow()
    
    if period == 'today':
        start = datetime.combine(date.today(), datetime.min.time())
        end = now
    elif period == 'week':
        start = now - timedelta(days=7)
        end = now
    elif period == 'month':
        start = now - timedelta(days=30)
        end = now
    elif period == 'year':
        start = now - timedelta(days=365)
        end = now
    elif period == 'custom' and start_date and end_date:
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
            end = end.replace(hour=23, minute=59, second=59)
        except ValueError:
            return None, None
    else:
        # Default to last 30 days
        start = now - timedelta(days=30)
        end = now
    
    return start, end


@bp.route('/analytics/overview', methods=['GET'])
@merchant_required
def get_overview(current_user):
    """
    Get merchant dashboard overview
    
    GET /api/v1/merchant/analytics/overview?period=month
    Headers: Authorization: Bearer <merchant_token>
    
    Query Parameters:
    - period: today, week, month, year, custom (default: month)
    - start_date: YYYY-MM-DD (if period=custom)
    - end_date: YYYY-MM-DD (if period=custom)
    """
    # Parse date range
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    if not start or not end:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_DATE_RANGE',
                'message': 'Invalid date range'
            }
        }), 400
    
    # Total revenue (completed orders)
    total_revenue = db.session.query(
        func.sum(SubOrder.subtotal_amount)
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.status == SubOrderStatus.COMPLETED,
        SubOrder.updated_at.between(start, end)
    ).scalar() or 0
    
    # Total payout (revenue - commission)
    total_payout = db.session.query(
        func.sum(SubOrder.merchant_payout_amount)
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.status == SubOrderStatus.COMPLETED,
        SubOrder.updated_at.between(start, end)
    ).scalar() or 0
    
    # Total commission
    total_commission = float(total_revenue) - float(total_payout)
    
    # Total orders
    total_orders = SubOrder.query.filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).count()
    
    # Completed orders
    completed_orders = SubOrder.query.filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.status == SubOrderStatus.COMPLETED,
        SubOrder.created_at.between(start, end)
    ).count()
    
    # Pending orders
    pending_orders = SubOrder.query.filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.status.in_([
            SubOrderStatus.PENDING_PAYMENT,
            SubOrderStatus.PAID_AWAITING_SHIPMENT,
            SubOrderStatus.PENDING_MERCHANT_DELIVERY
        ])
    ).count()
    
    # Total products
    total_products = Product.query.filter_by(
        merchant_id=current_user.id,
        is_active=True
    ).count()
    
    # Products sold
    products_sold = db.session.query(
        func.sum(OrderItem.quantity)
    ).join(
        SubOrder, OrderItem.suborder_id == SubOrder.id
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).scalar() or 0
    
    # Average order value
    avg_order_value = db.session.query(
        func.avg(SubOrder.subtotal_amount)
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).scalar() or 0
    
    # Total reviews
    total_reviews = db.session.query(func.count(Review.id)).join(
        Product, Review.product_id == Product.id
    ).filter(
        Product.merchant_id == current_user.id
    ).scalar() or 0
    
    # Average rating
    avg_rating = db.session.query(func.avg(Review.rating)).join(
        Product, Review.product_id == Product.id
    ).filter(
        Product.merchant_id == current_user.id
    ).scalar()
    
    # Low stock products
    low_stock_count = Product.query.filter(
        Product.merchant_id == current_user.id,
        Product.is_active == True,
        Product.stock_quantity < 10
    ).count()
    
    return jsonify({
        'success': True,
        'data': {
            'period': {
                'start': start.isoformat(),
                'end': end.isoformat(),
                'label': period
            },
            'revenue': {
                'total': float(total_revenue),
                'payout': float(total_payout),
                'commission': float(total_commission)
            },
            'orders': {
                'total': total_orders,
                'completed': completed_orders,
                'pending': pending_orders,
                'completion_rate': round(completed_orders / total_orders * 100, 1) if total_orders > 0 else 0
            },
            'products': {
                'total': total_products,
                'units_sold': int(products_sold),
                'low_stock': low_stock_count
            },
            'performance': {
                'average_order_value': float(avg_order_value),
                'average_rating': round(float(avg_rating), 1) if avg_rating else 0,
                'total_reviews': total_reviews
            }
        }
    }), 200


@bp.route('/analytics/sales', methods=['GET'])
@merchant_required
def get_sales_analytics(current_user):
    """
    Get detailed sales analytics
    
    GET /api/v1/merchant/analytics/sales?period=month&group_by=day
    Headers: Authorization: Bearer <merchant_token>
    
    Query Parameters:
    - period: today, week, month, year, custom
    - group_by: day, week, month (for trends)
    """
    period = request.args.get('period', 'month')
    group_by = request.args.get('group_by', 'day')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    if not start or not end:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_DATE_RANGE',
                'message': 'Invalid date range'
            }
        }), 400
    
    # Sales by status
    status_breakdown = db.session.query(
        SubOrder.status,
        func.count(SubOrder.id).label('count'),
        func.sum(SubOrder.subtotal_amount).label('total')
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).group_by(SubOrder.status).all()
    
    # Top selling products
    top_products = db.session.query(
        Product.id,
        Product.name,
        Product.price,
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.quantity * OrderItem.price_at_purchase).label('total_revenue')
    ).join(
        OrderItem, Product.id == OrderItem.product_id
    ).join(
        SubOrder, OrderItem.suborder_id == SubOrder.id
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).group_by(
        Product.id, Product.name, Product.price
    ).order_by(
        desc('total_revenue')
    ).limit(10).all()
    
    # Sales trend (time series)
    if group_by == 'day':
        date_format = func.date(SubOrder.created_at)
    elif group_by == 'week':
        date_format = func.strftime('%Y-W%W', SubOrder.created_at)
    else:  # month
        date_format = func.strftime('%Y-%m', SubOrder.created_at)
    
    sales_trend = db.session.query(
        date_format.label('period'),
        func.count(SubOrder.id).label('orders'),
        func.sum(SubOrder.subtotal_amount).label('revenue')
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).group_by('period').order_by('period').all()
    
    return jsonify({
        'success': True,
        'data': {
            'status_breakdown': [
                {
                    'status': status.value,
                    'count': count,
                    'total': float(total) if total else 0
                }
                for status, count, total in status_breakdown
            ],
            'top_products': [
                {
                    'id': id,
                    'name': name,
                    'price': float(price),
                    'quantity_sold': int(qty),
                    'revenue': float(revenue)
                }
                for id, name, price, qty, revenue in top_products
            ],
            'sales_trend': [
                {
                    'period': period,
                    'orders': orders,
                    'revenue': float(revenue) if revenue else 0
                }
                for period, orders, revenue in sales_trend
            ]
        }
    }), 200


@bp.route('/analytics/products', methods=['GET'])
@merchant_required
def get_product_analytics(current_user):
    """
    Get product performance analytics
    
    GET /api/v1/merchant/analytics/products?period=month
    Headers: Authorization: Bearer <merchant_token>
    """
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    # Best performing products
    best_products = db.session.query(
        Product.id,
        Product.name,
        Product.price,
        Product.stock_quantity,
        func.sum(OrderItem.quantity).label('units_sold'),
        func.sum(OrderItem.quantity * OrderItem.price_at_purchase).label('revenue'),
        func.avg(Review.rating).label('avg_rating'),
        func.count(Review.id).label('review_count')
    ).outerjoin(
        OrderItem, Product.id == OrderItem.product_id
    ).outerjoin(
        SubOrder, OrderItem.suborder_id == SubOrder.id
    ).outerjoin(
        Review, Product.id == Review.product_id
    ).filter(
        Product.merchant_id == current_user.id,
        Product.is_active == True
    ).group_by(
        Product.id, Product.name, Product.price, Product.stock_quantity
    ).order_by(
        desc('revenue')
    ).limit(20).all()
    
    # Low stock alerts
    low_stock_products = Product.query.filter(
        Product.merchant_id == current_user.id,
        Product.is_active == True,
        Product.stock_quantity < 10
    ).order_by(Product.stock_quantity).all()
    
    # Products with no sales
    products_no_sales = db.session.query(
        Product.id,
        Product.name,
        Product.price,
        Product.stock_quantity,
        Product.created_at
    ).outerjoin(
        OrderItem, Product.id == OrderItem.product_id
    ).filter(
        Product.merchant_id == current_user.id,
        Product.is_active == True,
        OrderItem.id == None
    ).order_by(
        desc(Product.created_at)
    ).limit(20).all()
    
    return jsonify({
        'success': True,
        'data': {
            'best_performing': [
                {
                    'id': id,
                    'name': name,
                    'price': float(price),
                    'stock_quantity': stock,
                    'units_sold': int(units) if units else 0,
                    'revenue': float(revenue) if revenue else 0,
                    'average_rating': round(float(avg_rating), 1) if avg_rating else 0,
                    'review_count': review_count if review_count else 0
                }
                for id, name, price, stock, units, revenue, avg_rating, review_count in best_products
            ],
            'low_stock_alerts': [
                {
                    'id': p.id,
                    'name': p.name,
                    'stock_quantity': p.stock_quantity,
                    'price': float(p.price)
                }
                for p in low_stock_products
            ],
            'no_sales': [
                {
                    'id': id,
                    'name': name,
                    'price': float(price),
                    'stock_quantity': stock,
                    'days_listed': (datetime.utcnow() - created).days
                }
                for id, name, price, stock, created in products_no_sales
            ]
        }
    }), 200


@bp.route('/analytics/reviews', methods=['GET'])
@merchant_required
def get_review_analytics(current_user):
    """
    Get review analytics
    
    GET /api/v1/merchant/analytics/reviews?period=month
    Headers: Authorization: Bearer <merchant_token>
    """
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    # Rating distribution
    rating_distribution = db.session.query(
        Review.rating,
        func.count(Review.id).label('count')
    ).join(
        Product, Review.product_id == Product.id
    ).filter(
        Product.merchant_id == current_user.id,
        Review.created_at.between(start, end)
    ).group_by(Review.rating).all()
    
    # Recent reviews
    recent_reviews = db.session.query(Review).join(
        Product, Review.product_id == Product.id
    ).filter(
        Product.merchant_id == current_user.id
    ).order_by(desc(Review.created_at)).limit(10).all()
    
    # Products with most reviews
    most_reviewed = db.session.query(
        Product.id,
        Product.name,
        func.count(Review.id).label('review_count'),
        func.avg(Review.rating).label('avg_rating')
    ).join(
        Review, Product.id == Review.product_id
    ).filter(
        Product.merchant_id == current_user.id,
        Review.created_at.between(start, end)
    ).group_by(
        Product.id, Product.name
    ).order_by(
        desc('review_count')
    ).limit(10).all()
    
    return jsonify({
        'success': True,
        'data': {
            'rating_distribution': [
                {
                    'rating': rating,
                    'count': count
                }
                for rating, count in rating_distribution
            ],
            'recent_reviews': [review.to_dict(include_product=True) for review in recent_reviews],
            'most_reviewed_products': [
                {
                    'id': id,
                    'name': name,
                    'review_count': count,
                    'average_rating': round(float(avg), 1) if avg else 0
                }
                for id, name, count, avg in most_reviewed
            ]
        }
    }), 200


@bp.route('/analytics/orders', methods=['GET'])
@merchant_required
def get_order_analytics(current_user):
    """
    Get order analytics
    
    GET /api/v1/merchant/analytics/orders?period=month
    Headers: Authorization: Bearer <merchant_token>
    """
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    # Order status distribution
    order_status = db.session.query(
        SubOrder.status,
        func.count(SubOrder.id).label('count')
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).group_by(SubOrder.status).all()
    
    # Average order value
    avg_order_value = db.session.query(
        func.avg(SubOrder.subtotal_amount)
    ).filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.created_at.between(start, end)
    ).scalar()
    
    # Orders requiring action
    orders_requiring_action = SubOrder.query.filter(
        SubOrder.merchant_id == current_user.id,
        SubOrder.status.in_([
            SubOrderStatus.PAID_AWAITING_SHIPMENT,
            SubOrderStatus.PENDING_MERCHANT_DELIVERY
        ])
    ).count()
    
    return jsonify({
        'success': True,
        'data': {
            'status_distribution': [
                {
                    'status': status.value,
                    'count': count
                }
                for status, count in order_status
            ],
            'average_order_value': float(avg_order_value) if avg_order_value else 0,
            'orders_requiring_action': orders_requiring_action
        }
    }), 200