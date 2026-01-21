import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Code, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalyzePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'
  ];
  
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result || '');
      setFilename(file.name);
      
      // Auto-detect language from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'cc': 'cpp',
        'c': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',
        'kt': 'kotlin'
      };
      if (ext && langMap[ext]) {
        setLanguage(langMap[ext]);
      }
    };
    reader.readAsText(file);
  };
  
  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please enter or upload code to analyze');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/reviews/analyze`, {
        code,
        language,
        filename: filename || undefined
      });
      
      toast.success('Analysis completed!');
      navigate(`/results/${response.data.id}`);
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast.error('Failed to analyze code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2" data-testid="analyze-page-title">Analyze Your Code</h1>
            <p className="text-muted-foreground text-lg">Upload a file or paste your code below</p>
          </div>
          
          <Card className="p-8 bg-card border border-border" data-testid="code-input-card">
            <div className="space-y-6">
              {/* Language and File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language" className="text-sm font-medium mb-2 block">
                    Programming Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" data-testid="language-select" className="bg-input border-border focus:ring-2 focus:ring-ring focus:border-transparent rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang} data-testid={`language-option-${lang}`}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium mb-2 block">
                    Upload File (Optional)
                  </Label>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      data-testid="file-upload-input"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      data-testid="file-upload-button"
                      className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-md transition-all active:scale-95"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {filename || 'Choose File'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Code Editor */}
              <div>
                <Label htmlFor="code-input" className="text-sm font-medium mb-2 block">
                  Code
                </Label>
                <Textarea
                  id="code-input"
                  data-testid="code-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="code-editor min-h-[400px] font-mono text-sm resize-none"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !code.trim()}
                  data-testid="analyze-submit-button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.5)] font-medium rounded-md transition-all active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Code className="mr-2 h-4 w-4" />
                      Analyze Code
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCode('');
                    setFilename('');
                  }}
                  disabled={loading}
                  data-testid="clear-button"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border rounded-md transition-all active:scale-95"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyzePage;