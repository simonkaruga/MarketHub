"""
Cloudinary Service
Handle image uploads to Cloudinary
"""
import cloudinary
import cloudinary.uploader
from flask import current_app
from werkzeug.utils import secure_filename
import os


def init_cloudinary():
    """Initialize Cloudinary configuration"""
    cloudinary.config(
        cloud_name=current_app.config.get('CLOUDINARY_CLOUD_NAME'),
        api_key=current_app.config.get('CLOUDINARY_API_KEY'),
        api_secret=current_app.config.get('CLOUDINARY_API_SECRET'),
        secure=True
    )


def upload_product_image(file):
    """
    Upload product image to Cloudinary
    
    Args:
        file: File object from request.files
        
    Returns:
        dict: {
            'url': 'https://res.cloudinary.com/...',
            'public_id': 'markethub/products/abc123'
        }
        or None if upload fails
    """
    try:
        # Initialize Cloudinary if not already done
        init_cloudinary()
        
        # Check if file is allowed
        if not is_allowed_file(file.filename):
            return None
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder='markethub/products',  # Organize in folders
            transformation=[
                {'width': 800, 'height': 800, 'crop': 'limit'},  # Max dimensions
                {'quality': 'auto'},  # Automatic quality optimization
                {'fetch_format': 'auto'}  # Automatic format (WebP if supported)
            ]
        )
        
        return {
            'url': result['secure_url'],
            'public_id': result['public_id']
        }
    
    except Exception as e:
        print(f"Cloudinary upload error: {str(e)}")
        return None


def delete_product_image(public_id):
    """
    Delete image from Cloudinary
    
    Args:
        public_id: Cloudinary public ID of the image
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    try:
        init_cloudinary()
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Cloudinary delete error: {str(e)}")
        return False


def is_allowed_file(filename):
    """
    Check if file extension is allowed
    
    Args:
        filename: Name of the file
        
    Returns:
        bool: True if allowed, False otherwise
    """
    if not filename:
        return False
    
    allowed_extensions = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions