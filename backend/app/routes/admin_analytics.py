"""
Admin Analytics Routes
Business intelligence and reporting for admins
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, date
from sqlalchemy import func, desc, and_, or_
from app import db
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.category import Category
from app.models.order import (
    MasterOrder, SubOrder, OrderItem,
    PaymentMethod, PaymentStatus, SubOrderStatus
)
from app.models.review import Review
from app.models.merchant_application import MerchantApplication, ApplicationStatus
from app.models.hub import Hub
from app.utils.decorators import admin_required

# Create blueprint
bp = Blueprint('admin_analytics', __name__)


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
@admin_required
def get_overview(current_user):
    """
    Get dashboard overview with key metrics
    
    GET /api/v1/admin/analytics/overview?period=month
    Headers: Authorization: Bearer <admin_token>
    
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
        SubOrder.status == SubOrderStatus.COMPLETED,
        SubOrder.updated_at.between(start, end)
    ).scalar() or 0
    
    # Total commission
    total_commission = db.session.query(
        func.sum(SubOrder.commission_amount)
    ).filter(
        SubOrder.status == SubOrderStatus.COMPLETED,
        SubOrder.updated_at.between(start, end)
    ).scalar() or 0
    
    # Total orders
    total_orders = MasterOrder.query.filter(
        MasterOrder.created_at.between(start, end)
    ).count()
    
    # Completed orders
    completed_orders = db.session.query(func.count(func.distinct(MasterOrder.id))).join(
        SubOrder, MasterOrder.id == SubOrder.master_order_id
    ).filter(
        SubOrder.status == SubOrderStatus.COMPLETED,
        MasterOrder.created_at.between(start, end)
    ).scalar() or 0
    
    # New users
    new_customers = User.query.filter(
        User.role == UserRole.CUSTOMER,
        User.created_at.between(start, end)
    ).count()
    
    new_merchants = User.query.filter(
        User.role == UserRole.MERCHANT,
        User.created_at.between(start, end)
    ).count()
    
    # Active merchants (with products)
    active_merchants = db.session.query(func.count(func.distinct(Product.merchant_id))).filter(
        Product.is_active == True
    ).scalar() or 0
    
    # Total products
    total_products = Product.query.filter_by(is_active=True).count()
    
    # New reviews
    new_reviews = Review.query.filter(
        Review.created_at.between(start, end)
    ).count()
    
    # Average rating
    avg_rating = db.session.query(func.avg(Review.rating)).filter(
        Review.created_at.between(start, end)
    ).scalar()
    
    # Pending applications
    pending_applications = MerchantApplication.query.filter_by(
        status=ApplicationStatus.PENDING
    ).count()
    
    # Payment method breakdown
    mpesa_orders = MasterOrder.query.filter(
        MasterOrder.payment_method == PaymentMethod.MPESA_DELIVERY,
        MasterOrder.created_at.between(start, end)
    ).count()
    
    cod_orders = MasterOrder.query.filter(
        MasterOrder.payment_method == PaymentMethod.COD,
        MasterOrder.created_at.between(start, end)
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
                'commission': float(total_commission),
                'merchant_payout': float(total_revenue - total_commission)
            },
            'orders': {
                'total': total_orders,
                'completed': completed_orders,
                'completion_rate': round(completed_orders / total_orders * 100, 1) if total_orders > 0 else 0
            },
            'users': {
                'new_customers': new_customers,
                'new_merchants': new_merchants,
                'active_merchants': active_merchants
            },
            'products': {
                'total': total_products
            },
            'reviews': {
                'count': new_reviews,
                'average_rating': round(float(avg_rating), 1) if avg_rating else 0
            },
            'applications': {
                'pending': pending_applications
            },
            'payment_methods': {
                'mpesa': mpesa_orders,
                'cod': cod_orders
            }
        }
    }), 200


@bp.route('/analytics/sales', methods=['GET'])
@admin_required
def get_sales_analytics(current_user):
    """
    Get detailed sales analytics
    
    GET /api/v1/admin/analytics/sales?period=month&group_by=day
    Headers: Authorization: Bearer <admin_token>
    
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
        SubOrder.created_at.between(start, end)
    ).group_by(SubOrder.status).all()
    
    # Payment method breakdown with revenue
    payment_breakdown = db.session.query(
        MasterOrder.payment_method,
        func.count(MasterOrder.id).label('count'),
        func.sum(MasterOrder.total_amount).label('total')
    ).filter(
        MasterOrder.created_at.between(start, end)
    ).group_by(MasterOrder.payment_method).all()
    
    # Top selling products
    top_products = db.session.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.quantity * OrderItem.price_at_purchase).label('total_revenue')
    ).join(
        OrderItem, Product.id == OrderItem.product_id
    ).join(
        SubOrder, OrderItem.suborder_id == SubOrder.id
    ).filter(
        SubOrder.created_at.between(start, end)
    ).group_by(
        Product.id, Product.name
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
            'payment_breakdown': [
                {
                    'method': method.value,
                    'count': count,
                    'total': float(total) if total else 0
                }
                for method, count, total in payment_breakdown
            ],
            'top_products': [
                {
                    'id': id,
                    'name': name,
                    'quantity_sold': int(qty),
                    'revenue': float(revenue)
                }
                for id, name, qty, revenue in top_products
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


@bp.route('/analytics/users', methods=['GET'])
@admin_required
def get_user_analytics(current_user):
    """
    Get user statistics
    
    GET /api/v1/admin/analytics/users?period=month
    Headers: Authorization: Bearer <admin_token>
    """
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    # User counts by role
    user_counts = db.session.query(
        User.role,
        func.count(User.id).label('count')
    ).group_by(User.role).all()
    
    # New users trend
    new_users_trend = db.session.query(
        func.date(User.created_at).label('date'),
        User.role,
        func.count(User.id).label('count')
    ).filter(
        User.created_at.between(start, end)
    ).group_by(
        'date', User.role
    ).order_by('date').all()
    
    # Active merchants (with orders)
    active_merchants = db.session.query(
        func.count(func.distinct(SubOrder.merchant_id))
    ).filter(
        SubOrder.created_at.between(start, end)
    ).scalar() or 0
    
    # Active customers (with orders)
    active_customers = db.session.query(
        func.count(func.distinct(MasterOrder.customer_id))
    ).filter(
        MasterOrder.created_at.between(start, end)
    ).scalar() or 0
    
    # Top customers by spend
    top_customers = db.session.query(
        User.id,
        User.name,
        User.email,
        func.count(MasterOrder.id).label('order_count'),
        func.sum(MasterOrder.total_amount).label('total_spent')
    ).join(
        MasterOrder, User.id == MasterOrder.customer_id
    ).filter(
        MasterOrder.created_at.between(start, end),
        MasterOrder.payment_status == PaymentStatus.PAID
    ).group_by(
        User.id, User.name, User.email
    ).order_by(
        desc('total_spent')
    ).limit(10).all()
    
    return jsonify({
        'success': True,
        'data': {
            'user_counts': [
                {
                    'role': role.value,
                    'count': count
                }
                for role, count in user_counts
            ],
            'new_users_trend': [
                {
                    'date': date.isoformat(),
                    'role': role.value,
                    'count': count
                }
                for date, role, count in new_users_trend
            ],
            'active_users': {
                'merchants': active_merchants,
                'customers': active_customers
            },
            'top_customers': [
                {
                    'id': id,
                    'name': name,
                    'email': email,
                    'order_count': order_count,
                    'total_spent': float(total_spent)
                }
                for id, name, email, order_count, total_spent in top_customers
            ]
        }
    }), 200


@bp.route('/analytics/products', methods=['GET'])
@admin_required
def get_product_analytics(current_user):
    """
    Get product performance analytics
    
    GET /api/v1/admin/analytics/products?period=month
    Headers: Authorization: Bearer <admin_token>
    """
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    # Total products by category
    products_by_category = db.session.query(
        Category.name,
        func.count(Product.id).label('count')
    ).join(
        Product, Category.id == Product.category_id
    ).filter(
        Product.is_active == True
    ).group_by(Category.name).all()
    
    # Best performing products
    best_products = db.session.query(
        Product.id,
        Product.name,
        Product.price,
        Category.name.label('category'),
        func.sum(OrderItem.quantity).label('units_sold'),
        func.sum(OrderItem.quantity * OrderItem.price_at_purchase).label('revenue'),
        func.avg(Review.rating).label('avg_rating'),
        func.count(Review.id).label('review_count')
    ).join(
        OrderItem, Product.id == OrderItem.product_id
    ).join(
        SubOrder, OrderItem.suborder_id == SubOrder.id
    ).outerjoin(
        Category, Product.category_id == Category.id
    ).outerjoin(
        Review, Product.id == Review.product_id
    ).filter(
        SubOrder.created_at.between(start, end)
    ).group_by(
        Product.id, Product.name, Product.price, Category.name
    ).order_by(
        desc('revenue')
    ).limit(20).all()
    
    # Low stock alerts
    low_stock_products = Product.query.filter(
        Product.is_active == True,
        Product.stock_quantity < 10
    ).order_by(Product.stock_quantity).limit(20).all()
    
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
        Product.is_active == True,
        OrderItem.id == None
    ).order_by(
        desc(Product.created_at)
    ).limit(20).all()
    
    return jsonify({
        'success': True,
        'data': {
            'products_by_category': [
                {
                    'category': name,
                    'count': count
                }
                for name, count in products_by_category
            ],
            'best_performing': [
                {
                    'id': id,
                    'name': name,
                    'price': float(price),
                    'category': category,
                    'units_sold': int(units) if units else 0,
                    'revenue': float(revenue) if revenue else 0,
                    'average_rating': round(float(avg_rating), 1) if avg_rating else 0,
                    'review_count': review_count if review_count else 0
                }
                for id, name, price, category, units, revenue, avg_rating, review_count in best_products
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


@bp.route('/analytics/merchants', methods=['GET'])
@admin_required
def get_merchant_analytics(current_user):
    """
    Get merchant performance analytics
    
    GET /api/v1/admin/analytics/merchants?period=month
    Headers: Authorization: Bearer <admin_token>
    """
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    # Top merchants by revenue
    top_merchants = db.session.query(
        User.id,
        User.name,
        User.email,
        func.count(SubOrder.id).label('order_count'),
        func.sum(SubOrder.subtotal_amount).label('total_revenue'),
        func.sum(SubOrder.merchant_payout_amount).label('payout'),
        func.avg(Review.rating).label('avg_rating')
    ).join(
        SubOrder, User.id == SubOrder.merchant_id
    ).outerjoin(
        Product, User.id == Product.merchant_id
    ).outerjoin(
        Review, Product.id == Review.product_id
    ).filter(
        User.role == UserRole.MERCHANT,
        SubOrder.created_at.between(start, end),
        SubOrder.status == SubOrderStatus.COMPLETED
    ).group_by(
        User.id, User.name, User.email
    ).order_by(
        desc('total_revenue')
    ).limit(20).all()
    
    # Merchant application stats
    application_stats = db.session.query(
        MerchantApplication.status,
        func.count(MerchantApplication.id).label('count')
    ).group_by(MerchantApplication.status).all()
    
    return jsonify({
        'success': True,
        'data': {
            'top_merchants': [
                {
                    'id': id,
                    'name': name,
                    'email': email,
                    'order_count': order_count,
                    'total_revenue': float(revenue),
                    'payout': float(payout),
                    'average_rating': round(float(avg_rating), 1) if avg_rating else 0
                }
                for id, name, email, order_count, revenue, payout, avg_rating in top_merchants
            ],
            'application_stats': [
                {
                    'status': status.value,
                    'count': count
                }
                for status, count in application_stats
            ]
        }
    }), 200


@bp.route('/analytics/orders', methods=['GET'])
@admin_required
def get_order_analytics(current_user):
    """
    Get order analytics
    
    GET /api/v1/admin/analytics/orders?period=month
    Headers: Authorization: Bearer <admin_token>
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
        SubOrder.created_at.between(start, end)
    ).group_by(SubOrder.status).all()
    
    # Average order value
    avg_order_value = db.session.query(
        func.avg(MasterOrder.total_amount)
    ).filter(
        MasterOrder.created_at.between(start, end)
    ).scalar()
    
    # Orders by hub (COD)
    orders_by_hub = db.session.query(
        Hub.name,
        func.count(SubOrder.id).label('order_count'),
        func.sum(SubOrder.subtotal_amount).label('total_value')
    ).join(
        SubOrder, Hub.id == SubOrder.hub_id
    ).filter(
        SubOrder.created_at.between(start, end)
    ).group_by(Hub.name).all()
    
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
            'orders_by_hub': [
                {
                    'hub': name,
                    'order_count': count,
                    'total_value': float(value) if value else 0
                }
                for name, count, value in orders_by_hub
            ]
        }
    }), 200


@bp.route('/analytics/reviews', methods=['GET'])
@admin_required
def get_review_analytics(current_user):
    """
    Get review analytics
    
    GET /api/v1/admin/analytics/reviews?period=month
    Headers: Authorization: Bearer <admin_token>
    """
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    start, end = parse_date_range(period, start_date, end_date)
    
    # Rating distribution
    rating_distribution = db.session.query(
        Review.rating,
        func.count(Review.id).label('count')
    ).filter(
        Review.created_at.between(start, end)
    ).group_by(Review.rating).all()
    
    # Reviews trend
    reviews_trend = db.session.query(
        func.date(Review.created_at).label('date'),
        func.count(Review.id).label('count'),
        func.avg(Review.rating).label('avg_rating')
    ).filter(
        Review.created_at.between(start, end)
    ).group_by('date').order_by('date').all()
    
    # Products with most reviews
    most_reviewed = db.session.query(
        Product.id,
        Product.name,
        func.count(Review.id).label('review_count'),
        func.avg(Review.rating).label('avg_rating')
    ).join(
        Review, Product.id == Review.product_id
    ).filter(
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
            'reviews_trend': [
                {
                    'date': date.isoformat(),
                    'count': count,
                    'average_rating': round(float(avg), 1) if avg else 0
                }
                for date, count, avg in reviews_trend
            ],
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