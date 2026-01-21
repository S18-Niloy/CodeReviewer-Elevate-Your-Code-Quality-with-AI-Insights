import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Trash2, Search, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HistoryPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await axios.delete(`${API}/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const filteredReviews = reviews.filter(review => {
    const search = searchTerm.toLowerCase();
    return (
      review.language?.toLowerCase().includes(search) ||
      review.filename?.toLowerCase().includes(search)
    );
  });
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" data-testid="loading-state">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2" data-testid="history-title">Review History</h1>
            <p className="text-muted-foreground text-lg">View and manage your past code reviews</p>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by language or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-input"
                className="pl-10 bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent rounded-md"
              />
            </div>
          </div>
          
          {/* Reviews Grid */}
          {filteredReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="reviews-grid">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  data-testid={`review-card-${index}`}
                >
                  <Card
                    className="p-6 bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col"
                    onClick={() => navigate(`/results/${review.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className="text-xs" data-testid={`review-language-${index}`}>
                          {review.language}
                        </Badge>
                      </div>
                      <div className={`text-2xl font-black ${getScoreColor(review.overall_score)}`} data-testid={`review-score-${index}`}>
                        {review.overall_score}
                      </div>
                    </div>
                    
                    {review.filename && (
                      <h3 className="font-bold mb-2 truncate" data-testid={`review-filename-${index}`}>
                        {review.filename}
                      </h3>
                    )}
                    
                    <p className="text-sm text-muted-foreground mb-4 flex-grow" data-testid={`review-timestamp-${index}`}>
                      {new Date(review.timestamp).toLocaleString()}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {review.results?.slice(0, 4).map((result, idx) => (
                        <div key={idx} className="text-xs" data-testid={`review-category-${index}-${idx}`}>
                          <span className="text-muted-foreground">{result.category}: </span>
                          <span className={`font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/results/${review.id}`)}
                        data-testid={`view-button-${index}`}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-all active:scale-95"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDelete(review.id, e)}
                        data-testid={`delete-button-${index}`}
                        className="bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground border border-border rounded-md transition-all active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 bg-card border border-border text-center" data-testid="empty-state">
              <FileCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No reviews found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term' : 'Start analyzing code to see your review history'}
              </p>
              <Button
                onClick={() => navigate('/analyze')}
                data-testid="analyze-new-button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-md transition-all active:scale-95"
              >
                Analyze Code
              </Button>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HistoryPage;