import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Badge, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toast, ToastContainer } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './footer';
import NavaPro from './navbarproduct';
// Helper function to render star ratings
const renderStars = (rating, color = "#ffc107") => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <span style={{ color }}>
            {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="bi bi-star-fill"></i>)}
            {halfStar && <i key="half" className="bi bi-star-half"></i>}
            {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="bi bi-star"></i>)}
        </span>
    );
};

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem("userid");
    const name = localStorage.getItem("user_name");

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('details');
    const [showReviewForm, setShowReviewForm] = useState(false);

    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [backendReviews, setBackendReviews] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    const fetchReviews = () => {
        if (product?._id) {
            axios.get(`https://backend-d6mx.vercel.app/fetch/review/${product._id}`)
                .then((res) => setBackendReviews(res.data.getreview || []))
                .catch((err) => console.error("Error fetching reviews:", err));
        }
    };
    
    useEffect(() => {
        setLoading(true);
        axios.get(`https://backend-d6mx.vercel.app/product/${id}`)
            .then((res) => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch product:', err);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (product?._id) {
            fetchReviews();
            if (product.ProductCategory) {
                axios.get(`https://backend-d6mx.vercel.app/related-products/${product.ProductCategory}?exclude=${product._id}`)
                    .then((res) => setRelatedProducts(res.data))
                    .catch((err) => console.error("Failed to fetch related products:", err));
            }
        }
    }, [product]);

    const handleQuantity = (delta) => setQuantity(q => Math.max(1, q + delta));
    
    const handleAddToCart = () => {
        if (!userId || userId === "undefined") {
            showToast("Please log in to add items to your cart.", "danger");
            return;
        }
        const cartData = {
            customerid: userId,
            Vendorid: product.Vendor?._id,
            productid: product._id,
            producturl: Array.isArray(product.ProductUrl) ? product.ProductUrl[0] : product.ProductUrl,
            productname: product.ProductName,
            productQuantity: quantity,
            productprice: product.ProductPrice,
            productvendor: product.Vendor?.Business_Name || "Unknown Vendor"
        };
        axios.post("https://backend-d6mx.vercel.app/api/cart", cartData)
            .then(res => showToast("Product added to cart!", "success"))
            .catch(err => showToast("Something went wrong.", "danger"));
    };

    const handleSubmitReview = () => {
        if (!userId || userId === "undefined") {
            showToast("Please log in to submit a review.", "danger");
            return;
        }
        if (!reviewText.trim() || reviewRating === 0) {
            showToast("Please provide a rating and comment.", "danger");
            return;
        }
        axios.post(`https://backend-d6mx.vercel.app/review/${userId}`, {
            productId: product._id,
            customerName: name,
            rating: reviewRating,
            comment: reviewText
        })
        .then(() => {
            showToast("Review submitted successfully!", "success");
            setReviewText('');
            setReviewRating(0);
            setShowReviewForm(false);
            fetchReviews();
        })
        .catch((err) => {
            console.log(err);
            showToast("Failed to submit review.", "danger");
        });
    };

    const keyFeatures = [
        "High compressive strength for durable construction", "Excellent workability and pumpability",
        "Superior finish and aesthetics", "Consistent quality and performance",
        "Eco-friendly manufacturing process", "Suitable for all weather conditions",
        "Faster setting time for quick construction", "Reduced shrinkage and cracking"
    ];

    const styles = `
    .product-detail-page { background-color: #ffffff; color: #1A202C; }

      .breadcrumb-nav a, .breadcrumb-nav span { color: #A0AEC0; text-decoration: none; font-size: 0.9rem; }
      .breadcrumb-nav a:hover { color: #050505ff; }
      .main-image { width: 100%; height: 450px; object-fit: cover; border-radius: 8px; border: 1px solid #2D3748; }
      .thumbnail-container { display: flex; gap: 10px; margin-top: 10px; }
      .thumbnail-img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
      .thumbnail-img:hover { border-color: #4A5568; }
      .thumbnail-img.active { border-color: #FFD700; }

      .product-category-text { font-size: 0.9rem; color: #A0AEC0; margin-bottom: 4px; }
      .product-title { font-size: 1.8rem; font-weight: bold; color: #0f0f0fff; }
      .price { font-size: 2rem; font-weight: bold; color: #000000ff; }
      .old-price { text-decoration: line-through; color: #718096; margin-left: 10px; }
      .discount-badge { color: #48BB78; font-weight: bold; margin-left: 10px; }
      .seller-card { background-color: #2D3748; padding: 1rem; border-radius: 8px; border: 1px solid #4A5568; }
      .btn-add-to-cart { background-color: #FFD700; border: none; font-weight: bold; color: #000; }
.btn-buy-now { background-color: #FFD700; border-color: #FFD700; font-weight: bold; color: #000; }

      .tab-nav { border-bottom: 1px solid #2D3748; padding-bottom: 0.5rem; }
      .tab-button.active { color: #FFD700; border-bottom-color: #FFD700; }

      .tab-button { background: none; border: none; color: #A0AEC0; padding: 0.5rem 1rem; font-weight: 600; border-bottom: 3px solid transparent; }
      .review-card { background-color: #2D3748; border-radius: 8px; border: 1px solid #4A5568; }
      .related-product-card { background-color: #2D3748; border: 1px solid #4A5568; color: #fff; }
      .review-form { background-color: #2D3748; border-radius: 8px; border: 1px solid #4A5568; margin-top: 1rem; }
      .review-form textarea { background-color: #1A202C; color: #fff; border-color: #4A5568; }
      .review-form textarea:focus { background-color: #1A202C; color: #fff; border-color: #DD6B20; box-shadow: none; }
    `;

    if (loading) {
        return <div className="product-detail-page text-center py-5"><Spinner animation="border" variant="light" /></div>;
    }
    if (!product) {
        return <div className="product-detail-page text-center py-5"><p>Product not found.</p></div>;
    }
    const productImages = Array.isArray(product.ProductUrl) ? product.ProductUrl : [product.ProductUrl];

    return (
        <>
        <NavaPro></NavaPro>
        
            <style>{styles}</style>
            <div className="product-detail-page">
                <Container className="py-5">
                    <nav className="breadcrumb-nav mb-4">
                        <a href="/">Home</a> &gt; <a href="/products">{product.ProductCategory}</a> &gt; <span>{product.ProductName}</span>
                    </nav>
                    <Row>
                        <Col md={6} className="mb-4">
                            <img src={productImages[activeIndex]} alt="Product" className="main-image" />
                            <div className="thumbnail-container">
                                {productImages.map((img, index) => (
                                    <img key={index} src={img} alt={`thumbnail ${index + 1}`}
                                        className={`thumbnail-img ${activeIndex === index ? 'active' : ''}`}
                                        onClick={() => setActiveIndex(index)} />
                                ))}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="product-category-text">{product.ProductCategory}</p>
                                    <h1 className="product-title">{product.ProductName}</h1>
                                </div>
                                <Button variant="link" className="p-0 fs-4 text-secondary"><i className="bi bi-heart"></i></Button>
                            </div>
                            <div className="d-flex align-items-center mb-3">
                                <span className="me-2">{renderStars(4.6)}</span>
                                <a href="#reviews" className="text-secondary">({backendReviews.length} reviews)</a>
                            </div>
                            <div className="d-flex align-items-baseline mb-4">
                                <span className="price">₹{product.ProductPrice}</span>
                                <span className="old-price">₹{(product.ProductPrice * 1.08).toFixed(0)}</span>
                                <span className="discount-badge">8% OFF</span>
                            </div>
                            <div className="seller-card d-flex justify-content-between align-items-center mb-4">
                                <div className="d-flex align-items-center">
                                    <div className="bg-warning rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        <i className="bi bi-shop fs-5"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0">{product.Vendor?.Business_Name || "BuildMart Pro"}</h6>
                                        <span className="text-secondary small">{renderStars(4.8)} 4.8</span>
                                    </div>
                                </div>
                                <Button variant="outline-secondary" size="sm">View Store</Button>
                            </div>
                            <div className="d-flex align-items-center mb-3">
                                <span className="me-3">Quantity:</span>
                                <Button variant="outline-secondary" onClick={() => handleQuantity(-1)} className="rounded-circle p-0" style={{width: '30px', height: '30px'}}>-</Button>
                                <span className="mx-3 fs-5">{quantity}</span>
                                <Button variant="outline-secondary" onClick={() => handleQuantity(1)} className="rounded-circle p-0" style={{width: '30px', height: '30px'}}>+</Button>
                            </div>
                            <Row className="g-2 mb-4">
                                <Col><Button className="w-100 btn-add-to-cart" size="lg" onClick={handleAddToCart}>Add to Cart</Button></Col>
                                <Col><Button className="w-100 btn-buy-now" size="lg">Buy Now</Button></Col>
                            </Row>
                            <div className="p-3 rounded" style={{border: '1px solid #2D3748'}}>
                                <p className="mb-2"><i className="bi bi-truck me-2 text-primary"></i> Free Delivery</p>
                                <p className="mb-2"><i className="bi bi-box-seam me-2 text-primary"></i> Delivery in 2-3 business days</p>
                                <p className="mb-0"><i className="bi bi-arrow-return-left me-2 text-primary"></i> 7 days return policy</p>
                            </div>
                        </Col>
                    </Row>
                    
                    <div className="mt-5">
                        <nav className="tab-nav mb-4">
                            <button className={`tab-button ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}><i className="bi bi-card-text me-2"></i>Product Details</button>
                            <button className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}><i className="bi bi-star me-2"></i>Reviews</button>
                            <button className={`tab-button ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')}><i className="bi bi-truck me-2"></i>Delivery & Returns</button>
                        </nav>
                        
                        <div>
                            {activeTab === 'details' && (
                                <div>
                                    <h5>Description</h5>
                                    <p className="text-secondary">{product.ProductDescription}</p>
                                    <h5 className="mt-4">Key Features</h5>
                                    <ul className="list-unstyled text-secondary">
                                        {keyFeatures.map((feature, i) => <li key={i}><i className="bi bi-check-circle-fill me-2 text-success"></i>{feature}</li>)}
                                    </ul>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="mb-0">Customer Reviews</h5>
                                        <Button className="btn-add-to-cart" onClick={() => setShowReviewForm(!showReviewForm)}>{showReviewForm ? 'Cancel' : 'Write Review'}</Button>
                                    </div>
                                    <AnimatePresence>
                                        {showReviewForm && (
                                            <motion.div className="review-form p-3 mb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                                <h6>Your Review</h6>
                                                <div className="mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className="bi bi-star-fill" style={{ fontSize: "1.5rem", color: i < reviewRating ? "#ffc107" : "#4A5568", cursor: "pointer", marginRight: '5px' }} onClick={() => setReviewRating(i + 1)} />
                                                    ))}
                                                </div>
                                                <Form.Control as="textarea" rows={3} placeholder="Write your review here..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="mb-2"/>
                                                <Button variant="primary" className="btn-add-to-cart" onClick={handleSubmitReview}>Submit Review</Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Row>
                                        {backendReviews.length > 0 ? backendReviews.slice().reverse().map((review, i) => (
                                            <Col md={4} key={i} className="mb-3">
                                                <div className="review-card p-3">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="bg-warning rounded-circle me-2 d-flex align-items-center justify-content-center text-dark fw-bold" style={{width: '40px', height: '40px'}}>
                                                            {review.customerName?.charAt(0).toUpperCase() || 'A'}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{review.customerName || `Anonymous`}</h6>
                                                            {renderStars(review.rating)}
                                                        </div>
                                                    </div>
                                                    <p className="text-secondary mb-0">{review.comment}</p>
                                                </div>
                                            </Col>
                                        )) : <p className="text-secondary">No reviews yet. Be the first to write one!</p>}
                                    </Row>
                                </div>
                            )}

                            {activeTab === 'delivery' && (
                                <Row>
                                    <Col md={6}>
                                        <h5>Delivery Information</h5>
                                        <ul className="list-unstyled text-secondary">
                                            <li className="mb-2"><i className="bi bi-truck me-2 text-primary"></i> <strong>Free Delivery:</strong> On orders above ₹500</li>
                                            <li className="mb-2"><i className="bi bi-clock me-2 text-primary"></i> <strong>Delivery Time:</strong> 2-3 business days</li>
                                            <li className="mb-2"><i className="bi bi-geo-alt me-2 text-primary"></i> <strong>Location:</strong> Mumbai and surrounding areas</li>
                                        </ul>
                                    </Col>
                                    <Col md={6}>
                                        <h5>Return Policy</h5>
                                        <ul className="list-unstyled text-secondary">
                                            <li className="mb-2"><i className="bi bi-calendar-check me-2 text-success"></i> <strong>7 Days Return:</strong> Return within 7 days of delivery</li>
                                            <li className="mb-2"><i className="bi bi-patch-check me-2 text-success"></i> <strong>Quality Guarantee:</strong> 100% quality assurance</li>
                                            <li className="mb-2"><i className="bi bi-headset me-2 text-success"></i> <strong>Customer Support:</strong> 24/7 customer support</li>
                                        </ul>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    </div>

                    <div className="mt-5">
                        <h4 className="mb-3">Related Products</h4>
                        <Row>
                            {relatedProducts.slice(0, 4).map(prod => (
                                <Col md={3} key={prod._id} className="mb-3">
                                    <Card className="related-product-card h-100">
                                        <Card.Img variant="top" src={prod.ProductUrl?.[0] || '/placeholder.png'} style={{ height: '200px', objectFit: 'cover' }} />
                                        <Card.Body>
                                            <Card.Title>{prod.ProductName}</Card.Title>
                                            <div className="d-flex align-items-center mb-2">{renderStars(4.5)} <span className="text-secondary ms-2 small">({Math.floor(Math.random() * 2000) + 500})</span></div>
                                            <Card.Text className="fs-5 fw-bold">₹{prod.ProductPrice}</Card.Text>
                                            <Button className="btn-add-to-cart w-100" onClick={() => navigate(`/product/${prod._id}`)}>View Details</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Container>
                <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
                    <Toast bg={toast.variant} onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={3000} autohide>
                        <Toast.Body className="text-white">{toast.message}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </div>
            <Footer></Footer>
        </>
    );
};

export default ProductPage;