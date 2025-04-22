import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  TextField, 
  Grid, 
  Alert, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import API from '../../api';
import { BASE_CATEGORIES, CATEGORY_MAPPING, getFrontendToBackendCategory } from '../../utils/categoryConfig';

const CategoryMigrationTool = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingData, setAnalyzingData] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});
  const [invalidCategories, setInvalidCategories] = useState([]);
  const [mappingOverrides, setMappingOverrides] = useState({});

  // Fetch all events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await API.get('/events/all');
      if (response.data.success) {
        setEvents(response.data.data || []);
        analyzeCategories(response.data.data || []);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error connecting to the server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Analyze categories in events
  const analyzeCategories = (eventData) => {
    setAnalyzingData(true);
    
    try {
      // Count occurrences of each category
      const categoryCount = {};
      const invalidCats = [];
      
      eventData.forEach(event => {
        const category = event.category;
        
        // Count occurrences
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        
        // Check if category is valid
        if (!BASE_CATEGORIES.includes(category) && !invalidCats.includes(category)) {
          invalidCats.push(category);
          
          // Initialize a default mapping if this is the first time we see this category
          if (!mappingOverrides[category]) {
            // Try to find a mapping from our standard mapping
            const suggestedMapping = CATEGORY_MAPPING[category] || 'Other';
            setMappingOverrides(prev => ({
              ...prev,
              [category]: suggestedMapping
            }));
          }
        }
      });
      
      setCategoryStats(categoryCount);
      setInvalidCategories(invalidCats);
    } catch (err) {
      console.error('Error analyzing categories:', err);
      setError('Error analyzing event data: ' + err.message);
    } finally {
      setAnalyzingData(false);
    }
  };

  // Handle mapping override changes
  const handleMappingChange = (category, newMapping) => {
    setMappingOverrides(prev => ({
      ...prev,
      [category]: newMapping
    }));
  };

  // Migrate categories
  const migrateCategories = async () => {
    setMigrating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Only update events with invalid categories
      const eventsToUpdate = events.filter(event => 
        invalidCategories.includes(event.category)
      );
      
      if (eventsToUpdate.length === 0) {
        setSuccess('No events need migration');
        setMigrating(false);
        return;
      }
      
      // Process events in batches to avoid overwhelming the server
      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < eventsToUpdate.length; i += batchSize) {
        const batch = eventsToUpdate.slice(i, i + batchSize);
        const updates = batch.map(event => {
          const oldCategory = event.category;
          const newCategory = mappingOverrides[oldCategory] || CATEGORY_MAPPING[oldCategory] || 'Other';
          
          return API.put(`/events/${event._id}`, { category: newCategory });
        });
        
        // Process batch concurrently
        const results = await Promise.allSettled(updates);
        
        // Count successes and failures
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to update event:', result.reason);
          }
        });
      }
      
      setSuccess(`Migration completed. ${successCount} events updated successfully. ${errorCount} events failed to update.`);
      
      // Re-fetch events to update the UI
      fetchEvents();
    } catch (err) {
      console.error('Error migrating categories:', err);
      setError('Error during migration: ' + err.message);
    } finally {
      setMigrating(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Category Migration Tool
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This tool helps migrate event categories to the new standardized system.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchEvents}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Refresh Data'}
        </Button>
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={migrateCategories}
          disabled={migrating || loading || invalidCategories.length === 0}
        >
          {migrating ? <CircularProgress size={24} /> : 'Migrate Categories'}
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Left column: Stats & Analysis */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Category Analysis
          </Typography>
          
          {analyzingData ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography>Analyzing data...</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                Found {events.length} events with {Object.keys(categoryStats).length} different categories.
              </Typography>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Current Categories:
              </Typography>
              
              <List>
                {Object.entries(categoryStats).map(([category, count]) => (
                  <ListItem key={category} disablePadding sx={{ mb: 1 }}>
                    <Chip 
                      label={category} 
                      color={BASE_CATEGORIES.includes(category) ? "primary" : "error"}
                      size="small"
                      sx={{ mr: 2, minWidth: 120 }}
                    />
                    <ListItemText 
                      primary={`${count} events`} 
                      secondary={BASE_CATEGORIES.includes(category) 
                        ? "Valid category" 
                        : "Needs migration"
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Grid>
        
        {/* Right column: Category Mapping */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Category Mapping
          </Typography>
          
          {invalidCategories.length === 0 ? (
            <Alert severity="success">
              All events have valid categories. No migration needed.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                The following categories need to be mapped to the new system. Select the appropriate replacement for each.
              </Typography>
              
              <List>
                {invalidCategories.map((category) => (
                  <ListItem key={category} sx={{ mb: 2 }}>
                    <ListItemText 
                      primary={category} 
                      secondary={`${categoryStats[category] || 0} events`}
                      sx={{ mr: 2, minWidth: 120 }}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Map to</InputLabel>
                      <Select
                        value={mappingOverrides[category] || ''}
                        onChange={(e) => handleMappingChange(category, e.target.value)}
                        label="Map to"
                        size="small"
                      >
                        {BASE_CATEGORIES.map((validCategory) => (
                          <MenuItem key={validCategory} value={validCategory}>
                            {validCategory}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CategoryMigrationTool; 