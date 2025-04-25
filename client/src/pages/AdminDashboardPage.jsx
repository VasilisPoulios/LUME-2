import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Alert,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import FlagIcon from '@mui/icons-material/Flag';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import UsersTab from '../components/admin/UsersTab';
import OrganizersTab from '../components/admin/OrganizersTab';
import EventsTab from '../components/admin/EventsTab';

// TabPanel component to display content for each tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Helper function for tab accessibility
function a11yProps(index) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboardPage = ({ tab }) => {
  // Map the tab prop string to the tab index
  const getInitialTabIndex = () => {
    switch (tab) {
      case 'users':
        return 0;
      case 'organizers':
        return 1;
      case 'events':
        return 2;
      case 'categories':
        return 3;
      default:
        return 0;
    }
  };

  const [activeTab, setActiveTab] = useState(getInitialTabIndex());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(null);

  // Effect to handle tab changes via prop
  useEffect(() => {
    if (tab) {
      setActiveTab(getInitialTabIndex());
    }
  }, [tab]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset selected organizer when changing tabs
    if (newValue !== 2) { // Only reset if not going to Events tab
      setSelectedOrganizerId(null);
    }
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view events for an organizer
  const handleViewOrganizerEvents = (organizerId) => {
    setSelectedOrganizerId(organizerId);
    setActiveTab(2); // Switch to Events tab
  };

  // Load data based on selected tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let endpoint;
        
        // Determine which endpoint to call based on active tab
        switch (activeTab) {
          case 0: // Users tab
            endpoint = '/api/admin/users';
            const usersResponse = await axios.get(endpoint);
            setUsers(usersResponse.data.data || []);
            break;
            
          case 1: // Organizers tab
            endpoint = '/api/admin/organizers';
            const organizersResponse = await axios.get(endpoint);
            setOrganizers(organizersResponse.data.data || []);
            break;
            
          case 2: // Events tab
            endpoint = '/api/admin/events';
            const eventsResponse = await axios.get(endpoint);
            setEvents(eventsResponse.data.data || []);
            break;
            
          default:
            break;
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Check if user is authenticated and is an admin
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Admin Dashboard
      </Typography>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: theme.palette.background.paper }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="admin dashboard tabs"
          >
            <Tab 
              icon={<GroupIcon />} 
              label="Users" 
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab 
              icon={<VerifiedUserIcon />} 
              label="Organizers" 
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab 
              icon={<EventIcon />} 
              label={selectedOrganizerId ? "Organizer Events" : "Events"}
              iconPosition="start"
              sx={{ py: 2 }}
            />
            <Tab 
              icon={<FlagIcon />} 
              label="Reports" 
              iconPosition="start"
              sx={{ py: 2 }}
            />
          </Tabs>
        </Box>

        {/* Users Tab */}
        <TabPanel value={activeTab} index={0}>
          <UsersTab />
        </TabPanel>

        {/* Organizers Tab */}
        <TabPanel value={activeTab} index={1}>
          <OrganizersTab onViewEvents={handleViewOrganizerEvents} />
        </TabPanel>

        {/* Events Tab */}
        <TabPanel value={activeTab} index={2}>
          {selectedOrganizerId ? (
            <>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Events for Selected Organizer
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    cursor: 'pointer', 
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => setSelectedOrganizerId(null)}
                >
                  View All Events
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ mb: 3 }}>All Events</Typography>
          )}
          <EventsTab organizerId={selectedOrganizerId} />
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="body1">Reports tab content will go here</Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;
