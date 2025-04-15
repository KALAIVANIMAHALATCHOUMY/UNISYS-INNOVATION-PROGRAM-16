import * as React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

import Button from '@mui/material/Button';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';

import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import HomeIcon from '@mui/icons-material/Home';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import GrainIcon from '@mui/icons-material/Grain';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

function ProductCard({ title, description, owner = 'Dhaneshvar' }) {
  return (
    <Card variant="outlined" sx={{ maxWidth: 300, width: '100%', borderRadius: 3, boxShadow: 2 }}>
      <Box sx={{ p: 2 }}>
        {/* Title */}
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        {/* Owned By */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Owned By
          </Typography>
          <Tooltip title={`Created and Owned By ${owner}`}>
            <Chip
              avatar={<Avatar alt={owner} src="/static/images/avatar/1.jpg" />}
              label={owner}
              variant="outlined"
              sx={{ fontSize: '0.875rem' }}
              />
          </Tooltip>
        </Box>

        {/* Description */}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>

      <Divider />

      {/* Type Selection */}
      <Box sx={{ p: 2 }}>
        <Typography gutterBottom variant="body2" fontWeight={500}>
          Settings  
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title={`Chat with ${title}`}><Chip icon={<ChatIcon />} label="Chat" clickable /> </Tooltip>
          <Tooltip title={`Configure ${title}`}><Chip icon={<SettingsIcon />} label="Configure" variant="outlined" clickable /></Tooltip>
        </Stack>
      </Box>
    </Card>
  );
}

export default function IntroDivider() {

  const createdAgentsList = useSelector((state) => state.createdAgentsList);
  console.log("createdAgents", createdAgentsList);

  useEffect(() => {
    console.log("createdAgentsList", createdAgentsList);
  }, [createdAgentsList]);

  // // const cardData = [
  // //   { title: 'HR Agent', owner: 'Dhaneshvar' },
  // //   { title: 'Admin Agent', owner: 'Kalai' },
  // //   { title: 'Manager Agent', owner: 'Maha' },
  // //   { title: 'Agent', owner: 'Stridarane' },
  // //   { title: 'Agent', owner: 'Anand kumar' },
  // //   { title: 'Agent', owner: 'bodhi' },
  // // ];

  function handleClick(event) {
    event.preventDefault();
    console.info('You clicked a breadcrumb.');
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Gen AI Agent Builder for Enterprise Application
      </Typography>

      <Breadcrumbs aria-label="breadcrumb">
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="/"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="/flow"
        >
          <WhatshotIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Flow
        </Link>
        <Typography
          sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}
        >
          <GrainIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Agent Cards
        </Typography>
      </Breadcrumbs>

      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 3,
          justifyContent: 'center',
        }}
      >
        {createdAgentsList.map((item, idx) => (
          <ProductCard key={idx} title={item.applicationName} description={item.description} />
        ))}
      </Box>
    </Box>
  );
}
