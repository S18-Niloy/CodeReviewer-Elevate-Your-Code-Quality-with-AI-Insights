import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchReview();
  }, [id]);
  
  const fetchReview = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${id}`);
      setReview(response.data);
    } catch (error) {
      console.error('Error fetching review:', error);
      toast.error('Failed to load review');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await axios.delete(`${API}/reviews/${id}`);
      toast.success('Review deleted successfully');
      navigate('/history');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };
  
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'severity-critical',
      high: 'severity-high',
      medium: 'severity-medium',
      low: 'severity-low'
    };
    return colors[severity] || 'severity-low';
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" data-testid="loading-state">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading review...</p>
        </div>
      </div>
    );
  }
  
  if (!review) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" data-testid="not-found-state">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Review not found</p>
          <Button onClick={() => navigate('/history')} className="mt-4" data-testid="back-to-history-button">
            Back to History
          </Button>
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
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/history')}
                  data-testid="back-button"
                  className="hover:bg-accent hover:text-accent-foreground rounded-md transition-all active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-4xl font-black" data-testid="results-title">Code Review Results</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span data-testid="review-language">{review.language}</span>
                {review.filename && <span data-testid="review-filename">• {review.filename}</span>}
                <span data-testid="review-timestamp">• {new Date(review.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-testid="delete-review-button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-all active:scale-95"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          
          {/* Overall Score */}
          <Card className="p-8 mb-8 bg-card border border-border" data-testid="overall-score-card">
            <div className="text-center">
              <h2 className="text-lg font-medium text-muted-foreground mb-4">Overall Score</h2>
              <div className={`text-6xl font-black mb-4 ${getScoreColor(review.overall_score)}`} data-testid="overall-score">
                {review.overall_score}
                <span className="text-2xl">/100</span>
              </div>
              <Progress value={review.overall_score} className="h-3" data-testid="overall-score-progress" />
              <div className="mt-4 flex items-center justify-center gap-2">
                {review.overall_score >= 70 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Good Code Quality</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Needs Improvement</span>
                  </>
                )}
              </div>
            </div>
          </Card>
          
          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {review.results?.map((result, index) => (
              <Card key={index} className="p-6 bg-card border border-border" data-testid={`category-card-${index}`}>
                <h3 className="text-lg font-bold mb-4">{result.category}</h3>
                <div className={`text-4xl font-black mb-2 ${getScoreColor(result.score)}`} data-testid={`category-score-${index}`}>
                  {result.score}
                </div>
                <Progress value={result.score} className="h-2 mb-2" />
                <div className="text-sm text-muted-foreground" data-testid={`category-issues-count-${index}`}>
                  {result.issues?.length || 0} issues found
                </div>
              </Card>
            ))}
          </div>
          
          {/* Code and Issues */}
          <Card className="p-8 bg-card border border-border" data-testid="details-card">
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="mb-6" data-testid="results-tabs">
                <TabsTrigger value="code" data-testid="code-tab">Code</TabsTrigger>
                {review.results?.map((result, index) => (
                  <TabsTrigger key={index} value={result.category.toLowerCase()} data-testid={`tab-${result.category.toLowerCase()}`}>
                    {result.category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="code" data-testid="code-tab-content">
                <div className="code-editor overflow-x-auto">
                  <SyntaxHighlighter
                    language={review.language}
                    style={atomOneDark}
                    showLineNumbers
                    customStyle={{
                      background: '#0B1120',
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {review.code}
                  </SyntaxHighlighter>
                </div>
              </TabsContent>
              
              {review.results?.map((result, index) => (
                <TabsContent key={index} value={result.category.toLowerCase()} data-testid={`content-${result.category.toLowerCase()}`}>
                  {result.issues?.length > 0 ? (
                    <div className="space-y-4">
                      {result.issues.map((issue, issueIndex) => (
                        <Card
                          key={issueIndex}
                          className={`p-6 ${getSeverityColor(issue.severity)}`}
                          data-testid={`issue-card-${issueIndex}`}
                        >
                          <div className="flex items-start gap-4">
                            <Badge
                              variant="outline"
                              className="uppercase text-xs"
                              data-testid={`issue-severity-${issueIndex}`}
                            >
                              {issue.severity}
                            </Badge>
                            {issue.line && (
                              <Badge variant="outline" className="text-xs" data-testid={`issue-line-${issueIndex}`}>
                                Line {issue.line}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-bold mt-4 mb-2" data-testid={`issue-message-${issueIndex}`}>{issue.message}</h4>
                          <p className="text-sm opacity-90" data-testid={`issue-suggestion-${issueIndex}`}>
                            <strong>Suggestion:</strong> {issue.suggestion}
                          </p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12" data-testid={`no-issues-${result.category.toLowerCase()}`}>
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No issues found in this category</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;