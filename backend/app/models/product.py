def get_average_rating(self):
        """
        Get average rating for this product
        
        Returns:
            float: Average rating (0 if no reviews)
        """
        from sqlalchemy import func
        from app.models.review import Review
        
        avg = db.session.query(func.avg(Review.rating)).filter_by(
            product_id=self.id
        ).scalar()
        
        return round(float(avg), 1) if avg else 0
    
    def get_review_count(self):
        """
        Get total number of reviews for this product
        
        Returns:
            int: Review count
        """
        from app.models.review import Review
        
        return Review.query.filter_by(product_id=self.id).count()
    
    def to_dict_with_reviews(self, include_merchant=True):
        """
        Convert product to dictionary including review stats
        
        Returns:
            dict: Product data with review statistics
        """
        product_dict = self.to_dict(include_merchant=include_merchant)
        product_dict['rating'] = {
            'average': self.get_average_rating(),
            'count': self.get_review_count()
        }
        return product_dict